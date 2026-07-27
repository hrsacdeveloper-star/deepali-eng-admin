import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  parent_id: z.string().optional().nullable(),
  display_order: z.coerce.number(),
  is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', description: '', image: '', parent_id: null, display_order: 0, is_active: true },
  });

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('product_categories').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch categories');
    else setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const payload = { ...data, parent_id: data.parent_id === 'none' ? null : data.parent_id };
      if (editingId) {
        const { error } = await supabase.from('product_categories').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Category updated');
      } else {
        const { error } = await supabase.from('product_categories').insert([payload]);
        if (error) throw error;
        toast.success('Category added');
      }
      setOpen(false);
      fetchCategories();
    } catch (err: any) {
      if (err.code === '23505' && err.message?.includes('slug')) {
        toast.error('The slug must be unique. This slug is already in use.');
      } else {
        toast.error(err.message || 'An error occurred while saving.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category deleted');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (cat: any) => {
    setEditingId(cat.id);
    form.reset({ 
      name: cat.name, 
      slug: cat.slug, 
      description: cat.description || '', 
      image: cat.image || '', 
      parent_id: cat.parent_id || 'none',
      display_order: cat.display_order,
      is_active: cat.is_active
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: '', slug: '', description: '', image: '', parent_id: 'none', display_order: 0, is_active: true });
    setOpen(true);
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const val = e.target.value;
    onChange(val);
    if (!editingId) {
      form.setValue('slug', val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Categories</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} onChange={e => handleNameChange(e, field.onChange)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="parent_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select parent category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {categories.filter(c => c.id !== editingId).map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="image" render={({ field }) => (
                  <FormItem><FormLabel>Image</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="display_order" render={({ field }) => (
                    <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="is_active" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5"><FormLabel>Active Status</FormLabel></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full">Save Category</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Slug</TableHead>
              <TableHead className="whitespace-nowrap">Parent</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No categories found</TableCell></TableRow>
            ) : (
              categories.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium whitespace-nowrap">{cat.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{cat.slug}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {cat.parent_id ? categories.find(c => c.id === cat.parent_id)?.name : '-'}
                  </TableCell>
                  <TableCell className="text-center">{cat.display_order}</TableCell>
                  <TableCell className="text-center">{cat.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

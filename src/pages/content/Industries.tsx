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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const indSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  display_order: z.coerce.number(),
  is_active: z.boolean(),
});

type IndFormValues = z.infer<typeof indSchema>;

export default function Industries() {
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<IndFormValues>({
    resolver: zodResolver(indSchema),
    defaultValues: { name: '', slug: '', description: '', image: '', display_order: 0, is_active: true },
  });

  const fetchIndustries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('industries').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch industries');
    else setIndustries(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  const onSubmit = async (data: IndFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('industries').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('Industry updated');
      } else {
        const { error } = await supabase.from('industries').insert([data]);
        if (error) throw error;
        toast.success('Industry added');
      }
      setOpen(false);
      fetchIndustries();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this industry?')) return;
    try {
      const { error } = await supabase.from('industries').delete().eq('id', id);
      if (error) throw error;
      toast.success('Industry deleted');
      fetchIndustries();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (ind: any) => {
    setEditingId(ind.id);
    form.reset({ 
      name: ind.name, 
      slug: ind.slug, 
      description: ind.description || '', 
      image: ind.image || '', 
      display_order: ind.display_order,
      is_active: ind.is_active
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: '', slug: '', description: '', image: '', display_order: 0, is_active: true });
    setOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const val = e.target.value;
    onChange(val);
    if (!editingId) {
      form.setValue('slug', val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Industries We Serve</h2>
          <p className="text-muted-foreground">Manage industries that use your products.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Industry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Industry' : 'Add New Industry'}</DialogTitle>
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
                <Button type="submit" className="w-full">Save Industry</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] whitespace-nowrap">Image</TableHead>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Slug</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : industries.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No industries found</TableCell></TableRow>
            ) : (
              industries.map(ind => (
                <TableRow key={ind.id}>
                  <TableCell className="whitespace-nowrap">
                    {ind.image ? (
                      <img src={ind.image} alt={ind.name} className="w-12 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">NA</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{ind.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{ind.slug}</TableCell>
                  <TableCell className="text-center">{ind.display_order}</TableCell>
                  <TableCell className="text-center">{ind.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(ind)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ind.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

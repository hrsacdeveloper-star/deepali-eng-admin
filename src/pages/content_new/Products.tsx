import React, { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const formSchema = z.object({
  category_id: z.string().optional().nullable(),
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  brief_description: z.string().optional().nullable(),
  technical_parameters: z.record(z.string()).optional().nullable(),
  applications: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  order_index: z.coerce.number(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Products() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: '',
      name: '',
      slug: '',
      brief_description: '',
      technical_parameters: {},
      applications: '',
      image_url: '',
      order_index: 0,
      is_active: false,
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      setDataList(data || []);
      const { data: catData } = await supabase.from('product_categories').select('id, name');
      setCategories(catData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const cleanValues = { ...values } as any;
      // transform specs array into record for storage
      const specsRecord: Record<string, string> = {};
      specs.forEach(s => { if (s.key) specsRecord[s.key] = s.value; });
      cleanValues.technical_parameters = Object.keys(specsRecord).length ? specsRecord : null;
      Object.keys(cleanValues).forEach(k => {
        if (cleanValues[k] === '') cleanValues[k] = null;
      });

      if (editingId) {
        const { error } = await supabase.from('products').update(cleanValues).eq('id', editingId);
        if (error) throw error;
        toast.success('Products updated successfully');
      } else {
        const { error } = await supabase.from('products').insert([cleanValues]);
        if (error) throw error;
        toast.success('Products created successfully');
      }
      setOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Item deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    form.reset({
      category_id: item.category_id || '',
      name: item.name || '',
      slug: item.slug || '',
      brief_description: item.brief_description || '',
      technical_parameters: item.technical_parameters || {},
      applications: item.applications || '',
      image_url: item.image_url || '',
      order_index: item.order_index ?? 0,
      is_active: item.is_active ?? false,
    });
    // parse technical parameters into specs array for editing
    const s: { key: string, value: string }[] = [];
    if (item.technical_parameters) {
      Object.entries(item.technical_parameters).forEach(([k, v]) => s.push({ key: k, value: v as string }));
    }
    setSpecs(s);
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    form.reset({
      category_id: '',
      name: '',
      slug: '',
      brief_description: '',
      technical_parameters: {},
      applications: '',
      image_url: '',
      order_index: 0,
      is_active: false,
    });
    setSpecs([]);
    setOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}><Plus className="w-4 h-4 mr-2" /> Add New</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Products</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="category_id" render={({ field }) => (
                  <FormItem>
                    <Label>Category</Label>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <Label>Name</Label>
                    <FormControl><Input {...field} value={field.value || ''} onChange={(e) => {
                      field.onChange(e);
                      const generatedSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      form.setValue('slug', generatedSlug);
                    }} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <Label>Slug</Label>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="brief_description" render={({ field }) => (
                  <FormItem>
                    <Label>Brief Description</Label>
                    <FormControl><Textarea {...field} value={field.value || ''} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="space-y-2">
                  <Label>Technical Parameters</Label>
                  {specs.map((spec, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="Key (e.g. Type)" value={spec.key} onChange={e => {
                        const newSpecs = [...specs];
                        newSpecs[i].key = e.target.value;
                        setSpecs(newSpecs);
                      }} />
                      <Input placeholder="Value (e.g. Heavy Duty)" value={spec.value} onChange={e => {
                        const newSpecs = [...specs];
                        newSpecs[i].value = e.target.value;
                        setSpecs(newSpecs);
                      }} />
                      <Button type="button" variant="ghost" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => setSpecs([...specs, { key: '', value: '' }])}>Add Parameter</Button>
                </div>
                <FormField control={form.control} name="applications" render={({ field }) => (
                  <FormItem>
                    <Label>Applications</Label>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="image_url" render={({ field }) => (
                  <FormItem>
                    <Label>Image Url</Label>
                    <FormControl>
                      <FileUpload value={field.value || ''} onChange={field.onChange} bucket="images" folder="image_urls" accept="image/*" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="order_index" render={({ field }) => (
                  <FormItem>
                    <Label>Order Index</Label>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="is_active" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5"><Label>Is Active</Label></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                <div className="flex justify-end pt-4">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Brief Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10} className="text-center">Loading...</TableCell></TableRow>
            ) : dataList.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center">No data found</TableCell></TableRow>
            ) : (
              dataList.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-xs truncate">{categories.find(c => c.id === item.category_id)?.name || item.category_id}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.slug}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.brief_description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
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

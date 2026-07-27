import React, { useState, useEffect } from 'react';
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

const formSchema = z.object({
  page_path: z.string().min(1, 'Required'),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
  og_image_url: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SeoMeta() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      page_path: '',
      title: '',
      description: '',
      keywords: '',
      og_image_url: '',
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('seo_meta').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      setDataList(data || []);
    } catch (error: any) {
      toast.error(error.message);
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
      Object.keys(cleanValues).forEach(k => {
        if (cleanValues[k] === '') cleanValues[k] = null;
      });

      if (editingId) {
        const { error } = await supabase.from('seo_meta').update(cleanValues).eq('id', editingId);
        if (error) throw error;
        toast.success('Seo Meta updated successfully');
      } else {
        const { error } = await supabase.from('seo_meta').insert([cleanValues]);
        if (error) throw error;
        toast.success('Seo Meta created successfully');
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
      const { error } = await supabase.from('seo_meta').delete().eq('id', id);
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
      page_path: item.page_path || '',
      title: item.title || '',
      description: item.description || '',
      keywords: item.keywords || '',
      og_image_url: item.og_image_url || '',
    });
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    form.reset({
      page_path: '',
      title: '',
      description: '',
      keywords: '',
      og_image_url: '',
    });
    setOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seo Meta Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}><Plus className="w-4 h-4 mr-2" /> Add New</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Seo Meta</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="page_path" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Path</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea {...field} value={field.value || ''} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="keywords" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="og_image_url" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Og Image Url</FormLabel>
                    <FormControl>
                      <FileUpload value={field.value || ''} onChange={field.onChange} bucket="images" folder="og_image_urls" accept="image/*" />
                    </FormControl>
                    <FormMessage />
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
              <TableHead>Page Path</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Keywords</TableHead>
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
                  <TableCell className="max-w-xs truncate">{item.page_path}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.keywords}</TableCell>
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

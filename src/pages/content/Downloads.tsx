import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger as RadixTabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, File, Download } from 'lucide-react';

const fileSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category_id: z.string().optional().nullable(),
  file_url: z.string().min(1, 'File is required'),
  description: z.string().optional(),
  display_order: z.coerce.number(),
});

type FileFormValues = z.infer<typeof fileSchema>;

export default function Downloads() {
  const [files, setFiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
    defaultValues: { title: '', category_id: null, file_url: '', description: '', display_order: 0 },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, cRes] = await Promise.all([
        supabase.from('downloads').select('*, download_categories(name)').order('display_order', { ascending: true }),
        supabase.from('download_categories').select('*').order('display_order', { ascending: true })
      ]);
      setFiles(fRes.data || []);
      setCategories(cRes.data || []);
    } catch (err: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: FileFormValues) => {
    try {
      const payload = { ...data, category_id: data.category_id === 'none' ? null : data.category_id };
      if (editingId) {
        const { error } = await supabase.from('downloads').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('File updated');
      } else {
        const { error } = await supabase.from('downloads').insert([payload]);
        if (error) throw error;
        toast.success('File added');
      }
      setOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const { error } = await supabase.from('downloads').delete().eq('id', id);
      if (error) throw error;
      toast.success('File deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (file: any) => {
    setEditingId(file.id);
    form.reset({ 
      title: file.title, 
      category_id: file.category_id || 'none',
      file_url: file.file_url,
      description: file.description || '',
      display_order: file.display_order
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: '', category_id: 'none', file_url: '', description: '', display_order: 0 });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Downloads</h2>
          <p className="text-muted-foreground">Manage downloadable resources (Catalogs, Brochures, Forms).</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add File</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit File' : 'Add New File'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="category_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'none'}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Uncategorized</SelectItem>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="file_url" render={({ field }) => (
                  <FormItem><FormLabel>Upload File *</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="display_order" render={({ field }) => (
                  <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Save File</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] whitespace-nowrap">File</TableHead>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap text-center">Downloads</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : files.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No files found</TableCell></TableRow>
            ) : (
              files.map(file => (
                <TableRow key={file.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-blue-500"><File className="w-5 h-5" /></div>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{file.title}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{file.download_categories?.name || '-'}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{file.download_count}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{file.display_order}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" asChild title="Download"><a href={file.file_url} target="_blank" rel="noreferrer"><Download className="w-4 h-4 text-muted-foreground" /></a></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(file)} title="Edit"><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(file.id)} title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

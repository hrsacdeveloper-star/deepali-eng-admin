import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const seoSchema = z.object({
  route_name: z.string().min(1, 'Route name/Path is required'),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  og_image: z.string().optional(),
});

type SEOTabValues = z.infer<typeof seoSchema>;

export function SEOTab() {
  const [seos, setSeos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<SEOTabValues>({
    resolver: zodResolver(seoSchema),
    defaultValues: { route_name: '/', meta_title: '', meta_description: '', meta_keywords: '', og_image: '' },
  });

  const fetchSeos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('seo_meta').select('*').order('route_name', { ascending: true });
    if (error) toast.error('Failed to fetch SEO meta');
    else setSeos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSeos();
  }, []);

  const onSubmit = async (data: SEOTabValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('seo_meta').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('SEO updated');
      } else {
        const { error } = await supabase.from('seo_meta').insert([data]);
        if (error) throw error;
        toast.success('SEO added');
      }
      setOpen(false);
      fetchSeos();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this SEO configuration?')) return;
    try {
      const { error } = await supabase.from('seo_meta').delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted');
      fetchSeos();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (seo: any) => {
    setEditingId(seo.id);
    form.reset({ 
      route_name: seo.route_name, 
      meta_title: seo.meta_title || '', 
      meta_description: seo.meta_description || '',
      meta_keywords: seo.meta_keywords || '',
      og_image: seo.og_image || ''
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ route_name: '/', meta_title: '', meta_description: '', meta_keywords: '', og_image: '' });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">SEO Meta Data</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add SEO Data</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit SEO' : 'Add New SEO Data'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="route_name" render={({ field }) => (
                  <FormItem><FormLabel>Route Path (e.g. /, /about, /products) *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="meta_title" render={({ field }) => (
                  <FormItem><FormLabel>Meta Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="meta_description" render={({ field }) => (
                  <FormItem><FormLabel>Meta Description</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="meta_keywords" render={({ field }) => (
                  <FormItem><FormLabel>Meta Keywords (Comma separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="og_image" render={({ field }) => (
                  <FormItem><FormLabel>Open Graph Image (Social Sharing)</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Save SEO Data</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Route</TableHead>
              <TableHead className="whitespace-nowrap">Meta Title</TableHead>
              <TableHead className="whitespace-nowrap">Meta Description</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : seos.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No SEO config found</TableCell></TableRow>
            ) : (
              seos.map(seo => (
                <TableRow key={seo.id}>
                  <TableCell className="font-medium whitespace-nowrap">{seo.route_name}</TableCell>
                  <TableCell className="whitespace-nowrap max-w-[200px] truncate">{seo.meta_title || '-'}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{seo.meta_description || '-'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(seo)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(seo.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

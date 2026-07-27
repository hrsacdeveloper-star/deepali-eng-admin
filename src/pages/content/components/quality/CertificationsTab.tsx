import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, File } from 'lucide-react';

const certSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  issuing_authority: z.string().optional(),
  valid_until: z.string().optional(),
  certificate_media: z.string().optional(),
  display_order: z.coerce.number(),
  is_active: z.boolean(),
});

type CertFormValues = z.infer<typeof certSchema>;

export function CertificationsTab() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CertFormValues>({
    resolver: zodResolver(certSchema),
    defaultValues: { title: '', issuing_authority: '', valid_until: '', certificate_media: '', display_order: 0, is_active: true },
  });

  const fetchCerts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('certificates').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch certificates');
    else setCerts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const onSubmit = async (data: CertFormValues) => {
    try {
      const payload = { ...data, valid_until: data.valid_until || null };
      if (editingId) {
        const { error } = await supabase.from('certificates').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Certificate updated');
      } else {
        const { error } = await supabase.from('certificates').insert([payload]);
        if (error) throw error;
        toast.success('Certificate added');
      }
      setOpen(false);
      fetchCerts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Certificate deleted');
      fetchCerts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (cert: any) => {
    setEditingId(cert.id);
    form.reset({ 
      title: cert.title, 
      issuing_authority: cert.issuing_authority || '', 
      valid_until: cert.valid_until || '', 
      certificate_media: cert.certificate_media || '', 
      display_order: cert.display_order,
      is_active: cert.is_active
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: '', issuing_authority: '', valid_until: '', certificate_media: '', display_order: 0, is_active: true });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Certifications</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Certificate</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Certificate' : 'Add New Certificate'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="issuing_authority" render={({ field }) => (
                    <FormItem><FormLabel>Issuing Authority</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="valid_until" render={({ field }) => (
                    <FormItem><FormLabel>Valid Until</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="certificate_media" render={({ field }) => (
                  <FormItem><FormLabel>Certificate Media (Image/PDF)</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} accept="image/*,.pdf" /></FormControl><FormMessage /></FormItem>
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
                <Button type="submit" className="w-full">Save Certificate</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] whitespace-nowrap">Media</TableHead>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Authority</TableHead>
              <TableHead className="whitespace-nowrap">Valid Until</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : certs.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No certificates found</TableCell></TableRow>
            ) : (
              certs.map(cert => (
                <TableRow key={cert.id}>
                  <TableCell className="whitespace-nowrap">
                    {cert.certificate_media ? (
                      cert.certificate_media.endsWith('.pdf') ? (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-blue-500"><File className="w-5 h-5" /></div>
                      ) : (
                        <img src={cert.certificate_media} alt={cert.title} className="w-12 h-10 object-cover rounded" />
                      )
                    ) : (
                      <div className="w-12 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">NA</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{cert.title}</TableCell>
                  <TableCell className="whitespace-nowrap">{cert.issuing_authority}</TableCell>
                  <TableCell className="whitespace-nowrap">{cert.valid_until ? new Date(cert.valid_until).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-center">{cert.display_order}</TableCell>
                  <TableCell className="text-center">{cert.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cert)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cert.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

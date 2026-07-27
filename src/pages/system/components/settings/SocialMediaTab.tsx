import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const socialSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
  display_order: z.coerce.number(),
});

type SocialFormValues = z.infer<typeof socialSchema>;

export function SocialMediaTab() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<SocialFormValues>({
    resolver: zodResolver(socialSchema),
    defaultValues: { platform: 'LinkedIn', url: '', display_order: 0 },
  });

  const fetchLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('social_media_links').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch social links');
    else setLinks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const onSubmit = async (data: SocialFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('social_media_links').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('Link updated');
      } else {
        const { error } = await supabase.from('social_media_links').insert([data]);
        if (error) throw error;
        toast.success('Link added');
      }
      setOpen(false);
      fetchLinks();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      const { error } = await supabase.from('social_media_links').delete().eq('id', id);
      if (error) throw error;
      toast.success('Link deleted');
      fetchLinks();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (link: any) => {
    setEditingId(link.id);
    form.reset({ 
      platform: link.platform, 
      url: link.url, 
      display_order: link.display_order
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ platform: 'LinkedIn', url: '', display_order: 0 });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Social Media Links</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Link</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Link' : 'Add New Link'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="platform" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Twitter">Twitter (X)</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="YouTube">YouTube</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="url" render={({ field }) => (
                  <FormItem><FormLabel>URL *</FormLabel><FormControl><Input type="url" placeholder="https://" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="display_order" render={({ field }) => (
                  <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Save Link</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Platform</TableHead>
              <TableHead className="whitespace-nowrap">URL</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : links.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No links found</TableCell></TableRow>
            ) : (
              links.map(link => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium whitespace-nowrap">{link.platform}</TableCell>
                  <TableCell className="whitespace-nowrap"><a href={link.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{link.url}</a></TableCell>
                  <TableCell className="text-center">{link.display_order}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(link)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().optional(),
  display_order: z.coerce.number(),
  is_active: z.boolean(),
});

type FaqFormValues = z.infer<typeof faqSchema>;

export default function FAQs() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: { question: '', answer: '', category: '', display_order: 0, is_active: true },
  });

  const fetchFaqs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('faqs').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch FAQs');
    else setFaqs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const onSubmit = async (data: FaqFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('faqs').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('FAQ updated');
      } else {
        const { error } = await supabase.from('faqs').insert([data]);
        if (error) throw error;
        toast.success('FAQ added');
      }
      setOpen(false);
      fetchFaqs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (faq: any) => {
    setEditingId(faq.id);
    form.reset({ 
      question: faq.question, 
      answer: faq.answer, 
      category: faq.category || '', 
      display_order: faq.display_order,
      is_active: faq.is_active
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ question: '', answer: '', category: '', display_order: 0, is_active: true });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">FAQs</h2>
          <p className="text-muted-foreground">Manage Frequently Asked Questions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="question" render={({ field }) => (
                  <FormItem><FormLabel>Question *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="answer" render={({ field }) => (
                  <FormItem><FormLabel>Answer *</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} placeholder="e.g. Products, Shipping, General" /></FormControl><FormMessage /></FormItem>
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
                <Button type="submit" className="w-full">Save FAQ</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Question</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : faqs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No FAQs found</TableCell></TableRow>
            ) : (
              faqs.map(faq => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">{faq.question}</TableCell>
                  <TableCell className="whitespace-nowrap">{faq.category || '-'}</TableCell>
                  <TableCell className="text-center">{faq.display_order}</TableCell>
                  <TableCell className="text-center">{faq.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(faq)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

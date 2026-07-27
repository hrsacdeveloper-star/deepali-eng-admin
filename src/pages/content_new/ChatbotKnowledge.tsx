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
  question: z.string().min(1, 'Required'),
  answer: z.string().min(1, 'Required'),
  category: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ChatbotKnowledge() {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: '',
      keywords: '',
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('chatbot_knowledge').select('*').order('created_at', { ascending: false }).limit(100);
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
        const { error } = await supabase.from('chatbot_knowledge').update(cleanValues).eq('id', editingId);
        if (error) throw error;
        toast.success('Chatbot Knowledge updated successfully');
      } else {
        const { error } = await supabase.from('chatbot_knowledge').insert([cleanValues]);
        if (error) throw error;
        toast.success('Chatbot Knowledge created successfully');
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
      const { error } = await supabase.from('chatbot_knowledge').delete().eq('id', id);
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
      question: item.question || '',
      answer: item.answer || '',
      category: item.category || '',
      keywords: item.keywords || '',
    });
    setOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    form.reset({
      question: '',
      answer: '',
      category: '',
      keywords: '',
    });
    setOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chatbot Knowledge Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}><Plus className="w-4 h-4 mr-2" /> Add New</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Chatbot Knowledge</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="question" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="answer" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl><Textarea {...field} value={field.value || ''} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input {...field} value={field.value || ''} /></FormControl>
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
              <TableHead>Question</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Category</TableHead>
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
                  <TableCell className="max-w-xs truncate">{item.question}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.answer}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.category}</TableCell>
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

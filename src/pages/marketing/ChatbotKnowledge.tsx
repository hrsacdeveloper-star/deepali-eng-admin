import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, Search } from 'lucide-react';

const kbSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().optional(),
  keywords: z.string().optional(),
});

type KbFormValues = z.infer<typeof kbSchema>;

export default function ChatbotKnowledge() {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<KbFormValues>({
    resolver: zodResolver(kbSchema),
    defaultValues: { question: '', answer: '', category: '', keywords: '' },
  });

  const fetchKnowledge = async () => {
    setLoading(true);
    let query = supabase.from('chatbot_knowledge').select('*').order('created_at', { ascending: false });
    
    if (searchTerm) {
      query = query.or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%,keywords.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) toast.error('Failed to fetch knowledge base');
    else setKnowledge(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchKnowledge();
  }, [searchTerm]);

  const onSubmit = async (data: KbFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('chatbot_knowledge').update({
          ...data, updated_at: new Date().toISOString()
        }).eq('id', editingId);
        if (error) throw error;
        toast.success('Knowledge updated');
      } else {
        const { error } = await supabase.from('chatbot_knowledge').insert([data]);
        if (error) throw error;
        toast.success('Knowledge added');
      }
      setOpen(false);
      fetchKnowledge();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const { error } = await supabase.from('chatbot_knowledge').delete().eq('id', id);
      if (error) throw error;
      toast.success('Record deleted');
      fetchKnowledge();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (kb: any) => {
    setEditingId(kb.id);
    form.reset({ 
      question: kb.question, 
      answer: kb.answer, 
      category: kb.category || '', 
      keywords: kb.keywords || ''
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ question: '', answer: '', category: '', keywords: '' });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">Manage Q&A pairs for the Chatbot.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Q&A</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Q&A' : 'Add New Q&A'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="question" render={({ field }) => (
                  <FormItem><FormLabel>Question *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="answer" render={({ field }) => (
                  <FormItem><FormLabel>Answer *</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="keywords" render={({ field }) => (
                    <FormItem><FormLabel>Keywords (comma separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full">Save Q&A</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search questions, answers, keywords..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Question</TableHead>
              <TableHead className="whitespace-nowrap">Answer</TableHead>
              <TableHead className="whitespace-nowrap">Category</TableHead>
              <TableHead className="whitespace-nowrap">Keywords</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : knowledge.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No records found</TableCell></TableRow>
            ) : (
              knowledge.map(kb => (
                <TableRow key={kb.id}>
                  <TableCell className="font-medium max-w-[200px] truncate" title={kb.question}>{kb.question}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={kb.answer}>{kb.answer}</TableCell>
                  <TableCell className="whitespace-nowrap">{kb.category || '-'}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={kb.keywords}>{kb.keywords || '-'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(kb)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(kb.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

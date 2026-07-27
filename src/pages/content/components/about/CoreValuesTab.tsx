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
import { Trash2, Edit, Plus } from 'lucide-react';

const valuesSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  display_order: z.coerce.number(),
});

type ValuesFormValues = z.infer<typeof valuesSchema>;

export function CoreValuesTab() {
  const [values, setValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ValuesFormValues>({
    resolver: zodResolver(valuesSchema),
    defaultValues: { title: '', description: '', icon: '', display_order: 0 },
  });

  const fetchValues = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('core_values').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch core values');
    else setValues(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const onSubmit = async (data: ValuesFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('core_values').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('Core value updated');
      } else {
        const { error } = await supabase.from('core_values').insert([data]);
        if (error) throw error;
        toast.success('Core value added');
      }
      setOpen(false);
      fetchValues();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this core value?')) return;
    try {
      const { error } = await supabase.from('core_values').delete().eq('id', id);
      if (error) throw error;
      toast.success('Core value deleted');
      fetchValues();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (val: any) => {
    setEditingId(val.id);
    form.reset({ title: val.title, description: val.description || '', icon: val.icon || '', display_order: val.display_order });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: '', description: '', icon: '', display_order: 0 });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Core Values</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Value</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Core Value' : 'Add New Value'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="icon" render={({ field }) => (
                  <FormItem><FormLabel>Icon (optional SVG/Class)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="display_order" render={({ field }) => (
                  <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Save Value</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap">Description</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : values.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No values found</TableCell></TableRow>
            ) : (
              values.map(val => (
                <TableRow key={val.id}>
                  <TableCell className="font-medium">{val.title}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{val.description}</TableCell>
                  <TableCell className="text-center">{val.display_order}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(val)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(val.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

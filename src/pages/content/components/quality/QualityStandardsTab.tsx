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

const qsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  display_order: z.coerce.number(),
});

type QsFormValues = z.infer<typeof qsSchema>;

export function QualityStandardsTab() {
  const [standards, setStandards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<QsFormValues>({
    resolver: zodResolver(qsSchema),
    defaultValues: { name: '', description: '', icon: '', display_order: 0 },
  });

  const fetchStandards = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('quality_standards').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch quality standards');
    else setStandards(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  const onSubmit = async (data: QsFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('quality_standards').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('Standard updated');
      } else {
        const { error } = await supabase.from('quality_standards').insert([data]);
        if (error) throw error;
        toast.success('Standard added');
      }
      setOpen(false);
      fetchStandards();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this standard?')) return;
    try {
      const { error } = await supabase.from('quality_standards').delete().eq('id', id);
      if (error) throw error;
      toast.success('Standard deleted');
      fetchStandards();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (std: any) => {
    setEditingId(std.id);
    form.reset({ name: std.name, description: std.description || '', icon: std.icon || '', display_order: std.display_order });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: '', description: '', icon: '', display_order: 0 });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Quality Standards</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Standard</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Standard' : 'Add New Standard'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="icon" render={({ field }) => (
                  <FormItem><FormLabel>Icon (SVG/Class)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="display_order" render={({ field }) => (
                  <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Save Standard</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Description</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : standards.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No standards found</TableCell></TableRow>
            ) : (
              standards.map(std => (
                <TableRow key={std.id}>
                  <TableCell className="font-medium whitespace-nowrap">{std.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{std.description}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{std.display_order}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(std)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(std.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const statsSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  icon: z.string().optional(),
  display_order: z.coerce.number(),
});

type StatsFormValues = z.infer<typeof statsSchema>;

export function StatsCountersTab() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<StatsFormValues>({
    resolver: zodResolver(statsSchema),
    defaultValues: { label: '', value: '', icon: '', display_order: 0 },
  });

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('stats_counters').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch stats counters');
    else setStats(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onSubmit = async (values: StatsFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('stats_counters').update(values).eq('id', editingId);
        if (error) throw error;
        toast.success('Stats counter updated');
      } else {
        const { error } = await supabase.from('stats_counters').insert([values]);
        if (error) throw error;
        toast.success('Stats counter added');
      }
      setOpen(false);
      fetchStats();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this stat?')) return;
    try {
      const { error } = await supabase.from('stats_counters').delete().eq('id', id);
      if (error) throw error;
      toast.success('Stats counter deleted');
      fetchStats();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (stat: any) => {
    setEditingId(stat.id);
    form.reset({ label: stat.label, value: stat.value, icon: stat.icon || '', display_order: stat.display_order });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ label: '', value: '', icon: '', display_order: 0 });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Stats Counters</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Stat</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Stat' : 'Add New Stat'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="label" render={({ field }) => (
                  <FormItem><FormLabel>Label *</FormLabel><FormControl><Input {...field} placeholder="e.g. Years Experience" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem><FormLabel>Value *</FormLabel><FormControl><Input {...field} placeholder="e.g. 25+" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="icon" render={({ field }) => (
                  <FormItem><FormLabel>Icon (optional SVG/Class)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="display_order" render={({ field }) => (
                  <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Save Stat</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Label</TableHead>
              <TableHead className="whitespace-nowrap">Value</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : stats.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No stats found</TableCell></TableRow>
            ) : (
              stats.map(stat => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.label}</TableCell>
                  <TableCell>{stat.value}</TableCell>
                  <TableCell className="text-center">{stat.display_order}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(stat)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(stat.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

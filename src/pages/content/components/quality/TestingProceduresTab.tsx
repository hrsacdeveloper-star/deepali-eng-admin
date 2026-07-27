import { useState, useEffect } from 'react';
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

const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  media_url: z.string().optional(),
  display_order: z.coerce.number(),
  is_active: z.boolean(),
});

type TestFormValues = z.infer<typeof testSchema>;

export function TestingProceduresTab() {
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: { name: '', description: '', media_url: '', display_order: 0, is_active: true },
  });

  const fetchProcedures = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('testing_procedures').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch procedures');
    else setProcedures(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  const onSubmit = async (data: TestFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('testing_procedures').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('Procedure updated');
      } else {
        const { error } = await supabase.from('testing_procedures').insert([data]);
        if (error) throw error;
        toast.success('Procedure added');
      }
      setOpen(false);
      fetchProcedures();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this procedure?')) return;
    try {
      const { error } = await supabase.from('testing_procedures').delete().eq('id', id);
      if (error) throw error;
      toast.success('Procedure deleted');
      fetchProcedures();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (proc: any) => {
    setEditingId(proc.id);
    form.reset({ 
      name: proc.name, 
      description: proc.description || '', 
      media_url: proc.media_url || '', 
      display_order: proc.display_order,
      is_active: proc.is_active
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: '', description: '', media_url: '', display_order: 0, is_active: true });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Testing Procedures</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Procedure</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Procedure' : 'Add New Procedure'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="media_url" render={({ field }) => (
                  <FormItem><FormLabel>Media (Image/Video URL)</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} accept="image/*,video/*" /></FormControl><FormMessage /></FormItem>
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
                <Button type="submit" className="w-full">Save Procedure</Button>
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
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Description</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : procedures.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No procedures found</TableCell></TableRow>
            ) : (
              procedures.map(proc => (
                <TableRow key={proc.id}>
                  <TableCell className="whitespace-nowrap">
                    {proc.media_url ? (
                      <img src={proc.media_url} alt={proc.name} className="w-12 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">NA</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{proc.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{proc.description}</TableCell>
                  <TableCell className="text-center">{proc.display_order}</TableCell>
                  <TableCell className="text-center">{proc.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(proc)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(proc.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

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

const machSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  specifications: z.string().optional(),
  image: z.string().optional(),
  display_order: z.coerce.number(),
});

type MachFormValues = z.infer<typeof machSchema>;

export function ToolMachinesTab() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<MachFormValues>({
    resolver: zodResolver(machSchema),
    defaultValues: { name: '', description: '', specifications: '', image: '', display_order: 0 },
  });

  const fetchMachines = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tool_room_machines').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch machines');
    else setMachines(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const onSubmit = async (data: MachFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('tool_room_machines').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('Machine updated');
      } else {
        const { error } = await supabase.from('tool_room_machines').insert([data]);
        if (error) throw error;
        toast.success('Machine added');
      }
      setOpen(false);
      fetchMachines();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this machine?')) return;
    try {
      const { error } = await supabase.from('tool_room_machines').delete().eq('id', id);
      if (error) throw error;
      toast.success('Machine deleted');
      fetchMachines();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (mach: any) => {
    setEditingId(mach.id);
    form.reset({ 
      name: mach.name, 
      description: mach.description || '', 
      specifications: mach.specifications || '', 
      image: mach.image || '', 
      display_order: mach.display_order
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: '', description: '', specifications: '', image: '', display_order: 0 });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Tool Room Machines</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Machine</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Machine' : 'Add New Machine'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="specifications" render={({ field }) => (
                  <FormItem><FormLabel>Specifications</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="image" render={({ field }) => (
                  <FormItem><FormLabel>Image</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="display_order" render={({ field }) => (
                  <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Save Machine</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] whitespace-nowrap">Image</TableHead>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Specs</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : machines.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No machines found</TableCell></TableRow>
            ) : (
              machines.map(mach => (
                <TableRow key={mach.id}>
                  <TableCell className="whitespace-nowrap">
                    {mach.image ? (
                      <img src={mach.image} alt={mach.name} className="w-12 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">NA</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{mach.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{mach.specifications}</TableCell>
                  <TableCell className="text-center">{mach.display_order}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(mach)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(mach.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

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

const teamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  order_index: z.coerce.number(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function OperationsTeam() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: '', role: '', order_index: 0 },
  });

  const fetchTeam = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('operations_team').select('*').order('order_index', { ascending: true });
    if (error) toast.error('Failed to fetch operations team');
    else setTeam(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const onSubmit = async (values: TeamFormValues) => {
    if (editingId) {
      const { error } = await supabase.from('operations_team').update(values).eq('id', editingId);
      if (error) toast.error('Failed to update member');
      else { toast.success('Member updated successfully'); setOpen(false); fetchTeam(); }
    } else {
      const { error } = await supabase.from('operations_team').insert([values]);
      if (error) toast.error('Failed to add member');
      else { toast.success('Member added successfully'); setOpen(false); fetchTeam(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      const { error } = await supabase.from('operations_team').delete().eq('id', id);
      if (error) toast.error('Failed to delete member');
      else { toast.success('Member deleted successfully'); fetchTeam(); }
    }
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    form.reset({ 
      name: member.name, 
      role: member.role, 
      order_index: member.order_index || 0
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: '', role: '', order_index: 0 });
    setOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Operations Team</h2>
          <p className="text-muted-foreground">Manage your company's operations team.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Member</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Member' : 'Add New Member'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem><FormLabel>Role *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="order_index" render={({ field }) => (
                  <FormItem><FormLabel>Order</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">{editingId ? 'Update Member' : 'Add Member'}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-4">Loading...</TableCell></TableRow>
            ) : team.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-4">No team members found</TableCell></TableRow>
            ) : (
              team.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.role}</TableCell>
                  <TableCell>{item.order_index}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
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

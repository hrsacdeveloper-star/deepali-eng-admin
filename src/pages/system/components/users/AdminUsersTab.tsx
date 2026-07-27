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
import { Badge } from '@/components/ui/badge';

const adminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role_id: z.string().min(1, 'Role is required'),
  status: z.enum(['Active', 'Inactive']),
});

type AdminFormValues = z.infer<typeof adminSchema>;

export function AdminUsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: '', email: '', role_id: '', status: 'Active' },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        supabase.from('admin_users').select('*, roles_permissions(role_name)').order('created_at', { ascending: false }),
        supabase.from('roles_permissions').select('*').order('role_name')
      ]);
      setUsers(uRes.data || []);
      setRoles(rRes.data || []);
    } catch (err: any) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: AdminFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('admin_users').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('User updated. Note: Auth password reset requires Supabase dashboard.');
      } else {
        const { error } = await supabase.from('admin_users').insert([data]);
        if (error) throw error;
        toast.success('User added to metadata. Remember to invite via Supabase Auth.');
      }
      setOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete ${email}? (This only removes metadata, delete from Auth separately)`)) return;
    try {
      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (error) throw error;
      toast.success('User deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (user: any) => {
    setEditingId(user.id);
    form.reset({ 
      name: user.name, 
      email: user.email, 
      role_id: user.role_id, 
      status: user.status
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: '', email: '', role_id: roles[0]?.id || '', status: 'Active' });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Admin Users</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Admin</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Admin User' : 'Add Admin Metadata'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" {...field} disabled={!!editingId} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="role_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.role_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full">Save User</Button>
                {!editingId && <p className="text-xs text-muted-foreground mt-2">Note: Actual authentication requires creating the user in the Supabase Auth dashboard.</p>}
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
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Role</TableHead>
              <TableHead className="whitespace-nowrap text-center">Status</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No admin users found</TableCell></TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium whitespace-nowrap">{user.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{user.roles_permissions?.role_name || 'No Role'}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(user)}><Edit className="w-4 h-4 text-primary" /></Button>
                    {user.email !== 'admin@deepali.com' && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id, user.email)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    )}
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

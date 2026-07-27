import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const MODULES = [
  'Dashboard', 'Home Settings', 'About Us', 'Products', 'Industries', 'Infrastructure', 
  'Quality', 'Tool Room', 'Gallery', 'Blogs', 'Downloads', 'Careers', 'FAQs', 'Partners',
  'Enquiries', 'Chatbot', 'Users', 'Settings'
];

const roleSchema = z.object({
  role_name: z.string().min(1, 'Role name is required'),
  permissions: z.record(z.boolean()).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export function RolesTab() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { role_name: '', permissions: {} },
  });

  const fetchRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('roles_permissions').select('*').order('created_at', { ascending: true });
    if (error) toast.error('Failed to fetch roles');
    else setRoles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const onSubmit = async (data: RoleFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('roles_permissions').update({
          role_name: data.role_name,
          permissions: data.permissions || {}
        }).eq('id', editingId);
        if (error) throw error;
        toast.success('Role updated');
      } else {
        const { error } = await supabase.from('roles_permissions').insert([{
          role_name: data.role_name,
          permissions: data.permissions || {}
        }]);
        if (error) throw error;
        toast.success('Role added');
      }
      setOpen(false);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this role? Users with this role might lose access.')) return;
    try {
      const { error } = await supabase.from('roles_permissions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Role deleted');
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (role: any) => {
    setEditingId(role.id);
    form.reset({ 
      role_name: role.role_name, 
      permissions: role.permissions || {}
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ role_name: '', permissions: {} });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Roles & Permissions</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Role</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Role' : 'Add New Role'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="role_name" render={({ field }) => (
                  <FormItem><FormLabel>Role Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <div>
                  <FormLabel className="mb-3 block">Module Permissions</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-md bg-muted/50">
                    {MODULES.map((module) => (
                      <FormField
                        key={module}
                        control={form.control}
                        name={`permissions.${module}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal cursor-pointer">
                                {module}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">Save Role</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Role Name</TableHead>
              <TableHead className="whitespace-nowrap">Modules Access</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : roles.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No roles found</TableCell></TableRow>
            ) : (
              roles.map(role => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium whitespace-nowrap">{role.role_name}</TableCell>
                  <TableCell className="max-w-[400px] truncate text-muted-foreground text-sm">
                    {Object.entries(role.permissions || {}).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'No permissions'}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(role)}><Edit className="w-4 h-4 text-primary" /></Button>
                    {role.role_name !== 'Super Admin' && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

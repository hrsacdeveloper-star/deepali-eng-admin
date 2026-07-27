import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

const navSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.string().min(1, 'URL/Slug is required'),
  parent_id: z.string().optional().nullable(),
  display_order: z.coerce.number(),
  is_new_tab: z.boolean(),
  menu_location: z.string(),
});

type NavFormValues = z.infer<typeof navSchema>;

export function NavigationTab() {
  const [menus, setMenus] = useState<any[]>([]);
  const [parentOptions, setParentOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<NavFormValues>({
    resolver: zodResolver(navSchema),
    defaultValues: { label: '', url: '/', parent_id: null, display_order: 0, is_new_tab: false, menu_location: 'Header' },
  });

  const fetchMenus = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('nav_menu_items').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch menus');
    else {
      setMenus(data || []);
      setParentOptions(data?.filter(m => !m.parent_id) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const onSubmit = async (data: NavFormValues) => {
    try {
      const payload = { ...data, parent_id: data.parent_id === 'none' ? null : data.parent_id };
      if (editingId) {
        const { error } = await supabase.from('nav_menu_items').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Menu updated');
      } else {
        const { error } = await supabase.from('nav_menu_items').insert([payload]);
        if (error) throw error;
        toast.success('Menu added');
      }
      setOpen(false);
      fetchMenus();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item? (Child items will also be affected)')) return;
    try {
      const { error } = await supabase.from('nav_menu_items').delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted');
      fetchMenus();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (menu: any) => {
    setEditingId(menu.id);
    form.reset({ 
      label: menu.label, 
      url: menu.url, 
      parent_id: menu.parent_id || 'none',
      display_order: menu.display_order,
      is_new_tab: menu.is_new_tab,
      menu_location: menu.menu_location || 'Header'
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ label: '', url: '/', parent_id: 'none', display_order: 0, is_new_tab: false, menu_location: 'Header' });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Navigation Manager</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Menu Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="label" render={({ field }) => (
                    <FormItem><FormLabel>Label *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="url" render={({ field }) => (
                    <FormItem><FormLabel>URL/Slug *</FormLabel><FormControl><Input {...field} placeholder="/products" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="parent_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Menu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'none'}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">-- None (Top Level) --</SelectItem>
                          {parentOptions.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="menu_location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Header">Header (Main Menu)</SelectItem>
                          <SelectItem value="Footer">Footer Links</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="display_order" render={({ field }) => (
                    <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="is_new_tab" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5"><FormLabel>Open in new tab</FormLabel></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full">Save Menu Item</Button>
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
              <TableHead className="whitespace-nowrap">URL</TableHead>
              <TableHead className="whitespace-nowrap">Parent</TableHead>
              <TableHead className="whitespace-nowrap">Location</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : menus.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No menu items found</TableCell></TableRow>
            ) : (
              menus.map(menu => {
                const parent = parentOptions.find(p => p.id === menu.parent_id);
                return (
                  <TableRow key={menu.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {menu.parent_id ? <span className="text-muted-foreground mr-2">↳</span> : null}
                      {menu.label}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{menu.url}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{parent ? parent.label : '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{menu.menu_location}</TableCell>
                    <TableCell className="text-center">{menu.display_order}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(menu)}><Edit className="w-4 h-4 text-primary" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(menu.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

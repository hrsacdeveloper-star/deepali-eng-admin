import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logo: z.string().min(1, 'Logo is required'),
  website_url: z.string().optional(),
  partner_type: z.string(),
  display_order: z.coerce.number(),
  is_active: z.boolean(),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

export default function Partners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { name: '', logo: '', website_url: '', partner_type: 'Domestic', display_order: 0, is_active: true },
  });

  const fetchPartners = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('global_partners').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch partners');
    else setPartners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const onSubmit = async (data: PartnerFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('global_partners').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('Partner updated');
      } else {
        const { error } = await supabase.from('global_partners').insert([data]);
        if (error) throw error;
        toast.success('Partner added');
      }
      setOpen(false);
      fetchPartners();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;
    try {
      const { error } = await supabase.from('global_partners').delete().eq('id', id);
      if (error) throw error;
      toast.success('Partner deleted');
      fetchPartners();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (partner: any) => {
    setEditingId(partner.id);
    form.reset({ 
      name: partner.name, 
      logo: partner.logo || '', 
      website_url: partner.website_url || '', 
      partner_type: partner.partner_type || 'Domestic',
      display_order: partner.display_order,
      is_active: partner.is_active
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: '', logo: '', website_url: '', partner_type: 'Domestic', display_order: 0, is_active: true });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Partners</h2>
          <p className="text-muted-foreground">Manage your domestic and global partners.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Partner</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="logo" render={({ field }) => (
                  <FormItem><FormLabel>Logo Image *</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="website_url" render={({ field }) => (
                    <FormItem><FormLabel>Website URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="partner_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Domestic">Domestic</SelectItem>
                          <SelectItem value="Global">Global</SelectItem>
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
                  <FormField control={form.control} name="is_active" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5"><FormLabel>Active Status</FormLabel></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full">Save Partner</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] whitespace-nowrap">Logo</TableHead>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap text-center">Type</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : partners.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No partners found</TableCell></TableRow>
            ) : (
              partners.map(partner => (
                <TableRow key={partner.id}>
                  <TableCell className="whitespace-nowrap">
                    {partner.logo ? (
                      <div className="p-2 border rounded bg-white w-16 h-12 flex items-center justify-center">
                        <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">NA</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{partner.name}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Badge variant={partner.partner_type === 'Global' ? 'default' : 'secondary'}>{partner.partner_type}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{partner.display_order}</TableCell>
                  <TableCell className="text-center">{partner.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(partner)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(partner.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

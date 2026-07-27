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
import { Trash2, Edit, Plus, Star } from 'lucide-react';

const testmSchema = z.object({
  client_name: z.string().min(1, 'Client Name is required'),
  company_name: z.string().optional(),
  position: z.string().optional(),
  quote: z.string().min(1, 'Quote is required'),
  rating: z.coerce.number().min(1).max(5),
  client_image: z.string().optional(),
  display_order: z.coerce.number(),
  is_active: z.boolean(),
});

type TestmFormValues = z.infer<typeof testmSchema>;

export function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<TestmFormValues>({
    resolver: zodResolver(testmSchema),
    defaultValues: { client_name: '', company_name: '', position: '', quote: '', rating: 5, client_image: '', display_order: 0, is_active: true },
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('testimonials').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch testimonials');
    else setTestimonials(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const onSubmit = async (data: TestmFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('testimonials').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('Testimonial updated');
      } else {
        const { error } = await supabase.from('testimonials').insert([data]);
        if (error) throw error;
        toast.success('Testimonial added');
      }
      setOpen(false);
      fetchTestimonials();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (testm: any) => {
    setEditingId(testm.id);
    form.reset({ 
      client_name: testm.client_name, 
      company_name: testm.company_name || '', 
      position: testm.position || '', 
      quote: testm.quote,
      rating: testm.rating,
      client_image: testm.client_image || '',
      display_order: testm.display_order,
      is_active: testm.is_active
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ client_name: '', company_name: '', position: '', quote: '', rating: 5, client_image: '', display_order: 0, is_active: true });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Testimonials</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Testimonial</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="client_name" render={({ field }) => (
                    <FormItem><FormLabel>Client Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="company_name" render={({ field }) => (
                    <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="position" render={({ field }) => (
                    <FormItem><FormLabel>Position / Designation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="rating" render={({ field }) => (
                    <FormItem><FormLabel>Rating (1-5)</FormLabel><FormControl><Input type="number" min="1" max="5" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="quote" render={({ field }) => (
                  <FormItem><FormLabel>Testimonial / Quote *</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="client_image" render={({ field }) => (
                  <FormItem><FormLabel>Client Photo / Company Logo</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
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
                <Button type="submit" className="w-full">Save Testimonial</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] whitespace-nowrap">Image</TableHead>
              <TableHead className="whitespace-nowrap">Client</TableHead>
              <TableHead className="whitespace-nowrap">Quote</TableHead>
              <TableHead className="whitespace-nowrap text-center">Rating</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : testimonials.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No testimonials found</TableCell></TableRow>
            ) : (
              testimonials.map(testm => (
                <TableRow key={testm.id}>
                  <TableCell className="whitespace-nowrap">
                    {testm.client_image ? (
                      <img src={testm.client_image} alt={testm.client_name} className="w-10 h-10 object-cover rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs">NA</div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium">{testm.client_name}</div>
                    <div className="text-xs text-muted-foreground">{testm.position} {testm.company_name && `@ ${testm.company_name}`}</div>
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate">{testm.quote}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center text-yellow-500">
                      {testm.rating} <Star className="w-3 h-3 ml-1 fill-current" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{testm.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(testm)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(testm.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

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
import { FileUpload } from '@/components/ui/file-upload';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const slideSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  background_media: z.string().optional(),
  button_text: z.string().optional(),
  button_link: z.string().optional(),
  display_order: z.coerce.number(),
  is_active: z.boolean(),
});

type SlideFormValues = z.infer<typeof slideSchema>;

export function HeroSlidesTab() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<SlideFormValues>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      background_media: '',
      button_text: '',
      button_link: '',
      display_order: 0,
      is_active: true,
    },
  });

  const fetchSlides = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('hero_slides').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch slides');
    else setSlides(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const onSubmit = async (values: SlideFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('hero_slides').update(values).eq('id', editingId);
        if (error) throw error;
        toast.success('Slide updated');
      } else {
        const { error } = await supabase.from('hero_slides').insert([values]);
        if (error) throw error;
        toast.success('Slide added');
      }
      setOpen(false);
      fetchSlides();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
      toast.success('Slide deleted');
      fetchSlides();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (slide: any) => {
    setEditingId(slide.id);
    form.reset({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      background_media: slide.background_media || '',
      button_text: slide.button_text || '',
      button_link: slide.button_link || '',
      display_order: slide.display_order,
      is_active: slide.is_active,
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: '', subtitle: '', description: '', background_media: '', button_text: '', button_link: '', display_order: 0, is_active: true });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Hero Slides</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Slide</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subtitle" render={({ field }) => (
                  <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="background_media" render={({ field }) => (
                  <FormItem><FormLabel>Background Image/Video</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="button_text" render={({ field }) => (
                    <FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="button_link" render={({ field }) => (
                    <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                <Button type="submit" className="w-full">Save Slide</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto w-full max-w-full rounded-md border bg-card">
        <Table className="[&>div]:max-w-full min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] whitespace-nowrap">Image</TableHead>
              <TableHead className="whitespace-nowrap">Title</TableHead>
              <TableHead className="whitespace-nowrap text-center">Order</TableHead>
              <TableHead className="whitespace-nowrap text-center">Active</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6">Loading...</TableCell></TableRow>
            ) : slides.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No slides found</TableCell></TableRow>
            ) : (
              slides.map(slide => (
                <TableRow key={slide.id}>
                  <TableCell className="whitespace-nowrap">
                    {slide.background_media && <img src={slide.background_media} alt="bg" className="w-16 h-10 object-cover rounded" />}
                  </TableCell>
                  <TableCell className="font-medium">{slide.title}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{slide.display_order}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">{slide.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(slide)}><Edit className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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

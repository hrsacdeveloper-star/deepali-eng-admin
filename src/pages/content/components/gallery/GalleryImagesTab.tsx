import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const imgSchema = z.object({
  title: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
  category: z.string().optional(),
  display_order: z.coerce.number(),
  is_active: z.boolean(),
});

type ImgFormValues = z.infer<typeof imgSchema>;

export function GalleryImagesTab() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ImgFormValues>({
    resolver: zodResolver(imgSchema),
    defaultValues: { title: '', image: '', category: '', display_order: 0, is_active: true },
  });

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('gallery').select('*').order('display_order', { ascending: true });
    if (error) toast.error('Failed to fetch images');
    else setImages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const onSubmit = async (data: ImgFormValues) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('gallery').update(data).eq('id', editingId);
        if (error) throw error;
        toast.success('Image updated');
      } else {
        const { error } = await supabase.from('gallery').insert([data]);
        if (error) throw error;
        toast.success('Image added');
      }
      setOpen(false);
      fetchImages();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      toast.success('Image deleted');
      fetchImages();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (img: any) => {
    setEditingId(img.id);
    form.reset({ 
      title: img.title || '', 
      image: img.image || '', 
      category: img.category || '', 
      display_order: img.display_order,
      is_active: img.is_active
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: '', image: '', category: '', display_order: 0, is_active: true });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Gallery Images</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Image</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Image' : 'Add New Image'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="image" render={({ field }) => (
                  <FormItem><FormLabel>Image *</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category/Tag</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                <Button type="submit" className="w-full">Save Image</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-6 text-muted-foreground">Loading...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground border rounded-md">No images found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map(img => (
            <Card key={img.id} className={`overflow-hidden ${!img.is_active ? 'opacity-50' : ''}`}>
              <div className="relative aspect-square">
                <img src={img.image} alt={img.title || 'Gallery image'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="secondary" size="icon" onClick={() => openEdit(img)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(img.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              {(img.title || img.category) && (
                <CardContent className="p-3 text-sm">
                  <div className="font-medium truncate">{img.title || 'Untitled'}</div>
                  <div className="text-muted-foreground text-xs">{img.category || 'No Category'}</div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

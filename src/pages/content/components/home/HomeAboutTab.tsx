import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const aboutSchema = z.object({
  id: z.string().optional(),
  heading: z.string().min(1, 'Heading is required'),
  description: z.string().optional(),
  side_image_1: z.string().optional(),
  side_image_2: z.string().optional(),
  vision_title: z.string().optional(),
  vision_text: z.string().optional(),
  mission_title: z.string().optional(),
  mission_text: z.string().optional(),
});

type AboutFormValues = z.infer<typeof aboutSchema>;

export function HomeAboutTab() {
  const [loading, setLoading] = useState(true);

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      heading: '', description: '', side_image_1: '', side_image_2: '',
      vision_title: '', vision_text: '', mission_title: '', mission_text: ''
    },
  });

  const fetchAbout = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('about_page').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to fetch about section');
    } else if (data) {
      form.reset(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const onSubmit = async (values: AboutFormValues) => {
    try {
      const { id, ...updateData } = values;
      if (id) {
        const { error } = await supabase.from('about_page').update(updateData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('about_page').insert([updateData]);
        if (error) throw error;
      }
      toast.success('About section updated');
      fetchAbout();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="py-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="heading" render={({ field }) => (
              <FormItem><FormLabel>Heading *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="side_image_1" render={({ field }) => (
                <FormItem><FormLabel>Side Image 1</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="side_image_2" render={({ field }) => (
                <FormItem><FormLabel>Side Image 2</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Vision</h4>
                <FormField control={form.control} name="vision_title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="vision_text" render={({ field }) => (
                  <FormItem><FormLabel>Text</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Mission</h4>
                <FormField control={form.control} name="mission_title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mission_text" render={({ field }) => (
                  <FormItem><FormLabel>Text</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

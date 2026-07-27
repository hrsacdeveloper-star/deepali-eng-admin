import React, { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  company_name: z.string().min(1, 'Required'),
  about_text: z.string().optional().nullable(),
  vision_text: z.string().optional().nullable(),
  mission_text: z.string().optional().nullable(),
  infrastructure_text: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  map_embed_url: z.string().optional().nullable(),
  facebook_url: z.string().optional().nullable(),
  linkedin_url: z.string().optional().nullable(),
  twitter_url: z.string().optional().nullable(),
  instagram_url: z.string().optional().nullable(),
  footer_text: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: '',
      about_text: '',
      vision_text: '',
      mission_text: '',
      infrastructure_text: '',
      address: '',
      phone: '',
      email: '',
      map_embed_url: '',
      facebook_url: '',
      linkedin_url: '',
      twitter_url: '',
      instagram_url: '',
      footer_text: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettingsId(data.id);
        form.reset({
          company_name: data.company_name || '',
          about_text: data.about_text || '',
          vision_text: data.vision_text || '',
          mission_text: data.mission_text || '',
          infrastructure_text: data.infrastructure_text || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          map_embed_url: data.map_embed_url || '',
          facebook_url: data.facebook_url || '',
          linkedin_url: data.linkedin_url || '',
          twitter_url: data.twitter_url || '',
          instagram_url: data.instagram_url || '',
          footer_text: data.footer_text || '',
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (settingsId) {
        const { error } = await supabase.from('site_settings').update(values).eq('id', settingsId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert([values]);
        if (error) throw error;
      }
      toast.success('Site settings saved successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center"><Loader2 className="animate-spin mr-2" /> Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="company_name" render={({ field }) => (
              <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </form>
      </Form>
    </div>
  );
}

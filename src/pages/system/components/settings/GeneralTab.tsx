import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const settingsSchema = z.object({
  company_name: z.string().min(1, 'Company Name is required'),
  logo_url: z.string().optional(),
  favicon_url: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  about_text: z.string().optional(),
  working_hours: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function GeneralTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: '', logo_url: '', favicon_url: '', address: '', phone: '', email: '', about_text: '', working_hours: ''
    },
  });

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to fetch settings');
    } else if (data) {
      form.reset({
        company_name: data.company_name || '',
        logo_url: data.logo_url || '',
        favicon_url: data.favicon_url || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        about_text: data.about_text || '',
        working_hours: data.working_hours || ''
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onSubmit = async (data: SettingsFormValues) => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('site_settings').select('id').limit(1).single();
      
      if (existing) {
        const { error } = await supabase.from('site_settings').update(data).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert([data]);
        if (error) throw error;
      }
      toast.success('Settings updated successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="bg-card border rounded-md p-6 max-w-3xl">
      <h3 className="text-lg font-semibold text-foreground mb-6">General Information</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="company_name" render={({ field }) => (
              <FormItem><FormLabel>Company Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="working_hours" render={({ field }) => (
              <FormItem><FormLabel>Working Hours</FormLabel><FormControl><Input {...field} placeholder="Mon-Sat: 9 AM - 6 PM" /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="about_text" render={({ field }) => (
            <FormItem><FormLabel>Short About Text (Footer/Sidebar)</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <FormField control={form.control} name="logo_url" render={({ field }) => (
              <FormItem>
                <FormLabel>Main Logo</FormLabel>
                <FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="favicon_url" render={({ field }) => (
              <FormItem>
                <FormLabel>Favicon</FormLabel>
                <FormControl><FileUpload value={field.value} onChange={field.onChange} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const footerSchema = z.object({
  copyright_text: z.string().optional(),
  contact_info: z.string().optional(),
  footer_columns: z.any().optional(),
});

type FooterFormValues = z.infer<typeof footerSchema>;

export function FooterTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FooterFormValues>({
    resolver: zodResolver(footerSchema),
    defaultValues: {
      copyright_text: '', contact_info: '', footer_columns: {}
    },
  });

  const fetchFooter = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('footer_content').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to fetch footer content');
    } else if (data) {
      form.reset({
        copyright_text: data.copyright_text || '',
        contact_info: data.contact_info || '',
        footer_columns: data.footer_columns || {}
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFooter();
  }, []);

  const onSubmit = async (data: FooterFormValues) => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('footer_content').select('id').limit(1).single();
      
      if (existing) {
        const { error } = await supabase.from('footer_content').update(data).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('footer_content').insert([data]);
        if (error) throw error;
      }
      toast.success('Footer content updated successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="bg-card border rounded-md p-6 max-w-3xl">
      <h3 className="text-lg font-semibold text-foreground mb-6">Footer Content</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="copyright_text" render={({ field }) => (
            <FormItem>
              <FormLabel>Copyright Text</FormLabel>
              <FormControl><Input {...field} placeholder="© 2026 Deepali Engineering. All rights reserved." /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="contact_info" render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Contact Info (Footer Specific)</FormLabel>
              <FormControl><Textarea rows={3} {...field} placeholder="For sales: sales@deepaliengg.com" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
            <p>Note: Footer links and columns can be managed dynamically via JSON or linked from Navigation Menu items marked for "Footer". Advanced footer column builder will be implemented in future phases.</p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Footer'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

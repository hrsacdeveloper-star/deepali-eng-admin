import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

// Create a secondary client to avoid logging out the current admin
const supabaseAdminUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAdminKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseSecondary = createClient(supabaseAdminUrl, supabaseAdminKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function GiveAccess() {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      const { error } = await supabaseSecondary.auth.signUp({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      toast.success(`Access granted for ${values.email}. If email confirmations are enabled on your project, they will need to verify their email before logging in.`);
      form.reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Give Access</CardTitle>
          <CardDescription>Create an account for a new admin or staff member.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporary Password</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account & Give Access'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

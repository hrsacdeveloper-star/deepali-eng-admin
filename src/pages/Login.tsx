import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/db/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  agreeTerms: z.boolean().refine(val => val, 'You must agree to the terms and privacy policy'),
});

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      agreeTerms: false,
    },
  });

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      // Check if OTP is needed
      const isVerified = data.user?.user_metadata?.first_login_verified;
      
      if (!isVerified) {
        // Send OTP
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: values.email,
        });
        
        if (otpError) throw otpError;
        
        setOtpEmail(values.email);
        setStep('otp');
        toast.info('Please check your email for the verification code');
        return;
      }

      toast.success('Logged in successfully');
      navigate(from, { replace: true });
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email: otpEmail,
        token: otpValue,
        type: 'email'
      });
      if (error) throw error;
      
      // Update user metadata to mark first login as completed
      await supabase.auth.updateUser({
        data: { first_login_verified: true }
      });
      
      toast.success('First login verified successfully');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    const email = form.getValues('email');
    if (!email) {
      toast.error('Please enter your email address first');
      form.setFocus('email');
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      toast.success('Password reset link has been sent to your email.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
      <Card className="w-full max-w-md border-border shadow-sm">
        <CardHeader className="space-y-2 text-center pb-6">
          <img
            src="https://miaoda-edit-image.s3cdn.medo.dev/d6a1n87ee60x/IMG-d9f5wvp6vzls.png"
            alt="Deepali Engineering"
            className="h-16 w-auto mx-auto mb-4 dark:invert"
            data-editor-config="%7B%22defaultSrc%22%3A%22https%3A%2F%2Fmiaoda-edit-image.s3cdn.medo.dev%2Fd6a1n87ee60x%2FIMG-d9f5wvp6vzls.png%22%7D" />
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">Admin Login</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your credentials to access the Deepali Admin Panel</CardDescription>
        </CardHeader>
        <CardContent className="bg-[#f4b6b626] bg-none rounded-[5px] rounded-tl-[20px] rounded-tr-[20px]">
          {step === 'otp' ? (
            <div className="space-y-6">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Please enter the 6-digit confirmation code sent to <strong>{otpEmail}</strong> to verify your first login.
              </div>
              <form onSubmit={handleVerifyOtp} className="space-y-6 flex flex-col items-center">
                <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue} disabled={loading}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button type="submit" className="w-full font-bold" disabled={loading || otpValue.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </Button>
                <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setStep('login')} disabled={loading}>
                  Back to login
                </Button>
              </form>
            </div>
          ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@deepali.com" type="email" disabled={loading} className="bg-card" {...field} />
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-semibold text-foreground">Password</FormLabel>
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        className="text-xs font-medium text-primary hover:underline"
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" disabled={loading} className="bg-card" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agreeTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-card border-border">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                        I agree to the terms
                      </FormLabel>
                      <CardDescription className="text-xs text-muted-foreground">
                        By logging in, you agree to our User Agreement and Privacy Policy.
                      </CardDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading ? 'Logging in...' : 'Sign In'}
              </Button>
            </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

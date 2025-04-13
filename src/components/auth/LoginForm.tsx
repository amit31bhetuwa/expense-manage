
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, User } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onForgotPassword: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const { signIn, signInWithGoogle, signInAsGuest, isLoading } = useAuth();
  const [authMethod, setAuthMethod] = React.useState<'email' | 'google' | 'guest' | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setAuthMethod('email');
      await signIn(values.email, values.password);
    } catch (error) {
      console.error('Login error:', error);
      setAuthMethod(null);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setAuthMethod('google');
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      setAuthMethod(null);
    }
  }

  async function handleGuestSignIn() {
    try {
      setAuthMethod('guest');
      await signInAsGuest();
    } catch (error) {
      console.error('Guest login error:', error);
      setAuthMethod(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
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
                    <FormLabel>Password</FormLabel>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        onForgotPassword();
                      }}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading && authMethod === 'email'}
            >
              {isLoading && authMethod === 'email' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGoogleSignIn}
            disabled={isLoading && authMethod === 'google'}
            className="w-full"
          >
            {isLoading && authMethod === 'google' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Google
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGuestSignIn}
            disabled={isLoading && authMethod === 'guest'}
            className="w-full"
          >
            {isLoading && authMethod === 'guest' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <User className="mr-2 h-4 w-4" />
            )}
            Continue as Guest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

export function AuthContainer() {
  const [activeTab, setActiveTab] = React.useState('login');
  const [showResetPassword, setShowResetPassword] = React.useState(false);

  const handleForgotPassword = () => {
    setShowResetPassword(true);
  };

  const handleBackToLogin = () => {
    setShowResetPassword(false);
    setActiveTab('login');
  };

  if (showResetPassword) {
    return (
      <div className="mx-auto max-w-md space-y-6 p-6">
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">PocketWise</h1>
          </div>
        </div>
        <ResetPasswordForm />
        <div className="text-center">
          <Button variant="link" onClick={handleBackToLogin}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">PocketWise</h1>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm onForgotPassword={handleForgotPassword} />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm onSuccess={() => setActiveTab('login')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


import React, { createContext, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the User type
export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
};

// Define the AuthContextType
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for development purposes
const demoUser: User = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  createdAt: new Date(),
};

// Create the AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would validate credentials with a backend
      // For demo, we'll just check if email and password are not empty
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set the demo user for now
      setUser(demoUser);
      toast({
        title: 'Signed in successfully',
        description: `Welcome back, ${demoUser.name}!`,
      });
    } catch (error) {
      toast({
        title: 'Sign in failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would create a new user in the backend
      // For demo, we'll just check if required fields are provided
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        ...demoUser,
        email,
        name,
      };
      
      setUser(newUser);
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully',
      });
    } catch (error) {
      toast({
        title: 'Sign up failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully',
    });
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would trigger a password reset email
      if (!email) {
        throw new Error('Email is required');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your inbox for instructions to reset your password',
      });
    } catch (error) {
      toast({
        title: 'Password reset failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      // In a real app, this would update the user profile in the backend
      if (!user) {
        throw new Error('You must be logged in to update your profile');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser({ ...user, ...data });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Profile update failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFinance } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, Moon, Sun, Key, Mail } from 'lucide-react';

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Password reset form schema
const resetPasswordFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

// Category form schema
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['expense', 'income']),
  color: z.string(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function SettingsPage() {
  const { user, updateProfile, isLoading, resetPassword } = useAuth();
  const {
    expenseCategories,
    incomeCategories,
    addCategory,
    deleteCategory,
  } = useFinance();
  const { theme, toggleTheme } = useTheme();
  
  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
  const [isResetPasswordSent, setIsResetPasswordSent] = React.useState(false);
  
  // Initialize profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });
  
  // Initialize password reset form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });
  
  // Update form values when user changes
  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
      });
      
      resetPasswordForm.reset({
        email: user.email,
      });
    }
  }, [user, profileForm, resetPasswordForm]);
  
  // Initialize category form
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: '#e63946',
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile({
        name: values.name,
      });
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };
  
  // Handle password reset form submission
  const onResetPasswordSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword(values.email);
      setIsResetPasswordSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setIsResetPasswordSent(false);
    }
  };
  
  // Handle category form submission
  const onCategorySubmit = (values: CategoryFormValues) => {
    addCategory({
      name: values.name,
      type: values.type,
      color: values.color,
    });
    
    categoryForm.reset({
      name: '',
      type: 'expense',
      color: '#e63946',
    });
    
    setIsAddCategoryOpen(false);
  };
  
  // Handle category deletion
  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && (
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Password Reset Section */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Password Reset</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send a password reset link to your email address
                  </p>
                  
                  {isResetPasswordSent ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <p className="text-green-800 text-sm">
                        Password reset email sent. Please check your inbox for instructions.
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 mt-2 h-auto text-green-700"
                        onClick={() => setIsResetPasswordSent(false)}
                      >
                        Send again
                      </Button>
                    </div>
                  ) : (
                    <Form {...resetPasswordForm}>
                      <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={resetPasswordForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input {...field} readOnly className="flex-1" />
                                  <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="flex items-center gap-1"
                                  >
                                    {isLoading ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Mail className="h-4 w-4" />
                                        Send Reset Link
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  )}
                </div>
                
                {/* Account Provider Information */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Login Method</h3>
                  <div className="bg-muted p-3 rounded-md flex items-center gap-3">
                    {user?.authProvider === 'google' ? (
                      <>
                        <Mail className="h-5 w-5 text-primary" />
                        <span>You're signed in with Google</span>
                      </>
                    ) : user?.authProvider === 'guest' ? (
                      <>
                        <User className="h-5 w-5 text-primary" />
                        <span>You're signed in as a guest</span>
                      </>
                    ) : (
                      <>
                        <Key className="h-5 w-5 text-primary" />
                        <span>You're signed in with email and password</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Manage your expense and income categories
                  </CardDescription>
                </div>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Category</DialogTitle>
                      <DialogDescription>
                        Create a new category for tracking expenses or income
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...categoryForm}>
                      <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                        <FormField
                          control={categoryForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Groceries" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={categoryForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="expense">Expense</SelectItem>
                                  <SelectItem value="income">Income</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={categoryForm.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    className="w-12 h-10 p-1"
                                    {...field}
                                  />
                                  <Input
                                    type="text"
                                    placeholder="#hex"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddCategoryOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Add Category</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="expense">
                <TabsList className="mb-4">
                  <TabsTrigger value="expense">Expense Categories</TabsTrigger>
                  <TabsTrigger value="income">Income Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="expense">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Color</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          </TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={category.isDefault}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="income">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Color</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          </TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={category.isDefault}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

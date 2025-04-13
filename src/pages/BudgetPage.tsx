
import React from 'react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency } from '@/utils/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const budgetFormSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Budget amount must be a positive number',
  }),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export function BudgetPage() {
  const {
    currentBudget,
    addBudget,
    updateBudget,
    expenses,
    expenseCategories,
    getCategoryById,
  } = useFinance();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      amount: currentBudget ? currentBudget.amount.toString() : '',
    },
  });

  React.useEffect(() => {
    if (currentBudget) {
      form.reset({
        amount: currentBudget.amount.toString(),
      });
    }
  }, [currentBudget, form]);

  // Calculate current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Get the month name
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  
  // Calculate spending by category
  const spendingByCategory = React.useMemo(() => {
    const categorySpending: Record<string, number> = {};
    
    expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .forEach(expense => {
        if (categorySpending[expense.categoryId]) {
          categorySpending[expense.categoryId] += expense.amount;
        } else {
          categorySpending[expense.categoryId] = expense.amount;
        }
      });
    
    return Object.entries(categorySpending)
      .map(([categoryId, amount]) => ({
        category: getCategoryById(categoryId),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, currentMonth, currentYear, getCategoryById]);
  
  const onSubmit = (values: BudgetFormValues) => {
    const budgetAmount = Number(values.amount);
    
    if (currentBudget) {
      // Update existing budget
      updateBudget(currentBudget.id, {
        amount: budgetAmount,
      });
    } else {
      // Create new budget
      addBudget({
        amount: budgetAmount,
        month: currentMonth,
        year: currentYear,
      });
    }
    
    setIsDialogOpen(false);
  };
  
  const budgetUsagePercentage = currentBudget
    ? Math.min(Math.round((currentBudget.spent / currentBudget.amount) * 100), 100)
    : 0;
  
  const getBudgetStatus = () => {
    if (!currentBudget) return { color: 'text-muted-foreground', message: 'No budget set' };
    
    const percentage = (currentBudget.spent / currentBudget.amount) * 100;
    
    if (percentage >= 100) {
      return { color: 'text-destructive', message: 'Budget exceeded' };
    } else if (percentage >= 80) {
      return { color: 'text-orange-500', message: 'Budget almost reached' };
    } else {
      return { color: 'text-green-500', message: 'Budget on track' };
    }
  };
  
  const budgetStatus = getBudgetStatus();
  
  const getProgressColor = () => {
    if (!currentBudget) return 'bg-muted';
    
    const percentage = (currentBudget.spent / currentBudget.amount) * 100;
    
    if (percentage >= 100) {
      return 'bg-destructive';
    } else if (percentage >= 80) {
      return 'bg-orange-500';
    } else {
      return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budget</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {currentBudget ? 'Update Budget' : 'Set Budget'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentBudget ? 'Update' : 'Set'} Budget for {monthName}</DialogTitle>
              <DialogDescription>
                Enter the maximum amount you want to spend this month
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                          <Input type="number" step="0.01" min="0" className="pl-7" {...field} />
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
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {currentBudget ? 'Update' : 'Set'} Budget
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Budget for {monthName} {currentYear}</CardTitle>
          <CardDescription>
            Track your spending against your monthly budget
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentBudget ? (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(currentBudget.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(currentBudget.spent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                  <p className={`text-2xl font-bold ${
                    currentBudget.amount - currentBudget.spent > 0
                      ? 'text-green-500'
                      : 'text-destructive'
                  }`}>
                    {formatCurrency(Math.max(currentBudget.amount - currentBudget.spent, 0))}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Progress</span>
                  <span className={`text-sm ${budgetStatus.color}`}>
                    {budgetUsagePercentage}% • {budgetStatus.message}
                  </span>
                </div>
                <Progress
                  value={budgetUsagePercentage}
                  className="h-2"
                  indicatorClassName={getProgressColor()}
                />
              </div>
              
              {budgetUsagePercentage >= 80 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Budget Alert</AlertTitle>
                  <AlertDescription>
                    You've spent {budgetUsagePercentage}% of your monthly budget.
                    {budgetUsagePercentage >= 100
                      ? ' You have exceeded your budget.'
                      : ' Consider reducing your expenses for the rest of the month.'}
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground mb-4">
                You haven't set a budget for this month yet
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Set Budget
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Spending by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>
            See how your spending is distributed across categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {spendingByCategory.length > 0 ? (
            <div className="space-y-4">
              {spendingByCategory.map(({ category, amount }) => {
                if (!category) return null;
                
                const percentage = currentBudget
                  ? Math.min(Math.round((amount / currentBudget.amount) * 100), 100)
                  : 0;
                
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-expense">{formatCurrency(amount)}</span>
                        {currentBudget && (
                          <span className="text-xs text-muted-foreground">
                            ({percentage}% of budget)
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2"
                      indicatorClassName="bg-primary"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No spending recorded for this month yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


import React from 'react';
import { useFinance } from '@/hooks/use-finance';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  description: z.string().min(1, 'Description is required'),
  date: z.date({
    required_error: 'Date is required',
  }),
  categoryId: z.string().min(1, 'Category is required'),
  receiptUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'expense' | 'income';
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  defaultType = 'expense',
}: AddTransactionDialogProps) {
  const { addTransaction, expenseCategories, incomeCategories } = useFinance();
  const [transactionType, setTransactionType] = React.useState<'expense' | 'income'>(defaultType);
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      description: '',
      date: new Date(),
      categoryId: '',
      receiptUrl: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        amount: '',
        description: '',
        date: new Date(),
        categoryId: '',
        receiptUrl: '',
      });
      setTransactionType(defaultType);
      setReceiptFile(null);
    }
  }, [open, form, defaultType]);

  async function onSubmit(values: FormValues) {
    try {
      // In a real app, you would upload the receipt image and get back a URL
      let receiptUrl = '';
      if (receiptFile) {
        // For demo, we'll just use a placeholder URL
        receiptUrl = 'https://example.com/receipt.jpg';
      }
      
      addTransaction({
        amount: Number(values.amount),
        description: values.description,
        date: values.date,
        categoryId: values.categoryId,
        receiptUrl,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Add transaction error:', error);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add {transactionType === 'expense' ? 'Expense' : 'Income'}</DialogTitle>
          <DialogDescription>
            Enter the details to record a new {transactionType}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs
          value={transactionType}
          onValueChange={(value) => setTransactionType(value as 'expense' | 'income')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
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
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="What was this for?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date)}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(transactionType === 'expense' ? expenseCategories : incomeCategories).map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {transactionType === 'expense' && (
                <FormItem>
                  <FormLabel>Receipt Image (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </FormControl>
                  {receiptFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected file: {receiptFile.name}
                    </p>
                  )}
                </FormItem>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={transactionType === 'expense' ? 'bg-expense' : 'bg-income'}
                >
                  Add {transactionType === 'expense' ? 'Expense' : 'Income'}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

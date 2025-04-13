
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define transaction types
export type TransactionCategory = {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color?: string;
  icon?: string;
  isDefault?: boolean;
};

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  categoryId: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Budget = {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId?: string;
  spent: number;
};

// Finance context type
type FinanceContextType = {
  // Transactions
  expenses: Transaction[];
  incomes: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Categories
  expenseCategories: TransactionCategory[];
  incomeCategories: TransactionCategory[];
  addCategory: (category: Omit<TransactionCategory, 'id'>) => void;
  updateCategory: (id: string, data: Partial<TransactionCategory>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => TransactionCategory | undefined;
  
  // Budgets
  budgets: Budget[];
  currentBudget: Budget | null;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Stats
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  topExpenseCategories: { categoryId: string; amount: number }[];
  getMonthlyExpenses: (month: number, year: number) => number;
  getMonthlyIncome: (month: number, year: number) => number;
};

// Initial default categories
const defaultExpenseCategories: TransactionCategory[] = [
  { id: 'exp-1', name: 'Food & Dining', type: 'expense', color: '#e63946', isDefault: true },
  { id: 'exp-2', name: 'Transportation', type: 'expense', color: '#e76f51', isDefault: true },
  { id: 'exp-3', name: 'Housing', type: 'expense', color: '#e9c46a', isDefault: true },
  { id: 'exp-4', name: 'Entertainment', type: 'expense', color: '#606c38', isDefault: true },
  { id: 'exp-5', name: 'Shopping', type: 'expense', color: '#4cc9f0', isDefault: true },
  { id: 'exp-6', name: 'Utilities', type: 'expense', color: '#7209b7', isDefault: true },
  { id: 'exp-7', name: 'Healthcare', type: 'expense', color: '#8ac926', isDefault: true },
  { id: 'exp-8', name: 'Other', type: 'expense', color: '#6c757d', isDefault: true },
];

const defaultIncomeCategories: TransactionCategory[] = [
  { id: 'inc-1', name: 'Salary', type: 'income', color: '#2a9d8f', isDefault: true },
  { id: 'inc-2', name: 'Freelance', type: 'income', color: '#4361ee', isDefault: true },
  { id: 'inc-3', name: 'Investments', type: 'income', color: '#560bad', isDefault: true },
  { id: 'inc-4', name: 'Gifts', type: 'income', color: '#fb8500', isDefault: true },
  { id: 'inc-5', name: 'Other', type: 'income', color: '#2b9348', isDefault: true },
];

// Sample data for development
const sampleExpenses: Transaction[] = [
  {
    id: 'exp-1',
    amount: 45.99,
    description: 'Grocery shopping',
    date: new Date(2025, 3, 10),
    categoryId: 'exp-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'exp-2',
    amount: 30.00,
    description: 'Gas',
    date: new Date(2025, 3, 8),
    categoryId: 'exp-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'exp-3',
    amount: 1200.00,
    description: 'Rent',
    date: new Date(2025, 3, 1),
    categoryId: 'exp-3',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'exp-4',
    amount: 60.50,
    description: 'Movie and dinner',
    date: new Date(2025, 3, 5),
    categoryId: 'exp-4',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleIncomes: Transaction[] = [
  {
    id: 'inc-1',
    amount: 3000.00,
    description: 'Monthly salary',
    date: new Date(2025, 3, 1),
    categoryId: 'inc-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'inc-2',
    amount: 500.00,
    description: 'Freelance project',
    date: new Date(2025, 3, 15),
    categoryId: 'inc-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleBudget: Budget = {
  id: 'bud-1',
  amount: 2000.00,
  month: 3, // April (0-indexed)
  year: 2025,
  spent: 1336.49, // Sum of all expenses
};

// Create the Finance context
const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Create the FinanceProvider component
export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Transaction[]>(sampleExpenses);
  const [incomes, setIncomes] = useState<Transaction[]>(sampleIncomes);
  const [expenseCategories, setExpenseCategories] = useState<TransactionCategory[]>(defaultExpenseCategories);
  const [incomeCategories, setIncomeCategories] = useState<TransactionCategory[]>(defaultIncomeCategories);
  const [budgets, setBudgets] = useState<Budget[]>([sampleBudget]);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(sampleBudget);
  const { toast } = useToast();

  // Calculate total income, expenses, and balance
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Calculate top expense categories
  const topExpenseCategories = React.useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach((expense) => {
      if (categoryTotals[expense.categoryId]) {
        categoryTotals[expense.categoryId] += expense.amount;
      } else {
        categoryTotals[expense.categoryId] = expense.amount;
      }
    });
    
    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => ({ categoryId, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [expenses]);

  // Update current budget's spent amount whenever expenses change
  useEffect(() => {
    if (currentBudget) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      if (currentBudget.month === currentMonth && currentBudget.year === currentYear) {
        const spent = expenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        setCurrentBudget(prev => prev ? { ...prev, spent } : null);
        
        // Update the budget in the budgets array
        setBudgets(prev => prev.map(budget => 
          budget.id === currentBudget.id ? { ...budget, spent } : budget
        ));
      }
    }
  }, [expenses]);

  // Transaction methods
  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `tr-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (getCategoryById(transactionData.categoryId)?.type === 'expense') {
      setExpenses(prev => [...prev, newTransaction]);
      toast({
        title: 'Expense added',
        description: `$${newTransaction.amount.toFixed(2)} added to expenses`,
      });
    } else {
      setIncomes(prev => [...prev, newTransaction]);
      toast({
        title: 'Income added',
        description: `$${newTransaction.amount.toFixed(2)} added to income`,
      });
    }
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    // Check if transaction is an expense or income
    const isExpense = expenses.some(e => e.id === id);
    const isIncome = incomes.some(i => i.id === id);

    if (isExpense) {
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? { ...expense, ...data, updatedAt: new Date() } : expense
      ));
      toast({
        title: 'Expense updated',
        description: 'Expense has been updated successfully',
      });
    } else if (isIncome) {
      setIncomes(prev => prev.map(income => 
        income.id === id ? { ...income, ...data, updatedAt: new Date() } : income
      ));
      toast({
        title: 'Income updated',
        description: 'Income has been updated successfully',
      });
    }
  };

  const deleteTransaction = (id: string) => {
    // Check if transaction is an expense or income
    const isExpense = expenses.some(e => e.id === id);
    const isIncome = incomes.some(i => i.id === id);

    if (isExpense) {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast({
        title: 'Expense deleted',
        description: 'Expense has been deleted successfully',
      });
    } else if (isIncome) {
      setIncomes(prev => prev.filter(income => income.id !== id));
      toast({
        title: 'Income deleted',
        description: 'Income has been deleted successfully',
      });
    }
  };

  // Category methods
  const addCategory = (categoryData: Omit<TransactionCategory, 'id'>) => {
    const newCategory: TransactionCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };

    if (categoryData.type === 'expense') {
      setExpenseCategories(prev => [...prev, newCategory]);
    } else {
      setIncomeCategories(prev => [...prev, newCategory]);
    }

    toast({
      title: 'Category added',
      description: `${newCategory.name} category has been added`,
    });
  };

  const updateCategory = (id: string, data: Partial<TransactionCategory>) => {
    // Check if category is an expense or income category
    const isExpenseCategory = expenseCategories.some(c => c.id === id);
    const isIncomeCategory = incomeCategories.some(c => c.id === id);

    if (isExpenseCategory) {
      setExpenseCategories(prev => prev.map(category => 
        category.id === id ? { ...category, ...data } : category
      ));
    } else if (isIncomeCategory) {
      setIncomeCategories(prev => prev.map(category => 
        category.id === id ? { ...category, ...data } : category
      ));
    }

    toast({
      title: 'Category updated',
      description: 'Category has been updated successfully',
    });
  };

  const deleteCategory = (id: string) => {
    // Check if category is an expense or income category
    const isExpenseCategory = expenseCategories.some(c => c.id === id);
    const isIncomeCategory = incomeCategories.some(c => c.id === id);

    // Don't allow deletion of default categories
    const category = getCategoryById(id);
    if (category?.isDefault) {
      toast({
        title: 'Cannot delete default category',
        description: 'Default categories cannot be deleted',
        variant: 'destructive',
      });
      return;
    }

    if (isExpenseCategory) {
      setExpenseCategories(prev => prev.filter(category => category.id !== id));
    } else if (isIncomeCategory) {
      setIncomeCategories(prev => prev.filter(category => category.id !== id));
    }

    toast({
      title: 'Category deleted',
      description: 'Category has been deleted successfully',
    });
  };

  const getCategoryById = (id: string): TransactionCategory | undefined => {
    return [...expenseCategories, ...incomeCategories].find(c => c.id === id);
  };

  // Budget methods
  const addBudget = (budgetData: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `bud-${Date.now()}`,
      spent: 0,
    };

    setBudgets(prev => [...prev, newBudget]);
    
    // If the budget is for the current month, set it as current
    const now = new Date();
    if (budgetData.month === now.getMonth() && budgetData.year === now.getFullYear()) {
      setCurrentBudget(newBudget);
    }

    toast({
      title: 'Budget added',
      description: `$${newBudget.amount.toFixed(2)} budget has been set`,
    });
  };

  const updateBudget = (id: string, data: Partial<Budget>) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === id ? { ...budget, ...data } : budget
    ));

    // If updating the current budget, update currentBudget state
    if (currentBudget && currentBudget.id === id) {
      setCurrentBudget(prev => prev ? { ...prev, ...data } : null);
    }

    toast({
      title: 'Budget updated',
      description: 'Budget has been updated successfully',
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
    
    // If deleting the current budget, set currentBudget to null
    if (currentBudget && currentBudget.id === id) {
      setCurrentBudget(null);
    }

    toast({
      title: 'Budget deleted',
      description: 'Budget has been deleted successfully',
    });
  };

  // Stats methods
  const getMonthlyExpenses = (month: number, year: number): number => {
    return expenses
      .filter(expense => {
        const date = new Date(expense.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getMonthlyIncome = (month: number, year: number): number => {
    return incomes
      .filter(income => {
        const date = new Date(income.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .reduce((sum, income) => sum + income.amount, 0);
  };

  return (
    <FinanceContext.Provider
      value={{
        expenses,
        incomes,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        expenseCategories,
        incomeCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        budgets,
        currentBudget,
        addBudget,
        updateBudget,
        deleteBudget,
        totalIncome,
        totalExpenses,
        balance,
        topExpenseCategories,
        getMonthlyExpenses,
        getMonthlyIncome,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

// Create a custom hook to use the FinanceContext
export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

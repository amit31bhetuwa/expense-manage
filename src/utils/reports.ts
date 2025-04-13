
import { Transaction, TransactionCategory } from '@/hooks/use-finance';

// Helper function to format date
export const formatDate = (date: Date): string => {
  return date instanceof Date
    ? date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Invalid Date';
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Generate CSV for transactions
export const generateTransactionCSV = (
  transactions: Transaction[],
  categories: TransactionCategory[]
): string => {
  // Define CSV header
  const header = 'Date,Description,Category,Amount\n';
  
  // Generate CSV rows
  const rows = transactions.map(transaction => {
    const category = categories.find(c => c.id === transaction.categoryId)?.name || 'Uncategorized';
    const date = formatDate(transaction.date);
    const description = transaction.description.replace(/,/g, ' '); // Remove commas to avoid CSV issues
    const amount = transaction.amount.toFixed(2);
    
    return `${date},${description},${category},${amount}`;
  }).join('\n');
  
  return header + rows;
};

// Download CSV file
export const downloadCSV = (data: string, filename: string): void => {
  // Create a blob with the CSV data
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Set link properties
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Generate monthly report
export const generateMonthlyReport = (
  expenses: Transaction[],
  incomes: Transaction[],
  expenseCategories: TransactionCategory[],
  incomeCategories: TransactionCategory[],
  month: number,
  year: number
): void => {
  // Filter transactions for the given month and year
  const monthlyExpenses = expenses.filter(expense => {
    const date = new Date(expense.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
  
  const monthlyIncomes = incomes.filter(income => {
    const date = new Date(income.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
  
  // Generate CSV for expenses
  const expensesCSV = generateTransactionCSV(monthlyExpenses, expenseCategories);
  
  // Generate CSV for incomes
  const incomesCSV = generateTransactionCSV(monthlyIncomes, incomeCategories);
  
  // Format month name for the filename
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  
  // Download expense report
  downloadCSV(expensesCSV, `expenses-${monthName}-${year}.csv`);
  
  // Download income report
  downloadCSV(incomesCSV, `income-${monthName}-${year}.csv`);
};

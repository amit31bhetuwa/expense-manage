
import React from 'react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency } from '@/utils/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateMonthlyReport } from '@/utils/reports';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Download } from 'lucide-react';

export function ReportsPage() {
  const {
    expenses,
    incomes,
    expenseCategories,
    incomeCategories,
    getCategoryById,
    getMonthlyExpenses,
    getMonthlyIncome,
  } = useFinance();
  
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
  
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);
  
  const months = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
    }));
  }, []);
  
  // Prepare expense data for pie chart
  const expensesByCategory = React.useMemo(() => {
    const filteredExpenses = expenses.filter(expense => {
      const date = new Date(expense.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
    
    const categoryTotals: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (categoryTotals[expense.categoryId]) {
        categoryTotals[expense.categoryId] += expense.amount;
      } else {
        categoryTotals[expense.categoryId] = expense.amount;
      }
    });
    
    return Object.entries(categoryTotals).map(([categoryId, amount]) => {
      const category = getCategoryById(categoryId);
      return {
        name: category?.name || 'Uncategorized',
        value: amount,
        color: category?.color || '#6c757d',
      };
    });
  }, [expenses, selectedMonth, selectedYear, getCategoryById]);
  
  // Prepare income data for pie chart
  const incomesByCategory = React.useMemo(() => {
    const filteredIncomes = incomes.filter(income => {
      const date = new Date(income.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
    
    const categoryTotals: Record<string, number> = {};
    
    filteredIncomes.forEach(income => {
      if (categoryTotals[income.categoryId]) {
        categoryTotals[income.categoryId] += income.amount;
      } else {
        categoryTotals[income.categoryId] = income.amount;
      }
    });
    
    return Object.entries(categoryTotals).map(([categoryId, amount]) => {
      const category = getCategoryById(categoryId);
      return {
        name: category?.name || 'Uncategorized',
        value: amount,
        color: category?.color || '#6c757d',
      };
    });
  }, [incomes, selectedMonth, selectedYear, getCategoryById]);
  
  // Prepare data for month-to-month comparison chart
  const monthlyComparisonData = React.useMemo(() => {
    const data = [];
    
    // Get data for 6 months (including selected month)
    for (let i = 5; i >= 0; i--) {
      let month = selectedMonth - i;
      let year = selectedYear;
      
      // Adjust for previous year
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      
      const monthName = new Date(year, month).toLocaleString('default', { month: 'short' });
      const monthExpenses = getMonthlyExpenses(month, year);
      const monthIncome = getMonthlyIncome(month, year);
      
      data.push({
        name: monthName,
        expenses: monthExpenses,
        income: monthIncome,
        balance: monthIncome - monthExpenses,
      });
    }
    
    return data;
  }, [selectedMonth, selectedYear, getMonthlyExpenses, getMonthlyIncome]);
  
  const handleExportReport = () => {
    generateMonthlyReport(
      expenses,
      incomes,
      expenseCategories,
      incomeCategories,
      selectedMonth,
      selectedYear
    );
  };
  
  // Calculate totals for the selected month
  const monthlyExpenseTotal = getMonthlyExpenses(selectedMonth, selectedYear);
  const monthlyIncomeTotal = getMonthlyIncome(selectedMonth, selectedYear);
  const monthlyBalance = monthlyIncomeTotal - monthlyExpenseTotal;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      {/* Date filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-[200px]">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-[200px]">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Monthly summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            Monthly Summary - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </CardTitle>
          <CardDescription>
            Overview of your income and expenses for the selected month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="text-2xl font-bold text-income">{formatCurrency(monthlyIncomeTotal)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold text-expense">{formatCurrency(monthlyExpenseTotal)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(monthlyBalance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expense Pie Chart */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>
              Distribution of expenses for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No expenses recorded for this month
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Income Pie Chart */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Income by Source</CardTitle>
            <CardDescription>
              Distribution of income for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomesByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {incomesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No income recorded for this month
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Month-to-month comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
          <CardDescription>
            Compare your expenses and income across the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={monthlyComparisonData}
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#2a9d8f" />
              <Bar dataKey="expenses" name="Expenses" fill="#e63946" />
              <Bar dataKey="balance" name="Balance" fill="#457b9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

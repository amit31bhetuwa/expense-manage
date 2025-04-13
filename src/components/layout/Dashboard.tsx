
import React from 'react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency } from '@/utils/reports';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TrendingDown, TrendingUp, DollarSign, Plus, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';

export function Dashboard() {
  const {
    balance,
    totalIncome,
    totalExpenses,
    expenses,
    incomes,
    topExpenseCategories,
    getCategoryById,
  } = useFinance();
  
  const [addTransactionOpen, setAddTransactionOpen] = React.useState(false);
  const [transactionType, setTransactionType] = React.useState<'expense' | 'income'>('expense');

  // Prepare data for pie chart
  const pieChartData = topExpenseCategories.map((category) => ({
    name: getCategoryById(category.categoryId)?.name || 'Uncategorized',
    value: category.amount,
    color: getCategoryById(category.categoryId)?.color || '#6c757d',
  }));

  // Prepare data for bar chart (last 6 months)
  const getLastSixMonthsData = () => {
    const data = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      
      const monthName = new Date(year, month).toLocaleString('default', { month: 'short' });
      
      // Filter expenses and incomes for this month
      const monthlyExpenses = expenses.filter(expense => {
        const date = new Date(expense.date);
        return date.getMonth() === month && date.getFullYear() === year;
      }).reduce((sum, expense) => sum + expense.amount, 0);
      
      const monthlyIncomes = incomes.filter(income => {
        const date = new Date(income.date);
        return date.getMonth() === month && date.getFullYear() === year;
      }).reduce((sum, income) => sum + income.amount, 0);
      
      data.push({
        name: monthName,
        expenses: monthlyExpenses,
        income: monthlyIncomes,
      });
    }
    
    return data;
  };

  const handleOpenAddExpense = () => {
    setTransactionType('expense');
    setAddTransactionOpen(true);
  };

  const handleOpenAddIncome = () => {
    setTransactionType('income');
    setAddTransactionOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleOpenAddExpense} className="bg-expense">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button onClick={handleOpenAddIncome} className="bg-income">
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Balance</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-sm text-muted-foreground">Current balance</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Income</CardTitle>
            <TrendingUp className="h-5 w-5 text-income" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-income">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-sm text-muted-foreground">Total income</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-expense" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-expense">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-sm text-muted-foreground">Total expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>
              Your top 3 spending categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>
              Last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getLastSixMonthsData()}
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
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/transactions">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                View All
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...expenses, ...incomes]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((transaction) => {
                const category = getCategoryById(transaction.categoryId);
                const isExpense = expenses.some(e => e.id === transaction.id);
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isExpense ? 'bg-expense/10' : 'bg-income/10'
                        }`}
                      >
                        <CreditCard className={`h-5 w-5 ${
                          isExpense ? 'text-expense' : 'text-income'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {category?.name} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-medium ${isExpense ? 'text-expense' : 'text-income'}`}>
                      {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                );
              })}
            
            {[...expenses, ...incomes].length === 0 && (
              <div className="flex justify-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        defaultType={transactionType}
      />
    </div>
  );
}

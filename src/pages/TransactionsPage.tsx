
import React from 'react';
import { useFinance } from '@/hooks/use-finance';
import { formatCurrency } from '@/utils/reports';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, MoreVertical, Download } from 'lucide-react';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { generateTransactionCSV, downloadCSV } from '@/utils/reports';

export function TransactionsPage() {
  const {
    expenses,
    incomes,
    expenseCategories,
    incomeCategories,
    getCategoryById,
    deleteTransaction,
  } = useFinance();
  
  const [addTransactionOpen, setAddTransactionOpen] = React.useState(false);
  const [transactionType, setTransactionType] = React.useState<'expense' | 'income'>('expense');
  const [activeTab, setActiveTab] = React.useState<'expense' | 'income'>('expense');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  
  const handleOpenAddTransaction = (type: 'expense' | 'income') => {
    setTransactionType(type);
    setAddTransactionOpen(true);
  };
  
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };
  
  const filteredTransactions = React.useMemo(() => {
    const transactions = activeTab === 'expense' ? expenses : incomes;
    
    return transactions.filter((transaction) => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || transaction.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [expenses, incomes, activeTab, searchTerm, selectedCategory]);
  
  const handleExportCSV = () => {
    const transactions = activeTab === 'expense' ? expenses : incomes;
    const categories = activeTab === 'expense' ? expenseCategories : incomeCategories;
    
    const csv = generateTransactionCSV(transactions, categories);
    downloadCSV(csv, `${activeTab}s.csv`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleOpenAddTransaction('expense')} className="bg-expense">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button onClick={() => handleOpenAddTransaction('income')} className="bg-income">
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </div>
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'expense' | 'income')}
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="icon" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Export to CSV</span>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-[200px]">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(activeTab === 'expense' ? expenseCategories : incomeCategories).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Transactions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => {
                    const category = getCategoryById(transaction.categoryId);
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category?.color }}
                            />
                            {category?.name || 'Uncategorized'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={activeTab === 'expense' ? 'text-expense' : 'text-income'}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>
      
      <AddTransactionDialog
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        defaultType={transactionType}
      />
    </div>
  );
}

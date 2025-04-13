
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { FinanceProvider } from "@/hooks/use-finance";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TransactionsPage } from "./pages/TransactionsPage";
import { BudgetPage } from "./pages/BudgetPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

const queryClient = new QueryClient();

const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto pl-64">
        {children}
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <AuthenticatedRoute>
                      <Index />
                    </AuthenticatedRoute>
                  } 
                />
                <Route 
                  path="/transactions" 
                  element={
                    <AuthenticatedRoute>
                      <TransactionsPage />
                    </AuthenticatedRoute>
                  } 
                />
                <Route 
                  path="/budget" 
                  element={
                    <AuthenticatedRoute>
                      <BudgetPage />
                    </AuthenticatedRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <AuthenticatedRoute>
                      <ReportsPage />
                    </AuthenticatedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <AuthenticatedRoute>
                      <SettingsPage />
                    </AuthenticatedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

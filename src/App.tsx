
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { getCurrentUser, AuthUser } from "./lib/supabase-auth";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
  }, []);
  
  if (isAuthenticated === null) {
    // Still checking authentication status
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

const App = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  
  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email!
        } : null);
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

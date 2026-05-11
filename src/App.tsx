import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TimerProvider } from "@/context/TimerContext";
import Auth from "./pages/Auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Demo from "./pages/Demo";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TimerProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

               <Route path="/demo" element={<Demo/>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>

        </TimerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import CompanySetup from "./pages/CompanySetup.tsx";
import Plans from "./pages/Plans.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ProjectCreate from "./pages/ProjectCreate.tsx";
import RestaurantDashboard from "./pages/RestaurantDashboard.tsx";
import EcommerceDashboard from "./pages/EcommerceDashboard.tsx";
import ServicesDashboard from "./pages/ServicesDashboard.tsx";
import RealEstateDashboard from "./pages/RealEstateDashboard.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import TenantsPage from "./pages/admin/TenantsPage.tsx";
import TenantDetailPage from "./pages/admin/TenantDetailPage.tsx";
import MetricsPage from "./pages/admin/MetricsPage.tsx";
import FeatureFlagsPage from "./pages/admin/FeatureFlagsPage.tsx";
import AIControlsPage from "./pages/admin/AIControlsPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/setup" element={<CompanySetup />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/new" element={<ProjectCreate />} />
          <Route path="/restaurant" element={<RestaurantDashboard />} />
          <Route path="/ecommerce" element={<EcommerceDashboard />} />
          <Route path="/services" element={<ServicesDashboard />} />
          <Route path="/real-estate" element={<RealEstateDashboard />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/tenants" replace />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="tenants/:id" element={<TenantDetailPage />} />
            <Route path="metrics" element={<MetricsPage />} />
            <Route path="feature-flags" element={<FeatureFlagsPage />} />
            <Route path="ai-controls" element={<AIControlsPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

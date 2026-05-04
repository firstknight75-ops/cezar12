import { Navigate } from "react-router-dom"
import { lazy, Suspense, type ReactNode } from "react"

const fallback = <div className="p-6 text-center">Loading...</div>
const wrap = (el: ReactNode) => <Suspense fallback={fallback}>{el}</Suspense>

const Index = lazy(() => import("../pages/Index"))
const Login = lazy(() => import("../pages/Login"))
const Register = lazy(() => import("../pages/Register"))
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"))
const ResetPassword = lazy(() => import("../pages/ResetPassword"))
const CompanySetup = lazy(() => import("../pages/CompanySetup"))
const Plans = lazy(() => import("../pages/Plans"))
const Dashboard = lazy(() => import("../pages/Dashboard"))
const ProjectCreate = lazy(() => import("../pages/ProjectCreate"))
const RestaurantDashboard = lazy(() => import("../pages/RestaurantDashboard"))

export const routes = [
  { path: "/", element: wrap(<Index />) },
  { path: "/login", element: wrap(<Login />) },
  { path: "/register", element: wrap(<Register />) },
  { path: "/forgot-password", element: wrap(<ForgotPassword />) },
  { path: "/reset-password", element: wrap(<ResetPassword />) },
  { path: "/setup", element: wrap(<CompanySetup />) },
  { path: "/plans", element: wrap(<Plans />) },
  { path: "/dashboard", element: wrap(<Dashboard />) },
  { path: "/projects/new", element: wrap(<ProjectCreate />) },
  { path: "/restaurant", element: wrap(<RestaurantDashboard />) },
  { path: "*", element: <Navigate to="/404" replace /> },
]

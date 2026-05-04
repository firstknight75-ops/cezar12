import { Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"

const Loader = () => <div className="p-6 text-center">Loading...</div>

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
const NotFound = lazy(() => import("../pages/NotFound"))

export const routes = [
  { path: "/", element: <Suspense fallback={<Loader />}><Index /></Suspense> },
  { path: "/login", element: <Suspense fallback={<Loader />}><Login /></Suspense> },
  { path: "/register", element: <Suspense fallback={<Loader />}><Register /></Suspense> },
  { path: "/forgot-password", element: <Suspense fallback={<Loader />}><ForgotPassword /></Suspense> },
  { path: "/reset-password", element: <Suspense fallback={<Loader />}><ResetPassword /></Suspense> },
  { path: "/setup", element: <Suspense fallback={<Loader />}><CompanySetup /></Suspense> },
  { path: "/plans", element: <Suspense fallback={<Loader />}><Plans /></Suspense> },
  { path: "/dashboard", element: <Suspense fallback={<Loader />}><Dashboard /></Suspense> },
  { path: "/projects/new", element: <Suspense fallback={<Loader />}><ProjectCreate /></Suspense> },
  { path: "/restaurant", element: <Suspense fallback={<Loader />}><RestaurantDashboard /></Suspense> },
  { path: "*", element: <Navigate to="/404" replace />, },
]

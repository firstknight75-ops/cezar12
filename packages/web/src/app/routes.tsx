import { createBrowserRouter, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"

import MainLayout from "../layouts/MainLayout"
import AuthLayout from "../layouts/AuthLayout"
import ProtectedRoute from "../components/ProtectedRoute"

const Loader = () => <div className="p-6 text-center">Loading...</div>

// Lazy imports (correct paths)
const Dashboard = lazy(() => import("../pages/dashboard"))
const Login = lazy(() => import("../pages/auth/login"))
const Register = lazy(() => import("../pages/auth/register"))
const Users = lazy(() => import("../pages/users"))
const Settings = lazy(() => import("../pages/settings"))
const NotFound = lazy(() => import("../pages/NotFound"))

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: (
      <Suspense fallback={<Loader />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { index: true, element: <Navigate to="/auth/login" replace /> },
    ],
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<Loader />}>
          <MainLayout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "users", element: <Users /> },
      { path: "settings", element: <Settings /> },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
])

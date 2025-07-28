// src/config/routes.tsx
import React from 'react';
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import TransactionsPage from "../pages/TransactionsPage";
import IncomePage from "../pages/IncomePage";
import AcceptInvitationPage from "../pages/AcceptInvitationPage";
import DashboardPage from "../pages/DashboardPage";
import ReportPage from "../pages/ReportPage";
import Household from "../pages/Household";
import UploadPage from "../pages/UploadPage";
import Onboarding from "../pages/Onboarding";
import AdminHouseholds from "../pages/admin/Households";
import SettingsPage from "../pages/SettingsPage";
import HelpPage from "../pages/HelpPage";
import RoadmapPage from "../pages/RoadmapPage";
import MVPPage from "../pages/MVPPage";
import ProtectedPaymentSuccess from "../pages/ProtectedPaymentSuccess";
import PublicPaymentSuccess from "../pages/PublicPaymentSuccess";
import BuyNow from "../pages/BuyNow";

interface RouteConfig {
  path: string;
  component: React.ReactNode;
  requiresAuth: boolean;
  layout: 'default' | 'admin' | 'public';
  requiresQuiltt?: boolean;
  requiresAdmin?: boolean;
  requiresActive?: boolean;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: "/signin",
    component: <SignIn />,
    requiresAuth: false,
    layout: 'public'
  },
  {
    path: "/signup",
    component: <SignUp />,
    requiresAuth: false,
    layout: 'public'
  },
  {
    path: "/public-success",
    component: <PublicPaymentSuccess />,
    requiresAuth: false,
    layout: 'public'
  },
  {
    path: "/accept-invitation/:id",
    component: <AcceptInvitationPage />,
    requiresAuth: false,
    layout: 'public'
  }
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: "/expenses",
    component: <TransactionsPage />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/income",
    component: <IncomePage />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/dashboard",
    component: <DashboardPage />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/onboarding",
    component: <Onboarding />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/buy",
    component: <BuyNow />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/payment/protected-success",
    component: <ProtectedPaymentSuccess />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/reports",
    component: <ReportPage />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/settings",
    component: <SettingsPage />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/help",
    component: <HelpPage />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/roadmap",
    component: <RoadmapPage />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/mvp",
    component: <MVPPage />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/household",
    component: <Household />,
    requiresAuth: true,
    layout: 'default'
  },
  {
    path: "/upload",
    component: <UploadPage />,
    requiresAuth: true,
    layout: 'default',
    requiresActive: true
  },
];

export const adminRoutes: RouteConfig[] = [
  {
    path: "/admin/households",
    component: <AdminHouseholds />,
    requiresAuth: true,
    layout: 'admin',
    requiresAdmin: true
  }
];

export const defaultRedirectPath = "/dashboard";
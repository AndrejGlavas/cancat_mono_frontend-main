// src/types/routes.ts
import { ReactNode } from 'react';
import { User } from './auth';

export interface LayoutProps {
  children: ReactNode;
}

export interface RouteConfig {
  path: string;
  component: ReactNode;
  requiresAuth: boolean;
  layout: 'default' | 'admin' | 'public';
  requiresQuiltt?: boolean;
  requiresAdmin?: boolean;
}
 
export interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  layout?: 'default' | 'admin' | 'public';
  requiresActive?: boolean;  // Add this
  canUpload?: boolean;      // Add this
}
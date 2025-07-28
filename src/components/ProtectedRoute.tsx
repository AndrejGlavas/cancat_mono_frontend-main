import { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { DefaultLayout, AdminLayout, PublicLayout } from './layouts';
import { ProtectedRouteProps } from '../types/routes';

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated,
  user,
  isAdmin,
  layout = 'default',
  requiresActive,
  canUpload
}) => {
  const location = useLocation();

  // Handle authentication
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Handle admin access
  if (isAdmin && !user?.isAdmin) {
    return <Navigate to="/expenses" replace />;
  }

  // Handle active status requirement
  if (requiresActive && !canUpload) {
    return <Navigate to="/buy" replace />;
  }

  // Render appropriate layout
  switch (layout) {
    case 'admin':
      return <AdminLayout>{children}</AdminLayout>;
    case 'public':
      return <PublicLayout>{children}</PublicLayout>;
    case 'default':
    default:
      return <DefaultLayout>{children}</DefaultLayout>;
  }
};
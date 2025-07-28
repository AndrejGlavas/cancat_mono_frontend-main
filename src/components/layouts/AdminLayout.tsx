import { FC } from 'react';
import AdminHeader from '../AdminHeader';
import { LayoutProps } from '../../types/routes';

export const AdminLayout: FC<LayoutProps> = ({ 
  children
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
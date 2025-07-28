// src/components/layouts/DefaultLayout.tsx
import { FC } from 'react';
import Header from '../Header';
import Subheader from '../Subheader';
import Footer from '../Footer';
import { LayoutProps } from '../../types/routes';

export const DefaultLayout: FC<LayoutProps> = ({ 
  children
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Subheader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};
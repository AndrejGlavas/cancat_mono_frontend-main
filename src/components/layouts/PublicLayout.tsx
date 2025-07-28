import { FC } from 'react';
import IntroHeader from '../IntroHeader';
import { LayoutProps } from '../../types/routes';

export const PublicLayout: FC<LayoutProps> = ({ 
  children 
}) => {
  return (
    <>
      <IntroHeader />
      <main className="flex-1">
        {children}
      </main>
    </>
  );
};
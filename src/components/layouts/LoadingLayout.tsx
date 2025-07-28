// src/components/layouts/LoadingLayout.tsx
import { FC } from 'react';

export const LoadingLayout: FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );
};
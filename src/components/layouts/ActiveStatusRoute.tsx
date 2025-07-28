// src/components/routes/ActiveStatusRoute.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ActiveStatusRoute = ({ children }: { children: React.ReactNode }) => {
  const { canUpload } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!canUpload) {
      navigate('/upgrade', { 
        state: { 
          message: 'Upload feature requires an active subscription',
          returnPath: '/upload'
        } 
      });
    }
  }, [canUpload, navigate]);

  if (!canUpload) return null;
  return <>{children}</>;
};
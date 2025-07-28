import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { quilttApi } from '../services/quilttApi';
import { useAuth } from '../hooks/useAuth';
import { createErrorResponse } from '../utils/errorHandling';

interface QuilttContextType {
  sessionToken: string | null;
  isInitializing: boolean;
  error: Error | null;
  reinitialize: () => Promise<void>;
  clearSession: () => void;
}

const QuilttContext = createContext<QuilttContextType | null>(null);

export const QuilttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(quilttApi.getSessionToken());
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated } = useAuth();

  const initializeQuiltt = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsInitializing(true);
    setError(null);

    try {
      const response = await quilttApi.initialize();
      if (response.status === 'success' && response.data?.sessionToken) {
        setSessionToken(response.data.sessionToken);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Quiltt initialization error:', error);
      const errorResponse = createErrorResponse(error);
      setError(new Error(errorResponse.message));
    } finally {
      setIsInitializing(false);
    }
  }, [isAuthenticated]);

  const clearSession = useCallback(() => {
    quilttApi.clearSessionToken();
    setSessionToken(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const existingToken = quilttApi.getSessionToken();
      if (!existingToken) {
        initializeQuiltt();
      }
    } else {
      clearSession();
    }
  }, [clearSession, initializeQuiltt, isAuthenticated]);

  return (
    <QuilttContext.Provider
      value={{
        sessionToken,
        isInitializing,
        error,
        reinitialize: initializeQuiltt,
        clearSession,
      }}
    >
      {children}
    </QuilttContext.Provider>
  );
};

export const useQuiltt = () => {
  const context = useContext(QuilttContext);
  if (!context) {
    throw new Error('useQuiltt must be used within a QuilttProvider');
  }
  return context;
};

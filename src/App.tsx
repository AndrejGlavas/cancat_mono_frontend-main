import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QuilttProvider as BaseQuilttProvider } from '@quiltt/react';
import { ToastProvider } from './components/ToastModule';
import { publicRoutes, protectedRoutes, adminRoutes } from './utils/routes';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingLayout, PublicLayout } from './components/layouts';
import { quilttApi } from './services/quilttApi';

const GoogleOAuthProvider = React.lazy(() =>
  import('@react-oauth/google').then((module) => ({
    default: module.GoogleOAuthProvider,
  }))
);

// Custom QuilttProvider wrapper
const QuilttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionToken, setSessionToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    const initializeQuiltt = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await quilttApi.initialize();
        if (response.status === 'success' && response.data?.sessionToken) {
          setSessionToken(response.data.sessionToken);
        }
      } catch (error) {
        console.error('Failed to initialize Quiltt:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeQuiltt();
  }, [isAuthenticated]);

  if (loading) {
    return <LoadingLayout />;
  }

  // Only initialize Quiltt if user is authenticated and we have a session token
  if (isAuthenticated && sessionToken) {
    return (
      <BaseQuilttProvider 
        clientId={import.meta.env.VITE_QUILTT_CLIENT_ID} 
        token={sessionToken}
      >
        {children}
      </BaseQuilttProvider>
    );
  }

  // Return children without Quiltt if not authenticated
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated, user, isAdmin, canUpload, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingLayout />;
  }

//ENVCHANGE change GoogleOAuthProvider to 1091404662259-u77443kgjetb0c80sj757qun701vamda.apps.googleusercontent.com

  return (
    <Suspense fallback={<LoadingLayout />}>
      <QuilttProvider>
        <GoogleOAuthProvider clientId="980253608759-krprok4is8kto2rc79ft0kggad8lmhq5.apps.googleusercontent.com">
          <ToastProvider>
            <Router>
              {!isAuthenticated ? (
                // Public routes (signin, signup, etc.)
                <Routes>
                  {publicRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={<PublicLayout>{route.component}</PublicLayout>}
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/signin" replace />} />
                </Routes>
              ) : (
                // Protected routes (requires authentication)
                <Routes>
                    {protectedRoutes.map(({ path, component, requiresAuth, layout, requiresActive }) => (
                           <Route
                           key={path}
                           path={path}
                           element={
                             <ProtectedRoute
                               isAuthenticated={isAuthenticated}
                               user={user}
                               isAdmin={isAdmin}
                               layout={layout}
                               requiresActive={requiresActive}
                               canUpload={canUpload}
                             >
                               {component}
                             </ProtectedRoute>
                           }
                         />
                  ))}

                  {adminRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <ProtectedRoute
                          isAuthenticated={isAuthenticated}
                          user={user}
                          isAdmin={true}
                          layout="admin"
                        >
                          {route.component}
                        </ProtectedRoute>
                      }
                    />
                  ))}

                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              )}
            </Router>
          </ToastProvider>
        </GoogleOAuthProvider>
      </QuilttProvider>
    </Suspense>
  );
};

export default App;
import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useQuilttSession } from '@quiltt/react';
import { signIn, googleSignIn } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/input';
import { Form } from '../components/ui/form';
import { useAuth } from '../hooks/useAuth';


const SignIn: React.FC = () => {
  const { checkAuth } = useAuth();
  const { importSession } = useQuilttSession();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInSuccess = async (responseData: any) => {
    try {
      // Store tokens
      localStorage.setItem('accessToken', responseData.accessToken);
      localStorage.setItem('refreshToken', responseData.refreshToken);

      // Import Quiltt session if available
      if (responseData.quilttSession) {
        await importSession(responseData.quilttSession);
      }

      // Wait for auth state to update
      await checkAuth();
      
      // Use replace to prevent back navigation to login
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Sign in success handler error:', error);
      setError('Error completing sign in');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn(form.email, form.password);
      if (res.status === 'success' && res.data) {
        await handleSignInSuccess(res.data);
      } else {
        setError(res.error?.message || 'Sign in failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Connection error');
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError('');

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received');
      }

      const res = await googleSignIn(credentialResponse.credential);
      if (res.data) {
        await handleSignInSuccess(res.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setError(error instanceof Error ? error.message : 'Google sign in failed');
      setIsLoading(false);
    }
  };



  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-center font-bold text-2xl">Sign In</h2>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isLoading}
                required
              />

              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={isLoading}
                required
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </Form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-gray-300 border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign in failed')}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/signup"
              className="font-medium text-indigo-600 text-sm hover:text-indigo-500"
            >
              Need an account? Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;

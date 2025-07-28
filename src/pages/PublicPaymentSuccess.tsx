// src/pages/PublicPaymentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { stripeApi } from '../services/stripeApi';

const PublicPaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          setStatus('error');
          return;
        }

        // Check payment status
        const result = await stripeApi.getSessionStatus(sessionId);
        
        if (result.status === 'complete' || 
            result.paymentRecord?.paymentStatus === 'COMPLETED') {
          setStatus('success');
          
          // If user is authenticated, redirect to protected success page
          if (isAuthenticated) {
            navigate('/dashboard/payment-success');
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [searchParams, isAuthenticated, navigate]);

  const handleLogin = () => {
    // Store success redirect in session storage
    sessionStorage.setItem('postLoginRedirect', '/dashboard/payment-success');
    login(); // Assuming this redirects to login page
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-6 bg-white rounded-lg shadow-sm max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-6 bg-white rounded-lg shadow-sm max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-4">We couldn't verify your payment. Please contact support if you believe this is an error.</p>
            <button 
              onClick={() => navigate('/contact')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="p-6 bg-white rounded-lg shadow-sm max-w-md w-full">
        <div className="text-center">
          <div className="mb-4 text-green-500">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Thank you for your payment. Your account has been activated.</p>
          
          {!isAuthenticated ? (
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In to Continue
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard/payment-success')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicPaymentSuccess;
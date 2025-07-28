import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const BuyNow: React.FC = () => {
  const { 
    user, 
    isLoading, 
    householdStatus,
    isTrialUser,
    requiresPayment,
    isExpired 
  } = useAuth();
  const [showTestDetails, setShowTestDetails] = useState(false);

  useEffect(() => {
    // Load Stripe buy button script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  const shouldShowBuyButton = requiresPayment;

  const getStatusMessage = () => {
    if (householdStatus === 'ACTIVE') {
      return "You have already completed the payment process.";
    }
    if (isExpired) {
      return "Your trial period has expired. Please subscribe to continue using the service.";
    }
    if (isTrialUser) {
      return "You are currently in your trial period. Subscribe now to continue using the service after your trial ends.";
    }
    if (householdStatus === 'PENDING_PAYMENT') {
      return "Your payment is being processed.";
    }
    return `Current status: ${householdStatus || 'Unknown'}`;
  };

  return (
    <div className="bg-gray-200 p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Thanks for joining the MVP</h2>
          
          {/* Debug info */}
          {import.meta.env.DEV && (
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <p className="text-sm font-mono">
                Debug Info:<br />
                Household Status: {householdStatus}<br />
                Is Trial User: {isTrialUser ? 'Yes' : 'No'}<br />
                Is Expired: {isExpired ? 'Yes' : 'No'}<br />
                Requires Payment: {requiresPayment ? 'Yes' : 'No'}<br />
                Show Buy Button: {shouldShowBuyButton ? 'Yes' : 'No'}<br />
                Role: {user.role}
              </p>
            </div>
          )}
          
          {/* Test card details */}
          {import.meta.env.DEV && (
            <button 
              onClick={() => setShowTestDetails(!showTestDetails)}
              className="mb-4 text-sm text-gray-500 hover:text-gray-700"
            >
              {showTestDetails ? 'Hide' : 'Show'} Test Card Details
            </button>
          )}
          
          {showTestDetails && (
            <div className="mb-4 p-4 bg-gray-100 rounded text-sm font-mono">
              <div>Card: 4242 4242 4242 4242</div>
              <div>Exp: 12/34</div>
              <div>CVC: 123</div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            {getStatusMessage()}
          </p>

          {shouldShowBuyButton && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Subscribe Now</h3>
                <stripe-buy-button
                  buy-button-id="buy_btn_1QqNOrGhOUvb0UDhCTTQcxGo"
                  publishable-key="pk_test_51QddIrGhOUvb0UDhzMnZ0Qm5kT9TYS0jywAuyECkrc9hBrHHnrkCAgmJEhKaZLEeVi8NyIwzS7jkgFmwXV8bC00G00KDYwtxxr"
                  client-reference-id={user.id.toString()}
                  customer-email={user.email}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyNow;
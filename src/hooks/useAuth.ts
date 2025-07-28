import { useState, useEffect } from 'react';
import { User, UserStatus, AccountStatus, AuthState } from '../types/auth';
import { fetchUser } from '../services/userApi';
import { Household } from '../types/auth';

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const logAuthState = (userData: User | null) => {
    console.log('Auth Debug:', {
      userData,
      household_primary: userData?.household_primary,
      household_partner: userData?.household_partner,
      household_finance: userData?.household_finance,
      role: userData?.role,
      status: userData?.status
    });
  };

  const handleTimeout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = 'https://cancat.io/timeout';
  };

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
   
      if (!accessToken || !refreshToken) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
   
      const response = await fetchUser();
      console.log('User API Response:', response);

      if (response.status === 'success' && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        logAuthState(response.data);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken")) {
        handleTimeout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Get the active household and status information
  const activeHousehold = user?.household_primary || user?.household_partner || user?.household_finance;
  const activeRole = user?.role || null;
  const userStatus = user?.status as UserStatus | null;
  const householdStatus = activeHousehold?.accountStatus as AccountStatus | null;
  const taxYear = activeHousehold?.taxYear || null;

  // Determine various states
  const isTrialUser = userStatus === 'TRIAL' || householdStatus === 'TRIAL';
  const isExpired = userStatus === 'EXPIRED' || householdStatus === 'EXPIRED';
  const canInviteUsers = user?.role === 'PRIMARY' && userStatus === 'ACTIVE';
  const requiresPayment = isTrialUser || isExpired || householdStatus === 'PENDING_PAYMENT';
  
  // User can upload only if both user and household are ACTIVE
  const canUpload = !isTrialUser && !isExpired && 
                   userStatus === 'ACTIVE' && 
                   householdStatus === 'ACTIVE' && 
                   !requiresPayment;

  // Debug state changes
  useEffect(() => {
    if (user) {
      console.log('Auth State Update:', {
        activeHousehold,
        householdStatus,
        activeRole,
        userStatus,
        isTrialUser,
        taxYear,
        isExpired,
        requiresPayment,
        canUpload,
        user
      });
    }
  }, [user, activeHousehold, userStatus, householdStatus]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isTrialUser,
    activeRole,
    householdStatus,
    taxYear: activeHousehold?.taxYear || null,
    businessPercentage: activeHousehold?.businessPercentage || null,
    totalTransactions: activeHousehold?.totalTransactions || null,
    isAdmin: user?.isAdmin || false,
    canInviteUsers,
    requiresPayment,
    isExpired,
    canUpload,
    login: (redirect = window.location.pathname) => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(redirect)}`;
    },
    logout: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/auth/login';
    },
    checkAuth
  };
};

export default useAuth;
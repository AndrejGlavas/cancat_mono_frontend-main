import type React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useQuilttSession } from '@quiltt/react';
import { IoClose } from 'react-icons/io5';
import { signUp, googleSignIn } from '../services/authApi';

const SignUp: React.FC = () => {
  const { importSession } = useQuilttSession();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      navigateToTransactions();
    }
  }, []);

  const navigateToTransactions = () => {
    try {
      window.location.href = '/transactions';
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Failed to navigate after successful sign up');
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newFieldErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    };

    if (!firstName.trim()) {
      newFieldErrors.firstName = 'First name required';
      isValid = false;
    }

    if (!lastName.trim()) {
      newFieldErrors.lastName = 'Last name required';
      isValid = false;
    }

    if (!email.trim()) {
      newFieldErrors.email = 'Valid email required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newFieldErrors.email = 'Valid email required';
      isValid = false;
    }

    if (!phone.trim()) {
      newFieldErrors.phone = 'Mobile required';
      isValid = false;
    }

    if (!password) {
      newFieldErrors.password = 'Password must contain 8 characters + 1 letter and 1 number';
      isValid = false;
    } else {
      const hasMinLength = password.length >= 8;
      const hasLetter = /[A-Za-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (!hasMinLength || !hasLetter || !hasNumber) {
        newFieldErrors.password = 'Password must contain 8 characters + 1 letter and 1 number';
        isValid = false;
      }
    }

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await signUp({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      });

      if (res.status === 'success' && res.data) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);

        // Import Quiltt session if available
        if (res.data.quilttSession) {
          await importSession(res.data.quilttSession);
        }

        navigateToTransactions();
      } else {
        setError(res.error?.message || 'Sign up failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (isLoading || !navigator.onLine) return;

    setIsLoading(true);
    try {
      if (credentialResponse.credential) {
        const res = await googleSignIn(credentialResponse.credential);
        if (res.status === 'success' && res.data) {
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);

          // Import Quiltt session if available
          if (res.data.quilttSession) {
            await importSession(res.data.quilttSession);
          }

          navigateToTransactions();
        } else {
          setError(res.error?.message || 'Sign up failed');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Panel */}
      <div className="flex w-full flex-col justify-center px-8 py-12 md:w-1/2">
        <div className="mx-auto w-full max-w-md">
          {error && (
            <div
              className="relative mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
              role="alert"
            >
              <strong className="mx-2 font-bold">Error!</strong>
              <span className="block sm:inline">{error}</span>
              <span className="absolute top-0 right-0 bottom-0 px-4 py-3">
                <IoClose
                  onClick={() => setError('')}
                  className="h-6 w-6 fill-current text-red-500"
                />
              </span>
            </div>
          )}

          <h2 className="mb-6 text-center font-semibold text-3xl text-gray-600">
            Create a New Account
          </h2>

          <div className="mb-4 text-center">
            <Link
              to="/signin"
              className="font-medium text-indigo-600 text-sm hover:text-indigo-500"
            >
              (Already have an account? <u>Click Here to Sign In</u>)
            </Link>
          </div>

          <div className="rounded-lg bg-white p-8 shadow">
            <div className="space-y-6">
              <div className="relative flex text-sm">
                <span className="bg-white text-indigo-600 text-lg">
                  Sign up with your Google login
                </span>
              </div>

              <div className="flex w-full justify-center">
                <div style={{ width: '100%' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Sign up failed')}
                    theme="outline"
                    size="large"
                    width="100%"
                    text="signup_with"
                    shape="rectangular"
                    useOneTap
                  />
                </div>
              </div>

              <div className="relative flex justify-center text-sm">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-gray-300 border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="relative flex text-sm">
                    <span className="bg-white text-indigo-600 text-lg">
                      Create new account using your email
                    </span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      {fieldErrors.firstName && (
                        <p className="mb-1 text-red-500 text-sm">{fieldErrors.firstName}</p>
                      )}
                      <label
                        htmlFor="firstName"
                        className="block font-medium text-gray-700 text-sm"
                      >
                        First Name
                      </label>
                      <div className="mt-1">
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="w-1/2">
                      {fieldErrors.lastName && (
                        <p className="mb-1 text-red-500 text-sm">{fieldErrors.lastName}</p>
                      )}
                      <label htmlFor="lastName" className="block font-medium text-gray-700 text-sm">
                        Last Name
                      </label>
                      <div className="mt-1">
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    {fieldErrors.email && (
                      <p className="mb-1 text-red-500 text-sm">{fieldErrors.email}</p>
                    )}
                    <label htmlFor="email" className="block font-medium text-gray-700 text-sm">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    {fieldErrors.phone && (
                      <p className="mb-1 text-red-500 text-sm">{fieldErrors.phone}</p>
                    )}
                    <label htmlFor="phone" className="block font-medium text-gray-700 text-sm">
                      Mobile Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    {fieldErrors.password && (
                      <p className="mb-1 text-red-500 text-sm">{fieldErrors.password}</p>
                    )}
                    <label htmlFor="password" className="block font-medium text-gray-700 text-sm">
                      Password
                      <br />
                      <span className="font-light text-slate-700 italic">
                        must contain 8 characters + 1 letter and 1 number
                      </span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <div className="block font-medium text-gray-700 text-sm">
                      Are you an accountant or financial professional?
                      <br />
                      <span className="font-light text-slate-700 italic">
                        "Yes" if you plan to invite your clients to use CanCat.
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-center space-x-2">
                      <span className="text-gray-500 text-sm">No</span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" disabled={isLoading} />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[' peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
                      </label>
                      <span className="text-gray-500 text-sm">Yes</span>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 font-bold text-white text-xl uppercase shadow-sm ${
                        isLoading
                          ? 'cursor-not-allowed bg-indigo-400'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      {isLoading ? 'Signing up...' : 'Sign up'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}

      <div className="hidden w-1/2 flex-col justify-center bg-indigo-50 p-12 md:flex">
        <div className="mx-auto max-w-lg">
          <h2 className="mb-6 font-bold text-3xl text-indigo-900">Welcome to CanCat</h2>
          <div className="prose prose-indigo">
            <p className="mb-4 text-indigo-900 text-lg">
              CanCat is designed to give you the quickest, most efficient solution to organizing
              your financial details for your tax-preparer or for your own personal use.
            </p>
            <h3 className="mb-3 font-semibold text-indigo-800 text-xl">Why Choose CanCat?</h3>
            <ul className="space-y-2 text-indigo-900">
              <li>We are designed for one purpose only: tax prep.</li>
              <li>We are not bookkeeping software. Get in, get out.</li>
            </ul>
            <h3 className="mt-6 mb-3 font-semibold text-indigo-800 text-xl">Getting Started</h3>
            <p className="text-indigo-900 text-lg">
              After you create your account, you will see "Start Here," an onboarding series of
              quick questions and a tutorial to help you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

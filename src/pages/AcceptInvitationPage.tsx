import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { acceptInvitationSignup, googleAcceptInvitation, getInvitationPublicDetails } from "../services/authApi";

const AcceptInvitationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedUser, setLoggedUser] = useState<boolean>(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [household, setHousehold] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoggedUser(false);
          return;
        }
  
        const response = await getInvitationPublicDetails(id!);
        if (response.status === 'success' && response.data) {
          setFirstName(response.data.first_name);
          setLastName(response.data.last_name);
          setHousehold(response.data.household.label);
        } else {
          throw new Error(response.error?.message);
        }
      } catch (err) {
        console.error("Error details:", err);
        setError(`Failed to load invitation details: ${(err as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchInvitationDetails();
  }, [id]);

  const validateForm = () => {
    let isValid = true;
    const newFieldErrors = {
      email: "",
      phone: "",
      password: "",
    };

    if (!email.trim()) {
      newFieldErrors.email = "Valid email required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newFieldErrors.email = "Valid email required";
      isValid = false;
    }

    if (!phone.trim()) {
      newFieldErrors.phone = "Mobile required to validate your account";
      isValid = false;
    }

    if (!password) {
      newFieldErrors.password = "Password must contain 8 characters + 1 letter and 1 number";
      isValid = false;
    } else {
      const hasMinLength = password.length >= 8;
      const hasLetter = /[A-Za-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (!hasMinLength || !hasLetter || !hasNumber) {
        newFieldErrors.password = "Password must contain 8 characters + 1 letter and 1 number";
        isValid = false;
      }
    }

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const res = await acceptInvitationSignup({
        invitation_id: id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      });
  
      if (res.status === 'success' && res.data) {
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        window.location.href = "/households";
      } else {
        setError(res.error?.message || 'Failed to accept invitation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    }
  };

const handleGoogleSuccess = async (credentialResponse: any) => {
  try {
    const res = await googleAcceptInvitation(credentialResponse);

    if (res.status === 'success' && res.data) {
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      window.location.href = "/transactions";
    } else {
      setError(res.error?.message || 'Failed to sign in with Google');
    }
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full flex items-center justify-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (loggedUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join the {household}
        </h2>
      </div>

      <div className="lg:w-96 mt-8 sm:mx-auto sm:w-full sm:max-w-md w-40">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full">
          <form className="space-y-6 w-full" onSubmit={handleSubmit}>
            <p className="text-sm text-black italic text-center">
              All fields are required
            </p>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <div className="mt-1">{firstName}</div>
              </div>
              <div className="w-1/2">
                <div className="mt-1">{lastName}</div>
              </div>
            </div>

            <div>
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mb-1">{fieldErrors.email}</p>
              )}
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              {fieldErrors.phone && (
                <p className="text-red-500 text-sm mb-1">{fieldErrors.phone}</p>
              )}
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Mobile Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              {fieldErrors.password && (
                <p className="text-red-500 text-sm mb-1">{fieldErrors.password}</p>
              )}
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xl font-bold uppercase text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign up
              </button>
            </div>

            <div className="mt-4">
              <div className="relative flex justify-center text-sm">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign in failed")}
                    theme="outline"
                    size="large"
                    width="100%"
                    text="signup_with"
                    shape="rectangular"
                    useOneTap
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
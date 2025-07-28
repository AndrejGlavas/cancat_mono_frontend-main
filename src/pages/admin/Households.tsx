import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { adminApi } from "../../services/adminApi";
import { fetchUser } from "../../services/userApi";
import isAdmin from "../../hooks/useAuth";
import { 
  HouseholdsResponse, 
  UserRole, 
  User, 
  UserStatus, 
  AccountStatus,
  ApiResponse
} from "../../types/auth";

const Household: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [households, setHouseholds] = useState<HouseholdsResponse[]>([]);

  const getHouseholds = async () => {
    try {
      const householdsData = await adminApi.getHouseholds();
      setHouseholds(householdsData);
    } catch (error) {
      console.error("Failed to fetch households:", error);
    }
  };

  const getUser = async () => {
    try {
      const response: ApiResponse<User> = await fetchUser();
      if (response.status === 'success' && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  useEffect(() => {
    getUser();
    getHouseholds();
  }, []);

  const getStatusColor = (status: UserStatus | AccountStatus | undefined) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600';
      case 'TRIAL':
        return 'text-blue-600';
      case 'EXPIRED':
        return 'text-red-600';
      case 'PENDING_PAYMENT':
        return 'text-yellow-600';
      case 'NEW':
        return 'text-purple-600';
      case 'INACTIVE':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatStatus = (status: string | undefined) => {
    if (!status) return '';
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  };

  const userStatus = (
    _household: HouseholdsResponse, 
    user: (HouseholdsResponse['primary_user'] | HouseholdsResponse['partner_user'] | HouseholdsResponse['finance_user']) & { isAdmin?: boolean }
  ) => {
    if (!user) return "";

    if (user.userNotExist) {
      return (
        <div className={getStatusColor(user.status)}>
          {formatStatus(user.status)}
        </div>
      );
    }

    return (
      <div className={getStatusColor(user.status)}>
        {formatStatus(user.status)}
      </div>
    );
  };

  const handleDeleteUser = async (userId: string | number | undefined) => {
    if (!userId) return;
    try {
      await adminApi.deleteUser(userId);
      getHouseholds();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };
   
  const handleToggleAdmin = async (userId: string | number | undefined, currentIsAdmin: boolean) => {
    if (!userId) return;
    try {
      await adminApi.toggleAdmin(userId, currentIsAdmin);
      getHouseholds();
    } catch (error) {
      console.error('Toggle admin failed:', error);
    }
  };

  const isEligibleForDeletion = (household: HouseholdsResponse, userRole?: UserRole) => {
    if (!userRole) return false;
    if (userRole === 'PARTNER' || userRole === 'FINANCE') return true;
    return !household.partner_user && !household.finance_user;
  };

  const HouseholdStatus: React.FC<{ status: AccountStatus }> = ({ status }) => (
    <div className={`font-semibold ${getStatusColor(status)}`}>
      {formatStatus(status)}
    </div>
  );

  return (
    <div className="bg-gray-200 p-8 min-h-screen">
      <div>
        <h1 className="text-3xl mb-10 font-bold">
          Admin Dashboard - {user ? user.name : ""}
        </h1>

        <div className="col-span-full flex justify-between">
          <div className="bg-white rounded-lg p-6 mr-6 w-2/3">
            <h2 className="text-2xl font-bold mb-4 text-[#4338ca]">
              Households
            </h2>

            <div>
              {households.length > 0 && households.map((household) => (
                household?.primary_user && (
                  <div className="mb-5" key={household.id}>
                    <table className="border-collapse w-full">
                      <thead>
                        <tr className="border border-solid border-gray-300 text-left">
                          <th colSpan={2} className="text-xl px-5 py-1">
                            {household.label}
                          </th>
                          <th colSpan={2} className="text-right px-5 py-1">
                            <HouseholdStatus status={household.accountStatus} />
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="border border-solid border-gray-300">
                          <td className="w-1/4 px-5">
                            <div className="text-xl min-h-8">
                              {household?.primary_user?.userNotExist
                                ? `${household?.primary_user?.first_name || ''} ${household?.primary_user?.last_name || ''}`
                                : household?.primary_user?.name}
                            </div>
                            <div className="flex flex-col text-sm">
                              <div className="text-gray-600">
                                {household?.primary_user?.email || 'No email'}
                              </div>
                              <div className="flex">
                                <div className="mr-1">Last signed in at</div>
                                <div>
                                  {household?.primary_user?.updatedAt &&
                                    format(new Date(household.primary_user.updatedAt), "MM/dd/yy")}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="w-1/4 px-5 py-3">
                            {userStatus(household, household?.primary_user)}
                          </td>

                          <td className="w-1/4 px-5 py-3">
                            <button className="underline border-2 p-2 rounded text-sm">
                              Reset Password
                            </button>
                          </td>

                          <td className="w-1/4 px-5 py-3 flex justify-between">
                            <button 
                              className={`border-2 p-2 text-sm rounded m-2 w-200 bg-white ${
                                !isEligibleForDeletion(household, household.primary_user?.role) 
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''
                              }`}
                              disabled={!isEligibleForDeletion(household, household.primary_user?.role)}
                              onClick={() => handleDeleteUser(household.primary_user?.id)}
                            >
                              Delete User
                            </button>
                            {household?.primary_user && household.primary_user.isAdmin !== undefined && (
                              <button 
                                className={`p-2 m-2 text-sm rounded ${
                                  household.primary_user.isAdmin 
                                  ? 'bg-white border-2' 
                                  : 'bg-gray-200'
                                }`}
                                onClick={() => handleToggleAdmin(
                                  household.primary_user.id, 
                                  household.primary_user.isAdmin ?? false
                                )}
                              >
                                {household.primary_user.isAdmin ? 'Admin' : 'Make Admin'}
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Partner and Finance user rows would go here */}
                      </tbody>

                      <tfoot>
                        <tr className="border border-solid border-gray-300">
                          <td className="w-1/4 px-5 py-5">
                            Total Transactions Uploaded:
                          </td>
                          <td className="w-1/4 px-5 py-5">
                            {household.totalTransactions}
                          </td>
                          <td className="w-1/4 px-5 py-5"></td>
                          <td className="w-1/4 px-5 py-5"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Household;
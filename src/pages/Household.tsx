import { useEffect, useState } from "react";
import { User } from "../types/auth"; 
import { fetchUser } from "../services/userApi";

const Household: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const response = await fetchUser();
      if (response.status === 'success' && response.data) {
        setUser(response.data);
      }
    };
    getUser();
  }, []);

  return (
    <div className="bg-gray-200 p-8">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="flex mb-6">
            <h2 className="text-lg mr-10 font-bold">Your Household</h2>
            <h2 className="text-base">
              Filing taxes is a team-effort. Invite your spouse and accountant to collaborate.
            </h2>
          </div>
          <div className="bg-white rounded-lg p-10 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-[#4338ca]">
              Primary Member
            </h2>
            <ul className="space-y-2">
              {user && <li>{user.name} (you)</li>}
              
            </ul>
          </div>
   
        </div>
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="bg-white rounded-lg p-8 h-80">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#4338ca]">
                  Invite Your Spouse/Partner
                </h2>
              </div>
              <p className="mb-4">
                If you will file a <strong>joint tax return</strong> with your spouse, you can invite them to join your household on CanCat
                to collaborate.
              </p>
              <div className="text-red-500">
                Coming soon
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-lg p-8 h-80">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#4338ca]">
                  Invite Your Accountant
                </h2>
              </div>
              <p className="mb-4">
                CanCat allows you to Flag transactions so that you can share them
                with your accountant. Invite your accountant to join your
                household to assist you in real-time.
              </p>
              <div className="text-red-500">
                Coming soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Household;
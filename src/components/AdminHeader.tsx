// node_modules
import React from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigation = useNavigate();

  return (
    <header className="bg-[#4338ca] text-white pt-10 pr-10 pl-10">
      <div className="container mx-auto">
        <img src="/logo_temporary.png" alt="Cancat Logo" className="h-8" />

        <div className={`w-full lg:w-auto flex mt-4 lg:mt-0 justify-center`}>
          <ul className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4 mb-5">
            <li
              className={`flex items-center mr-5 ${
                window.location.pathname === "/admin/households"
                  ? "text-yellow-500"
                  : ""
              }`}
            >
              <button onClick={() => navigation("/admin/households")}>
                Households
              </button>
            </li>
            <li
              className={`flex items-center ${
                window.location.pathname === "/admin/users"
                  ? "text-yellow-500"
                  : ""
              }`}
            >
              <button onClick={() => navigation("/admin/users")}>Users</button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;

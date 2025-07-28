import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Upload } from 'lucide-react';
import FeedbackModal from "./ui/FeedbackModal";
import { useAuth } from "../hooks/useAuth";

const Subheader: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const tabs = ['Dashboard', 'Income', 'Expenses', 'Reports'];
  const navigate = useNavigate();
  const location = useLocation();
  const { canUpload } = useAuth();


  useEffect(() => {
    // Get the path without the leading slash and convert to lowercase
    const path = location.pathname.slice(1).toLowerCase();
    
    // If path is empty, set Dashboard as active
    if (!path) {
      setActiveTab('Dashboard');
      return;
    }
  
    // Handle exact matches
    const matchingTab = tabs.find(tab => tab.toLowerCase() === path);
    if (matchingTab) {
      setActiveTab(matchingTab);
    } else {
      // Handle any additional path variations if needed
      switch (path) {
        case 'expenses':
          setActiveTab('Expenses');
          break;
        default:
          setActiveTab('');
      }
    }
  }, [location, tabs]);

  return (
    <nav className="bg-[#C4C1F6] text-white pt-4">
      <div className="flex flex-col md:flex-row justify-center items-center">
        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto`}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`pb-1 px-8 py-2 rounded-t-lg transition duration-300 ease-in-out ${
                activeTab === tab
                  ? "bg-white text-[#4f46e5] font-bold"
                  : "bg-[#E5E1FE] hover:bg-[#dbd6fc] text-black font-medium"
              }`}
              onClick={() => {
                setActiveTab(tab);
                navigate(`/${tab.toLowerCase()}`);
                setIsMenuOpen(false);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div>
        <button 
              className={`px-2 py-1 border-b mx-20 border-black-200 rounded transition duration-300 ease-in-out bg-white 
                ${canUpload 
                  ? 'hover:bg-[#dbd6fc]' 
                  : 'opacity-50 cursor-not-allowed'
                } 
                text-black text-sm font-bold flex items-center gap-1`}
              onClick={() => {
                if (canUpload) {
                  navigate('/upload');
                  setIsMenuOpen(false);
                } else {
                  navigate('/buy');
                }
              }}
            >
              <Upload className={`${canUpload ? 'text-green-500' : 'text-gray-400'}`} size={12} />
              <span>UPLOAD</span>
            </button>
        </div>
        <div>
          <button
            className="px-2 py-1 border-b mx-20 border-black-200 rounded transition duration-300 ease-in-out bg-indigo-100 hover:bg-[#dbd6fc] text-black font-semibold text-sm flex items-center gap-1"
            onClick={() => setIsFeedbackOpen(true)}
          >
            <span>Send Feedback</span>
          </button>

          <FeedbackModal
            isOpen={isFeedbackOpen}
            onClose={() => setIsFeedbackOpen(false)}
          />
        </div>
        <div className="w-full md:w-auto md:hidden flex justify-between items-center mb-4 md:mb-0">
          <button
            className="md:hidden font-bold border"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
           MAIN MENU
          </button>
        </div>
      </div>
      <div className="bg-white h-2 w-full"></div>
    </nav>
  );
};

export default Subheader;
// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '../components/ui/select';
import { taxYearApi } from '../services/taxYearApi';
import { businessPercentageApi } from '../services/businessPercentageApi';
import { banksApi } from '../services/banksApi';
import type { Bank } from '../utils/types';
import { useToast } from '../components/ToastModule';
import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';

const SettingsPage = () => {
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [showCustomBankForm, setShowCustomBankForm] = useState(false);
  const [customBankName, setCustomBankName] = useState('');
  const [connectedBanks, setConnectedBanks] = useState<Bank[]>([]);
  const [businessPercentage, setBusinessPercentage] = useState<number>(10);
  const [taxYear, setTaxYear] = useState<number>(2024);
  const { showToast } = useToast();

 const availableBanks = [
  { id: 'ALLY_BANK', name: 'Ally Bank' },
  { id: 'AMERICAN_EXPRESS', name: 'American Express Bank' },
  { id: 'BANK_OF_AMERICA', name: 'Bank of America' },
  { id: 'CAPITAL_ONE', name: 'Capital One' },
  { id: 'CHASE', name: 'Chase Bank' },
  { id: 'CITIBANK', name: 'Citibank' },
  { id: 'FIRST_REPUBLIC', name: 'First Republic Bank' },
  { id: 'HSBC', name: 'HSBC Bank USA' },
  { id: 'US_BANK', name: 'U.S. Bank' },
  { id: 'TD_BANK', name: 'TD Bank' },
  { id: 'PNC', name: 'PNC Bank' },
  { id: 'KEYBANK', name: 'KeyBank' },
  { id: 'REGIONS', name: 'Regions Bank' },
  { id: 'SUNTRUST', name: 'SunTrust Bank' },
  { id: 'WELLS_FARGO', name: 'Wells Fargo' },
  { id: 'M&T_BANK', name: 'M&T Bank' }

];

 useEffect(() => {
   const fetchInitialData = async () => {
     try {
       const banksResponse = await banksApi.getAll();
       if (banksResponse.status === 'success' && banksResponse.data) {
         setConnectedBanks(banksResponse.data);
       }

       const percentageResponse = await businessPercentageApi.get();
       if (percentageResponse.status === 'success' && percentageResponse.data) {
         setBusinessPercentage(percentageResponse.data.businessPercentage);
       }

       const taxYearResponse = await taxYearApi.get();
       if (taxYearResponse.taxYear) {
         setTaxYear(taxYearResponse.taxYear);
       }
     } catch (error) {
       console.error('Error fetching initial data:', error);
     }
   };

   fetchInitialData();
 }, []);


const handleAddBank = async () => {
  try {
    const response = await banksApi.add(selectedBank, false);
    
    if (response.status === 'success' && response.data) {
      showToast(`${selectedBank} added successfully`);
      setConnectedBanks([...connectedBanks, response.data]);
      setSelectedBank('');
    }
  } catch (error) {
    showToast('Failed to add bank');
    console.error('Error adding bank:', error);
  }
};

const handleCustomBankSubmit = async () => {
  if (!customBankName.trim()) {
    showToast('Please enter a bank name');
    return;
  }

  try {
    const response = await banksApi.add(customBankName.trim(), true);
    
    if (response.status === 'success' && response.data) {
      showToast(`${customBankName} added successfully`);
      setConnectedBanks([...connectedBanks, response.data]);
      setCustomBankName('');
      setShowCustomBankForm(false);
    }
  } catch (error) {
    showToast('Failed to add bank');
    console.error('Error adding bank:', error);
  }
};

    const handleRemoveBank = async (bankId: number) => {
      try {
        const response = await banksApi.delete(bankId);
        if (response.status === 'success') {
          setConnectedBanks(connectedBanks.filter(bank => bank.id !== bankId));
        }
      } catch (error) {
        console.error('Error removing bank:', error);
      }
    };

    const handleSaveBusinessPercentage = async () => {
      try {
        await businessPercentageApi.update(businessPercentage);
        showToast('Business percentage updated');
      } catch (error) {
        showToast('Failed to update business percentage');
      }
    };

    const handleSaveTaxYear = async () => {
      try {
        await taxYearApi.update(taxYear);
        showToast('Tax year updated');
      } catch (error) {
        console.error('Error updating tax year:', error);
        showToast('Failed to update tax year');
      }
    };

//  const handleClearTaxYear = async () => {
//    try {
//      // TODO: Implement clear tax year data functionality
//      console.log('Clear tax year data');
//    } catch (error) {
//      console.error('Error clearing tax year data:', error);
//    }
//  };

// const handleDeleteAccount = async () => {
//    try {
//      // TODO: Implement account deletion
//      console.log('Deleting account');
//      setShowDeleteConfirm(false);
//    } catch (error) {
//      console.error('Error deleting account:', error);
//    }
//  };

return (
  <div className="bg-gray-200 p-8">
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg p-8 w-2/3">
        <h2 className="text-2xl font-bold text-[#4338ca] mb-6">Your Banks</h2>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-4 items-start">
            {!showCustomBankForm ? (
              <>
                <div className="flex-grow">
                  <Select value={selectedBank} onValueChange={setSelectedBank}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a bank..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {availableBanks.map(bank => (
                        <SelectItem key={bank.id} value={bank.name}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  className="bg-[#4338ca] text-white font-bold rounded-lg py-2 px-6"
                  onClick={handleAddBank}
                >
                  Add Bank
                </button>
              </>
            ) : (
              <div className="w-full space-y-4">
                <input
                  type="text"
                  placeholder="Enter custom bank name"
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    className="bg-gray-200 text-gray-700 font-bold rounded-lg py-2 px-6"
                    onClick={() => {
                      setShowCustomBankForm(false);
                      setCustomBankName('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-[#4338ca] text-white font-bold rounded-lg py-2 px-6"
                    onClick={handleCustomBankSubmit}
                  >
                    Save Bank
                  </button>
                </div>
            
              </div>
            )}
          </div>
            
          <button
            onClick={() => setShowCustomBankForm(true)}
            className="text-[#4338ca] hover:text-[#3730a3] text-sm font-semibold"
          >
            + Add bank not in list
          </button>

          <div className="space-y-2">
            {connectedBanks.map(bank => (
              <div key={bank.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span>{bank.name} {bank.isCustomBank ? '(Custom)' : ''}</span>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleRemoveBank(bank.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 ">
           <Link 
                to="/upload" 
                className="inline-flex items-center px-2 py-1 text-sm font-medium border-gray-300 border rounded hover:bg-gray-300"
                >
                <Upload className="h-4 w-4 mr-2 text-green-500" />Return to UPLOAD page
              </Link>
          </div>
        </div>
      </div>
          
       {/* Key Numbers Section */}
       <div className="bg-white rounded-lg p-8 w-2/3">
         <h2 className="text-2xl font-bold text-[#4338ca] mb-6">Key Numbers</h2>
         <div className="space-y-6">
           <div className="flex items-center gap-4">
             <label className="flex-grow">Business Percentage of Household:</label>
             <input
               type="number"
               min="1"
               max="100"
               value={businessPercentage}
               onChange={(e) => setBusinessPercentage(Number(e.target.value))}
               className="rounded-lg border border-gray-300 p-2 w-14"
             />
             <span>%</span>
             <button
               className="bg-[#4338ca] text-white font-bold rounded-lg py-2 px-6"
               onClick={handleSaveBusinessPercentage}
             >
               Save
             </button>
           </div>
           <div className="flex items-center gap-4">
             <label className="flex-grow">Tax Year:</label>
             <input
               type="number"
               value={taxYear}
               onChange={(e) => setTaxYear(Number(e.target.value))}
               className="rounded-lg border border-gray-300 p-2 w-24"
             />
             <button
               className="bg-[#4338ca] text-white font-bold rounded-lg py-2 px-6"
               onClick={handleSaveTaxYear}
             >
               Save
             </button>
           </div>
         </div>
       </div>

       {/* Your Data Section
       <div className="bg-white rounded-lg p-8 w-2/3">
         <h2 className="text-2xl font-bold text-[#4338ca] mb-6">Your Data</h2>
         <div className="space-y-4">
           <button
             className="w-full bg-gray-100 hover:bg-gray-200 font-bold rounded-lg py-3 px-6 text-left"
             onClick={handleClearTaxYear}
           >
             Clear Your Data for This Tax Year
           </button>
         </div>
       </div> */}

       {/* Danger Zone Section
       <div className="bg-white rounded-lg p-8 border-2 border-red-200 w-2/3">
         <h2 className="text-2xl font-bold text-red-600 mb-6">Danger Zone</h2>
         <div className="space-y-4">
           <button
             className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg py-3 px-6 text-left"
             onClick={() => setShowDeleteConfirm(true)}
           >
             Delete Your Account
           </button>
         </div>
       </div> */}

       {/* {showDeleteConfirm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg p-6 max-w-md w-full">
             <h3 className="text-lg font-bold mb-4">Confirm Account Deletion</h3>
             <p className="mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
             <div className="flex justify-end space-x-4">
               <button
                 className="px-4 py-2 bg-gray-200 rounded-lg"
                 onClick={() => setShowDeleteConfirm(false)}
               >
                 Cancel
               </button>
               <button
                 className="px-4 py-2 bg-red-600 text-white rounded-lg"
                 onClick={handleDeleteAccount}
               >
                 Delete Account
               </button>
             </div>
           </div>
         </div>
       )} */}
     </div> 
   </div>
 );
};

export default SettingsPage;
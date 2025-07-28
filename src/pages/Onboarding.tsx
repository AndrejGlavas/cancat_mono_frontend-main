import React, { useEffect, useState } from "react";
import { taxYearApi } from '../services/taxYearApi';
import { banksApi } from '../services/banksApi';
import SampleDataSection from "../components/SampleDataSection";
import { uploadApi } from "../services/uploadApi";
import TutorialSlider from "../components/help/TutorialSlider";
import { fetchUser, updateTerms } from '../services/userApi';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import type { Bank } from '../utils/types';
import { useToast } from '../components/ToastModule';
// import { Upload, Download } from 'lucide-react';// 
//import { LuGrid3X3, LuArrowRight, LuArrowRightLeft } from "react-icons/lu";
// import { PiTag } from "react-icons/pi";

const Onboarding: React.FC = () => {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [step, setStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [showCustomBankForm, setShowCustomBankForm] = useState(false);
  const [customBankName, setCustomBankName] = useState('');
  const [connectedBanks, setConnectedBanks] = useState<Bank[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { showToast } = useToast();

  const availableBanks = [
    { id: 'ALLY_BANK', name: 'Ally Bank' },
    { id: 'AMERICAN_EXPRESS', name: 'American Express' },
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
    taxYearApi.get()
      .then((data) => setTaxYear(data.taxYear))
      .catch((error) => console.error("Error fetching tax year:", error));

    banksApi.getAll()
      .then((response) => {
        if (response.status === 'success' && response.data) {
          setConnectedBanks(response.data);
        }
      })
      .catch((error) => console.error("Error fetching banks:", error));
  }, []);

  const onClickUpdateYear = () => {
    taxYearApi.update(taxYear)
      .then(() => {
        showToast("Tax year confirmed");
        fetchUser().then(() => setStep(3));
      })
      .catch((error) => {
        console.error("Error updating tax year:", error);
        showToast("Failed to update tax year");
      });
  };

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
        showToast('Bank removed successfully');
      }
    } catch (error) {
      showToast('Failed to remove bank');
      console.error('Error removing bank:', error);
    }
  };

  const handleTermsSubmit = async () => {
    const response = await updateTerms(termsAccepted ? 'TALK' : 'YES');
    if (response.status === 'success') {
      showToast(termsAccepted ? "You will hear from someone soon" : "Terms Confirmed"  );
      setStep(2);
    } else {
      showToast('Failed to update terms');
    }
  };

  const renderTermsStep = () => (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-[#4338ca] mb-6">You're In!</h2>
      <div className="space-y-4 text-gray-700">
        <p>CanCat is a new platform to help you prepare your taxes.</p>
        <p>Please note the following:</p>
        <ul className="list-disc pl-6 space-y-2">
        <li>CanCat gives you tools to find and categorize your income and deductions. While we provide educational guidance, we cannot provide individual tax advice.</li>
          <li> Whether you plan to use software such as TurboTax or engage a tax professional, how you use CanCat is your responsibility through the guidance of certified professionals.</li> 
        <li>CanCat is in Beta and may contain errors. Please report any issues to <u>support@cancat.io</u>.</li> 
        <li>Your "Split Deductions" Report for Your Accountant includes a default 10% calculation. We recommend that you review and adjust this with your tax preparer. 
          </li>
        </ul>
        <div className="mt-8 space-y-4">
          <div className="flex items-center space-x-2">
          <input
              type="radio"
              id="accept"
              name="terms"
              defaultChecked={true}
              onChange={() => setTermsAccepted(true)}
              className="h-5 w-5 text-[#4338ca]"
            />
            <label htmlFor="accept" className="text-base">
              I understand and agree to all of these terms
            </label>
          </div>
          <div className="flex items-center space-x-2">
          <input
              type="radio"
              id="needHelp"
              name="terms"
              onChange={() => setTermsAccepted(false)}
              className="h-5 w-5 text-[#4338ca]"
            />
            <label htmlFor="needHelp" className="text-base">
              Ok, but I would also like to talk to someone
            </label>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6">
      <button
          className="bg-[#fc2544] text-white px-6 py-2 rounded-md font-bold hover:bg-[#3730a3] transition-colors"
          onClick={handleTermsSubmit}
        >
          CONTINUE
        </button>
      </div>
    </div>    
  );


  const renderTaxYearStep = () => (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-center text-[#4338ca] p-8 ">
        Step 2/5: Last Year's Transactions?
      </h2><p>Preparing taxes for 2024? If yes, click "Confirm and Continue." If you are working on a prior year, specify which year below.  
        </p>
      <div className="flex gap-4 justify-center m-8">
        <input
          type="number"
          value={taxYear}
          onChange={(e) => setTaxYear(Number(e.target.value))}
          className="w-32 px-4 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4338ca] focus:border-transparent"
        />
        <button
          className="bg-[#fc2544] text-white font-bold px-6 py-2 rounded-md hover:bg-[#3730a3] transition-colors"
          onClick={onClickUpdateYear}
        >
          CONFIRM AND CONTINUE
        </button>
      </div>
    </div>
  );

 

   const renderHowItWorksDetailedStep = () => (
   
     <div className="flex flex-col bg-white rounded-lg shadow-md p-8 w-full">
       <h2 className="text-2xl font-bold text-[#4338ca] mb-8">
        Step 4/5: CanCat Interactive Tutorial
       </h2>
       <div><p>Follow these instructions to learn how to categorize individual transactions. This simulator is purely for training and has no impact on your personal data.</p></div>
       <TutorialSlider /> 
       
       <div className="flex justify-end mt-8">
            <button
            className="bg-[#4338ca] text-white px-6 py-2 rounded-md  font-semibold hover:bg-[#3730a3] transition-colors"
            onClick={() => setStep(5)}
          >
            CONTINUE TO "YOUR BANKS & DATA"
          </button>
      </div>
      </div>          
    );

  const renderKeyVocabStep = () => (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-[#4338ca] mb-6">Step 3/5: Key Vocab</h2>
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold mb-2">Income</h3>
          <p>Deposits you received for products or services provided that you are required to report on your tax return. Optional: CanCat allows you to specify whether they are 1099 or W-2.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Business Deductions</h3>
          <p>Expenses paid to run your business that are "ordinary and necessary" can be itemized on your tax return. You will do your best to indentify which expenses qualify as "business," and "tag" the right deduction category. 
            If you work with a tax preparer, they can confirm and/or reorganize as they deem necessary.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Personal Deductions</h3>
          <p>Personal expenses that may qualify as personal deductions, such as donations to charity.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Split Expenses</h3>
          <p>Expense transactions that are either personal or business (or both) where a percent can be counted as a deduction. Examples include items or services used for personal and business, such as your mobile phone, home-office expenses, and some travel and meal expenses.</p>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          className="bg-[#fc2544] text-white px-6 py-2 rounded-md  font-semibold hover:bg-[#3730a3] transition-colors"
          onClick={() => setStep(4)}
        >
          CONTINUE TO TUTORIAL
        </button>
      </div>
    </div>
  );


  const renderBankStep = () => (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-[#4338ca] mb-6">
        Step 5/5: Uploading Bank Transactions
      </h2>
      
      <div className="flex mb-2">
        <p>Before you upload your transactions, would you like to upload Sample Test Transactions?
        Try the platform with  20 sample transactions to see how it works.</p>
      </div>
      <div className="flex gap-4 border-b border-gray-300 pb-4  mb-8">
     
        <div>       
        <SampleDataSection 
            onDataUpdate={async () => {
              const response = await uploadApi.getAll();
              if (response.status === 'success') {
                showToast("Sample data loaded successfully");
                setStep(6);
              }
            }} 
          />
        </div>
     </div>
      
      <div className="flex flex-col gap-4 mb-6">
      <div className="flex mb-2">
        <p>If you are ready to upload your transactions from your bank, please select your first bank below and then go to <Link to="/upload"  className="text-indigo-600 underline">Uploads</Link>. </p>
      </div>
        <div className="flex gap-4 items-start">
          {!showCustomBankForm ? (
            <>
              <div className="flex-grow">
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select your banks..." />
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
                className="bg-[#4338ca] text-white  font-semibold text-sm rounded-lg py-2 px-6"
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
                  className="bg-[#4338ca] text-white font-semibold rounded-lg py-2 px-6"
                  onClick={handleCustomBankSubmit}
                >
                  Save Bank
                </button>
              </div>
            </div>
          )}
        

     
        </div>
        <div className="space-y-2">
        
        <button
            onClick={() => setShowCustomBankForm(true)}
            className="text-[#4338ca] hover:text-[#3730a3] text-left text-sm font-semibold border p-2 rounded-md"
          >
            Don't see your bank? + Add it here. 
          </button>

        </div>
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

        <div className="flex justify-end mt-4">
          <button
            className="bg-[#fc2544] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#3730a3] transition-colors"
            onClick={() => setStep(6)}
          >
            CONTINUE TO COMPLETE
          </button>
        </div>
      </div>
    </div>
  );


  
  const renderFinalStep = () => (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-[#4338ca] mb-6">Great job!</h2>
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="text-xl font-semibold mb-2">Onboarding Complete</h3>
          <div className="m-10 "> Now let's get it done. <Link to="/dashboard"  className="text-indigo-600 underline">Go to Dashboard</Link> to see what's next. </div>

        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          className="bg-[#4338ca] text-white px-6 py-2 rounded-md font-bold hover:bg-[#3730a3] transition-colors"
          onClick={() => window.location.href = '/dashboard'}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mt-8 mb-6">
         
          <h2 className="text-xl font-bold text-gray-500 mb-2">Onboarding</h2>
          <p className="text-sm m-2 ">
            <Link to="/dashboard"  className="text-indigo-400 underline">Jump to Dashboard</Link></p>
            <div className="text-sm m-2 pb-4">You can return to Onboarding from Dashboard any time.</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((stepNum) => (
              <button 
                key={stepNum}
                onClick={() => setStep(stepNum)} 
                className={`h-2 w-12 rounded transition-all duration-300 cursor-pointer hover:opacity-80 
                  ${step >= stepNum ? 'bg-[#4338ca]' : 'bg-gray-300'}`} 
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          {step === 1 && renderTermsStep()}
          {step === 2 && renderTaxYearStep()}
          {step === 3 && renderKeyVocabStep()}
          {step === 4 && renderHowItWorksDetailedStep()}
          {step === 5 && renderBankStep()}
          {step === 6 && renderFinalStep()}
          {step === 7 && (

     
            <div className="flex justify-center">
              <button
                className="bg-[#4338ca] text-white px-6 py-2 rounded-md hover:bg-[#3730a3] transition-colors"
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard
              </button>

              
            </div>
          )}
          
          </div>        
      </div>
      
    </div>
  );
};

export default Onboarding;




  // const renderHowItWorksDetailedStep = () => (
  //   <div className="flex flex-col bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
  //     <h2 className="text-2xl font-bold text-[#4338ca] mb-8">
  //       How CanCat Works
  //     </h2>
  //     <div className="space-y-8 text-gray-700">
  //       <div className="flex items-start gap-4">
  //         <div className="flex-shrink-0">
  //           <LuGrid3X3 className="w-8 h-8 text-[#4338ca]" />
  //         </div>
  //         <div>
  //           <h3 className="text-xl font-semibold">Dashboard</h3>
  //           <p className="text-gray-600 mt-1">View a summary of your uploads and progress.</p>
  //         </div>
  //       </div>
  //       <div className="flex items-start gap-4">
  //         <div className="flex-shrink-0">
  //           <Upload className="w-8 h-8 text-[#4338ca]" />
  //         </div>
  //         <div>
  //           <h3 className="text-xl font-semibold">Upload Your Bank Transactions</h3>
  //           <p className="text-gray-600 mt-1"><a href="/upload" className="underline">Upload CSVs</a> from your bank that include Date, Description, and Amount fields.
  //             Want to learn more about how CanCat works? You can also <a href="/upload" className="underline"> load sample data</a> to try it first.</p>
  //         </div>
  //       </div>
        
  //       <div className="flex items-start gap-4">
  //         <div className="flex gap-2">
  //           <div className="w-8 h-8 rounded-full border-2 border-sky-300 text-sky-300 flex items-center justify-center font-bold bg-white">D</div>
  //           <LuArrowRight className="w-4 h-4 my-2"  />
  //           <div className="w-8 h-8 rounded-full border-4 border-sky-600 text-sky-600 flex items-center justify-center font-bold bg-white font-serif">I</div>
  //         </div>
  //         <div>
  //           <h3 className="text-xl font-semibold">Categorize Your Income</h3>
  //           <p className="text-gray-600 mt-1">Scan your deposits to label all deposits that are income.</p>
  //         </div>
  //       </div>
        
  //       <div className="flex items-start gap-4">
  //         <div className="flex gap-2">
  //           <div className="w-8 h-8 rounded-full border-4 border-blue-700 text-blue-700 flex items-center justify-center font-bold bg-white">B</div>
  //           <LuArrowRightLeft className="w-4 h-4 my-2"  />
  //           <div className="w-8 h-8 rounded-full border-4 border-green-700 text-green-700 flex items-center justify-center font-bold bg-white">P</div>
  //         </div>
  //         <div>
  //           <h3 className="text-xl font-semibold">Categorize Your Business Expenses</h3>
  //           <p className="text-gray-600 mt-1">Sort and filter your transactions to categorize all of your personal and business expenses.</p>
  //         </div>
  //       </div>

  //       <div className="flex items-start gap-4">
  //         <div className="flex-shrink-0">
  //           <PiTag className="w-8 h-8 text-indigo-700" />
  //         </div>
  //         <div>
  //           <h3 className="text-xl font-semibold">Tag Your Personal and Business Deductions</h3>
  //           <p className="text-gray-600 mt-1">Mark eligible expenses as tax deductions so that your accountant knows how to itemize on your return.</p>
  //         </div>
  //       </div>

  //       <div className="flex items-start gap-4">
  //         <div className="flex-shrink-0">
  //           <Download className="w-8 h-8 text-[#4338ca]" />
  //         </div>
  //         <div>
  //           <h3 className="text-xl font-semibold">Export 4 Reports for Your Accountant</h3>
  //           <p className="text-gray-600 mt-1">1) Your Income 2) Business Deductions 3) Personal Deductions 4) Split Deductions</p>
  //         </div>
  //       </div>
      
  //       <div className="flex justify-end mt-8">
  //         <button
  //           className="bg-[#fc2544] text-white px-6 py-2 mx-2 rounded-md hover:bg-[#3730a3] transition-colors"
  //           onClick={() => window.location.href = '/upload'}
  //         >
  //           Load Sample Data
  //         </button>
  //         <button
  //           className="bg-[#4338ca] text-white px-6 py-2 rounded-md hover:bg-[#3730a3] transition-colors"
  //           onClick={() => window.location.href = '/dashboard'}
  //         >
  //           View Dashboard
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );

  // const renderHowItWorksStep = () => (
  //   <div className="flex flex-col bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
  //     <h2 className="text-2xl font-bold text-[#4338ca] mb-6">
  //       How It Works
  //     </h2>
  //     <div className="space-y-6">
  //       <p className="text-gray-700">CanCat helps you organize your transactions for tax season:</p>
  //       <ol className="list-decimal pl-6 space-y-4 text-gray-700">
  //         <li>Upload your bank transactions from CSV files</li>
  //         <li>Label your income sources</li>
  //         <li>Categorize expenses as business or personal</li>
  //         <li>Tag tax-deductible expenses</li>
  //         <li>Export organized reports for your accountant</li>
  //       </ol>
  //       <div className="flex justify-end mt-6">
  //         <button
  //           className="bg-[#4338ca] text-white px-6 py-2 rounded-md font-bold hover:bg-[#3730a3] transition-colors"
  //           onClick={() => setStep(6)}
  //         >
  //           CONTINUE
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
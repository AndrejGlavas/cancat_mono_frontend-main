
import { Flag, EyeOff, Lock, Pencil,  History } from "lucide-react";
import { PiTag } from "react-icons/pi";
import { Link } from 'react-router-dom';
import { PiCaretLeftFill, PiCaretRightFill } from "react-icons/pi";

const HelpPage = () => {
  return (
    <div className="bg-gray-200 p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#4338ca] mb-2">Help Center</h1>
          <p className="text-gray-600">Find answers to common questions about using CanCat</p>
        </div>


          <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Support</h2> 
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-gray-600">support@cancat.com</p>
              
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Live Chat Support on Facebook</h3>
              <p className="text-sm text-gray-600"><a href="https://www.facebook.com/cancatio" target="_new" className="text-indigo-600 underline">Follow us on Facebook</a> to use Facebook Messenger to send us a chat.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Roadmap and Bugs</h3>
              <p className="text-sm text-gray-600">  <div>    <Link to="/roadmap"  className="text-indigo-600 underline">Known issues and status</Link></div></p>
            </div>

          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">What do the Icons Mean?</h2>
          <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4 p-4 w-full max-w-6xl">
      {/* Column 1 */}
      <div className="space-y-4 ">
           <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
           <div className="w-1/4 flex items-center gap-0 ">
                <div className="w-12 h-12 font-serif rounded-full border-4 border-blue-700 text-blue-700 flex items-center justify-center font-bold bg-white">B</div>
                <div className="w-12 h-12 font-serif rounded-full border-4 border-green-700 text-green-700 flex items-center justify-center font-bold bg-white">P</div>
                

               </div> 
            <div className="w-2/3">
                <p className="font-medium">Business vs Personal Expense</p>
                <p className="text-sm text-gray-600">Scan all expenses to categorize business transactions so they can be tagged as business deductions.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-1/4 flex items-center gap-0 ">
              <div className="w-12 h-12 rounded-full border-4 border-sky-300 text-sky-300 flex items-center justify-center font-bold bg-white font-serif">D</div>
              <div className="w-12 h-12 rounded-full border-4 border-sky-600 text-sky-600 flex items-center justify-center font-bold bg-white font-serif">I</div>
              </div>
              <div className="w-3/4 items-center ">
                <p className="font-medium">Deposit vs Income</p>
                <p className="text-sm text-gray-600">Scan all deposits to identify which qualify as income. Tag them "1099" or "W-2."</p>
              </div>
            </div>


            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-1/4 items-center ">
            <div className="w-12 h-12 rounded-full border-blue-700 border-2 bg-lime-200  text-blue-800 flex items-center justify-center font-bold relative">
                    <div className="flex w-10 h-10 text-md font-semibold border-2 border-blue-800 font-serif rounded-full items-center justify-center bg-white font-semibold">
                     <PiCaretLeftFill size={12} className="text-green-700" />
                      <span className="mx-0.5 text-gray-600">S</span>
                     <PiCaretRightFill size={12} className="text-blue-800" />
                     </div>
              </div>
                          
             </div> 
              <div className="w-3/4">
                <p className="font-medium">Split Transaction</p>
                <p className="text-sm text-gray-600">Do you use your car for work or part of your home as an office? Categorize business or personal transactions where only part of the expense qualifies as a deduction.</p>
              </div>
            </div>
      </div>

      {/* Column 2 */}
      <div>
        <div className="border rounded-lg p-2 bg-gray-100 h-full">
       
          <div className="flex items-center gap-2 p-4 bg-white  rounded-lg">
          <div className="w-1/4 items-center ">
              <PiTag className="text-orange-700 border-4 p-1 border-orange-700 w-8 h-8  rounded-lg" />
             </div> 
              <div>
                <p className="font-medium">Tag Your Deductions</p>
                <p className="text-sm text-gray-600">The critical final step before you export is to tag all of your deductions. </p>
              </div>
            </div>
          <div className="grid grid-cols-2 gap-1 mt-4">
            <div className="border rounded-lg p-4 bg-white">
              <span className="text-md bold text-green-700 border border-green-700 p-1 my-2 rounded-md">Personal</span>
              <div className="text-sm my-2 ">
                <ul>
                    <li>Medical & Dental</li>
                    <li>Taxes Paid</li>
                    <li>Interest Paid</li>
                    <li>Charitable Contributions</li>
                    <li>Casualty and Theft Losses</li>
                    <li>Miscellaneous</li>
                    <li>Other-Personal</li>
                  </ul>
              
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-white">
            <span className="text-md bold text-blue-800 border border-blue-800 p-1 my-2 rounded-md">Business</span>
            <div className="text-sm my-2 ">
                <ul>
                <li>Auto</li>
                <li> Office Expenses </li>
                <li>Supplies </li>
                <li>Professional Fees</li>
                <li>Salaries & Wages</li>
                <li> Travel</li>
                <li>Meals & Entertainment</li>  
                <li>Advertising & Marketing</li>
                <li>Depreciation </li>
                <li>Insurance</li>
                <li>Rent or Lease Payments </li>
                <li>Taxes </li>
                <li>Other-Business </li>
              </ul>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
            
    <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
      {/* Column 1 */}
      <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 ">
            <div className="flex gap-2">
              <EyeOff className="text-orange-300 border-orange-300 bg-orange-50 p-1 w-6 h-6 border-2 rounded-lg" />
            </div>
          <div>
             <p className="font-medium">Hide Transaction</p>
             <p className="text-sm text-gray-600">Overwhelmed by so many records? Click the Hide icon to remove (but not delete) redundant transactions like credit card payments. You don't want to double count them.</p>
          </div>
        </div>
      </div>
      {/* Column 2 */}
       <div>
          <div className="border rounded-lg p-4 bg-gray-50 h-full"> 
            <div className="text-sm text-gray-600"><span className="italic">Example: </span>
            You might hide "CITI CARD Payment Transfer ID:1234 PPD" because it's a credit card payment that are expense transactions you will include individually.
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
      {/* Column 1 */}
      <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 ">
            <div className="flex gap-2">
            <Flag className="text-red-400  border-red-300 bg-red-50 p-1 w-6 h-6 border-2 rounded-lg" />
              </div>
              <div>
                <p className="font-medium">Flag for Review</p>
                <p className="text-sm text-gray-600">Not sure how to categorize or tag a transactions, or IF it should be included in your report? If you flag it, the record will be 
                  flagged in your report along with a note to your accountant to pay it special consideration.</p>
          </div>
        </div>
      </div>
      {/* Column 2 */}
       <div>
          <div className="border rounded-lg p-4 bg-gray-50 h-full"> 
            <div className="text-sm text-gray-600"><span className="italic">Example: </span> Your car is a personal expense, but you use it often for work. Flag it for your accountant to review and decide how to categorize it.  

          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
      {/* Column 1 */}
      <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 ">
            <div className="flex gap-2">
            <Lock className="text-yellow-700  border-yellow-700 bg-yellow-50 p-1 w-6 h-6 border-2 rounded-lg" />
              </div>
              <div>
                <p className="font-medium">Lock</p>
                <p className="text-sm text-gray-600">Locked records are excluded from Bulk 
                  Updates so that you do not accidentally modify it in the future.</p>
              </div>
        </div>
      </div>
      {/* Column 2 */}
       <div>
          <div className="border rounded-lg p-4 bg-gray-50 h-full"> 
            <div className="text-sm text-gray-600"><span className="italic">Example: </span>Your transactions labelled "Intuit Quickbooks" are categorized and tagged correctly. Lock them to prevent accidental changes.
          </div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
      {/* Column 1 */}
      <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 ">
            <div className="flex gap-2">
            <Pencil size={20} className="text-zinc-500  border-zinc-500  bg-zinc-50 p-1 w-6 h-6 border-2 rounded-lg" />
              </div>
              <div>
                <p className="font-medium">Edit Label</p>
                <p className="text-sm text-gray-600"> Use the edit label for single or bulk transactions. 
                  Original labels are permanent, simply hover over any edited record. Original labels can be included in your exported Reports. </p>
            </div>
        </div>
      </div>
      {/* Column 2 */}
       <div>
          <div className="border rounded-lg p-4 bg-gray-50 h-full"> 
            <div className="text-sm text-gray-600"><span className="italic">Example: </span> 
            Rename "WELLS FARGO BA 12/30 #XXXXX1234 WITHDRWL 72 South Clinton Trenton NJ FEE" to "ATM Cash" so that it's easier to find and categorize.
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
      {/* Column 1 */}
      <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 ">
            <div className="flex gap-2">
            <History className="text-zinc-700  border-zinc-700 bg-indigo-50 p-1 w-6 h-6 border-2 rounded-lg" />
              </div>
              <div>
                <p className="font-medium">Transaction History</p>
                <p className="text-sm text-gray-600">View the change history for this transaction</p>
          </div>
        </div>
      </div>
      {/* Column 2 */}
       <div>
          <div className="border rounded-lg p-4 bg-gray-50 h-full"> 
            <div className="text-sm text-gray-600"><span className="italic">Example: </span>
            Any record that appears to be different than what it should be - trace the reason and restore a previous edit if needed.
            </div>
          </div>
        </div>
      </div>
  
    </div>
  </div>



        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">How do I categorize transactions?</span>
              </summary>
              <div className="p-4 text-gray-600">
              <div className="w-1/4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-sky-300 text-sky-300 flex items-center justify-center font-bold bg-white">D</div>
              <div className="w-8 h-8 rounded-full border-4 border-sky-600 text-sky-600 flex items-center justify-center font-bold bg-white font-serif">I</div>
               </div> 
                Use the Business/Personal toggle to set the main category, then add specific tags to organize your  deductions. You can also split transactions between categories if you use them for both personal and business (e.g. your cell phone).
              </div>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">How do I mark transactions for my accountant?</span>
              </summary>
              <div className="p-4 text-gray-600"> <Flag className="text-red-400  border-red-300 bg-red-50 p-1 w-6 h-6 border-2 rounded-lg" />
                Use the FLAG icon to mark transactions that need your accountant's attention. You can also add notes and track any changes through the history feature.
              </div>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Can I protect sensitive transactions?</span>
              </summary>
              <div className="p-4 text-gray-600"> 
              <div className="w-1/4 flex items-center gap-2">
              <Lock className="text-yellow-700  border-yellow-700 bg-yellow-50 p-1 w-6 h-6 border-2 rounded-lg" />
              <EyeOff className="text-orange-300 border-orange-300 bg-orange-50 p-1 w-6 h-6 border-2 rounded-lg" />
               </div> 

               Use the LOCK icon to prevent accidental changes, and the HIDE icon to remove redundant transactions or hide sensitive records from anyone who may access your account through collaboration (coming soon). 
               Hidden transactions are not deleted, but will never be included in your <a href="/reports" className="underline text-indigo-700">Accountant Reports</a>.
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
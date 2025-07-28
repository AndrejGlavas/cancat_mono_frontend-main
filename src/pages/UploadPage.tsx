import { useState, useEffect } from 'react';
import { uploadApi } from "../services/uploadApi";
import { Link } from "react-router-dom";
import { banksApi } from "../services/banksApi";
import SampleDataSection from '../components/SampleDataSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Bank, 
  UploadFile, 
  TransactionQueryState, 
} from '../utils/types';

interface FileUploadState {
  file: File;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  uploadedTransactions?: number;
  stats?: {
    positiveTransactions: number;
    negativeTransactions: number;
    withdrawalsArePositive: boolean;
    totalRows?: number;
    validRows?: number;
    invalidDates?: number;
    nullTransactions?: number;
  };
  error?: {
    message: string;
    details?: string;
    code?: number;
  };
}

interface UploadPageProps {
  queryState?: TransactionQueryState;
  onChange?: (state: Partial<TransactionQueryState>) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ queryState, onChange }) => {
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accountType, setAccountType] = useState<"bank" | "credit">("bank");
  const [transactionType, setTransactionType] = useState<"personal" | "business">("personal");
  const [fileStates, setFileStates] = useState<Map<string, FileUploadState>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadFile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [banks, uploads] = await Promise.all([
          banksApi.getAll(),
          uploadApi.getAll()
        ]);

        if (banks.status === 'success' && banks.data) {
          setBanks(banks.data);
        }

        if (uploads.status === 'success' && uploads.data) {
          setUploads(uploads.data);
          if (uploads.data.length > 0) {
            setSelectedBankId(uploads.data[0].bankId);
          }
        }
      } catch (error) {
        setError('Failed to load data');
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Files selected:', files.length);
    
    if (files.length > 12) {
      setError('Maximum 12 files allowed');
      return;
    }
  
    const newFileStates = new Map(fileStates);
    files.forEach(file => {
      if (!newFileStates.has(file.name)) {
        newFileStates.set(file.name, {
          file,
          status: 'pending'
        });
      }
    });
    console.log('New fileStates size:', newFileStates.size);
    setFileStates(newFileStates);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedBankId || fileStates.size === 0) return;
  
    const pendingFiles = Array.from(fileStates.entries())
      .filter(([_, state]) => state.status === 'pending');
  
    const uploadPromises = pendingFiles.map(async ([filename, state]) => {
      setFileStates(prev => new Map(prev).set(filename, { ...state, status: 'uploading' }));
      
      try {
        const result = await uploadApi.uploadCSV(
          state.file, 
          selectedBankId, 
          accountType, 
          transactionType
        );
  
        if (result.status === "success" && result.data) {
          setFileStates(prev => new Map(prev).set(filename, { 
            ...state, 
            status: 'complete',
            uploadedTransactions: result.data?.uploadedRows,
            stats: result.data?.stats
          }));
        } else {
          throw new Error(result.error?.message || "Upload failed");
        }
      } catch (error: any) {
        const errorResponse = error?.response?.data;
        let errorMessage = errorResponse?.error?.message || error?.message || "Upload failed";
        let errorDetails = errorResponse?.error?.details;
        let errorCode = errorResponse?.code;
        
        // Map Python error codes to specific messages
        if (errorCode) {
          switch(errorCode) {
            case 31:
              errorMessage = "Invalid date format in CSV. Please ensure dates are in YYYY-MM-DD format.";
              break;
            case 32:
              errorMessage = "Invalid amount format in CSV. Please ensure amounts are in standard decimal format.";
              break;
            case 33:
              errorMessage = "Insufficient server space. Please try a smaller file or contact support.";
              break;
          }
        }
  
        setFileStates(prev => new Map(prev).set(filename, { 
          ...state, 
          status: 'error',
          error: {
            message: errorMessage,
            details: errorDetails,
            code: errorCode
          }
        }));
      }
    });
  
    try {
      await Promise.all(uploadPromises);
      const newUploads = await uploadApi.getAll();
      if (newUploads.status === 'success' && newUploads.data) {
        setUploads(newUploads.data);
      }
    } catch (error) {
      console.error('Failed to refresh uploads:', error);
    }
  };

  const handleBankFilter = (bankId: number | undefined) => {
    if (!bankId || !queryState || !onChange) return;
    
    onChange({
      ...queryState,
      filters: {
        ...queryState.filters || {},
        bankId: queryState.filters?.bankId === bankId ? undefined : bankId
      }
    });
  };


  const handleDeleteUpload = async (uploadId: number) => {
    if (!window.confirm('Delete this upload and its transactions?')) return;
  
    try {
      await uploadApi.delete(uploadId);
      setUploads(uploads.filter(u => u.id !== uploadId));
    } catch (error) {
      setError('Failed to delete upload');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Uploads List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">My Uploads</h3>
          
          <div className="space-y-4">
          {Object.entries(
              uploads.reduce((acc, upload) => {
                const bank = banks.find(b => b.id === upload.bankId);
                const bankName = bank?.name || 'Unknown Bank';
                if (!acc[bankName]) acc[bankName] = { bankId: bank?.id, uploads: [] };
                acc[bankName].uploads.push(upload);
                return acc;
              }, {} as Record<string, { bankId: number | undefined, uploads: UploadFile[] }>)
            )
            .sort(([bankNameA], [bankNameB]) => bankNameA.localeCompare(bankNameB))
            .map(([bankName, { bankId, uploads: bankUploads }]) => (
              <div key={bankName} className="border-b pb-3">
                <button 
                  onClick={() => handleBankFilter(bankId)}
                  className={`font-medium ${
                    queryState?.filters?.bankId === bankId 
                      ? 'text-blue-600' 
                      : 'text-black hover:text-blue-600'
                  }`}
                >
                  <Link to="/expenses">{bankName}</Link>
                </button>
                <div className="space-y-1 mt-2">
                  {bankUploads
                    .sort((a, b) => new Date(b.dateRange?.start || 0).getTime() - new Date(a.dateRange?.start || 0).getTime())
                    .map(upload => (
                      <div key={upload.id} className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          <span className="inline-block w-48">
                            {upload.dateRange?.start && (
                              <>
                                {new Date(upload.dateRange.start).toLocaleDateString()} - 
                                {new Date(upload.dateRange.end).toLocaleDateString()}
                              </>
                            )}
                          </span>
                          <span className="ml-4">{upload.transactionsCount} transactions</span>
                        </div>
                        <button
                          onClick={() => handleDeleteUpload(upload.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          aria-label="Delete upload"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                                ))}
                    </div>
                  </div>
                ))}

          </div>
        </div>

        {/* Upload Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md space-y-4">
            <div className="bg-sky-50 rounded px-3 py-5">
              <h3 className="text-2xl font-bold text-gray-800 text-center">
                Upload CSV Files
              </h3>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="p-6">
              {/* Main Content Grid */}
              <div className="grid grid-cols-2 gap-8 px-8">
                {/* Left Column - Forms */}
                <div className="space-y-6 w-2/3">
                  {/* Bank Selection */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                      Select Bank:
                    </label>
                    <Select
                      value={selectedBankId?.toString() || ''}
                      onValueChange={(value) => setSelectedBankId(Number(value))}
                    >
                      <SelectTrigger className="w-full border-zinc-700 bg-white">
                        <SelectValue placeholder="Select a bank..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        {banks.map(bank => (
                          <SelectItem key={bank.id} value={bank.id.toString()}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                  <Link 
                        to="/settings" 
                        className="inline-flex items-center px-2 py-1 text-sm font-medium border-gray-300 border rounded hover:bg-gray-300"
                      >
                        + Add Bank to this List
                      </Link>
                    </div>

                  {/* Account Type */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                      Account Type:
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="accountType"
                          value="bank"
                          checked={accountType === "bank"}
                          onChange={(e) => setAccountType(e.target.value as "bank" | "credit")}
                          className="mr-2"
                        />
                        Bank Account
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="accountType"
                          value="credit"
                          checked={accountType === "credit"}
                          onChange={(e) => setAccountType(e.target.value as "bank" | "credit")}
                          className="mr-2"
                        />
                        Credit Card
                      </label>
                    </div>
                  </div>

                  {/* Transaction Type */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                      Transaction Type:
                      <span className="text-sm italic ml-2">(default to Personal if unsure)</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="transactionType"
                          value="personal"
                          checked={transactionType === "personal"}
                          onChange={(e) => setTransactionType(e.target.value as "personal" | "business")}
                          className="mr-2"
                        />
                        Personal
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="transactionType"
                          value="business"
                          checked={transactionType === "business"}
                          onChange={(e) => setTransactionType(e.target.value as "personal" | "business")}
                          className="mr-2"
                        />
                        Business
                      </label>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      accept=".csv"
                      multiple
                      onChange={handleFileChange}
                      className="w-full file:mr-4 file:py-2 file:px-4 
                        file:rounded-md file:border-1 
                        file:text-gray-700 file:bg-indigo-200 
                        file:hover:bg-gray-300
                        hover:cursor-pointer
                        text-gray-700"
                    />

                      {fileStates.size > 0 && (
                        <div className="mt-4 space-y-2">
                          {Array.from(fileStates.entries()).map(([filename, state]) => (
                            <div key={filename} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <span className="truncate max-w-[200px]">{filename}</span>
                              <div className="text-sm ml-2">
                                {state.status === 'complete' && (
                                  <div className="text-green-600">
                                    <span>{state.uploadedTransactions} transactions </span>
                                    {state.stats && (
                                      <span className="text-xs">
                                        ({state.stats.positiveTransactions} deposits, {state.stats.negativeTransactions} withdrawals)
                                      </span>
                                    )}
                                  </div>
                                )}
                                {state.status === 'uploading' && (
                                  <span className="text-blue-600">Uploading...</span>
                                )}
                                {state.status === 'error' && state.error && (
                                  <div className="flex items-center text-red-600">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    <div className="flex flex-col">
                                      <span>{state.error.message}</span>
                                      {state.error.details && (
                                        <span className="text-xs text-red-500">{state.error.details}</span>
                                      )}
                                      {state.error.code && (
                                        <span className="text-xs bg-red-100 px-2 py-0.5 rounded">
                                          Error {state.error.code}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={handleUpload}
                            disabled={!selectedBankId || fileStates.size === 0}
                            className={`w-full mt-4 px-4 py-2 rounded-md transition-colors ${
                              !selectedBankId || fileStates.size === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
                          >
                            Upload Files
                          </button>
                        </div>
                      )}
                      </div>
                  </div>
                       

                {/* Right Column - Help Content */}
                <div>

                  <div className="flex my-6 gap-2">
                 
                      <SampleDataSection 
                        onDataUpdate={async () => {
                          const newUploads = await uploadApi.getAll();
                          if (newUploads.status === 'success' && newUploads.data) {
                            setUploads(newUploads.data);
                          }
                        }} 
                      />
               
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 w-2/3">
                    <p className="mb-2">💡 <span className="font-medium">Your CSV should include only the following columns:</span></p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs font-mono">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 px-2 py-1 bg-gray-100">Date</th>
                            <th className="border border-gray-300 px-2 py-1 bg-gray-100">Description</th>
                            <th className="border border-gray-300 px-2 py-1 bg-gray-100">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-2 py-1">2024-01-15</td>
                            <td className="border border-gray-300 px-2 py-1">Coffee Shop</td>
                            <td className="border border-gray-300 px-2 py-1 text-right">-4.50</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-2 py-1">2024-01-16</td>
                            <td className="border border-gray-300 px-2 py-1">Salary</td>
                            <td className="border border-gray-300 px-2 py-1 text-right">2000.00</td>
                          </tr>
                        </tbody>
                      </table>
                     
                    </div>
                  </div>
                  
                  <p className="mb-2"><span className="text-xs p-4 bg-white" >Columns names can be anything, as long as they are in this 1-2-3 order.</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
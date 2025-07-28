import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { uploadApi } from "../services/uploadApi";

interface SampleDataSectionProps {
  onDataUpdate?: () => void;
}

const SampleDataSection = ({ onDataUpdate }: SampleDataSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSampleData, setHasSampleData] = useState(false);

  useEffect(() => {
    checkSampleDataStatus();
  }, []);

  const checkSampleDataStatus = async () => {
    try {
      const response = await uploadApi.getSampleDataStatus();
      if (response.status === 'success' && response.data) {
        setHasSampleData(response.data.hasSampleData);
      } else {
        throw new Error(response.error?.message || 'Failed to check sample data status');
      }
    } catch (error: any) {
      console.error('Error checking sample data status:', error);
      setError(error.message || 'Failed to check sample data status');
    }
  };

  const handleLoadTestData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await uploadApi.loadTestData();
      if (response.status === "success") {
        setHasSampleData(true);
        if (onDataUpdate) {
          onDataUpdate();
        }
      } else {
        throw new Error(response.error?.message || 'Failed to load sample data');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load sample data');
      console.error('Error loading test data:', error);
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleClearTestData = async () => {
    if (!window.confirm('Are you sure you want to clear all sample data?')) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await uploadApi.clearTestData();
      if (response.status === "success") {
        setHasSampleData(false);
        if (onDataUpdate) {
          onDataUpdate();
        }
      } else {
        throw new Error(response.error?.message || 'Failed to clear sample data');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to clear sample data');
      console.error('Error clearing test data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex my-6 gap-2">

        {!hasSampleData ? (
          <button
            onClick={handleLoadTestData}
            disabled={isLoading}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
              ${isLoading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {isLoading ? 'Loading...' : 'Load Sample Data'}
          </button>
        ) : (
          <button
            onClick={handleClearTestData}
            disabled={isLoading}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md
              ${isLoading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {isLoading ? 'Clearing...' : 'Clear Sample Data'}
          </button>
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SampleDataSection;
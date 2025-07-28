import { useEffect, useState } from 'react';
import { X as LuX } from "lucide-react";
import { TransLog, LogModalProps } from '../../utils/types';
import { transactionsApi } from '../../services/transactionsApi';
import api from '../../utils/api';
import { useToast } from '../../components/ToastModule';

const LogModal = ({ isOpen, onClose, transactionId }: LogModalProps) => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<TransLog[]>([]);
  const [logCount, setLogCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!transactionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [logsResponse, count] = await Promise.all([
          api.get<TransLog[]>(`/translog/${transactionId}`),
          transactionsApi.getLogCount(transactionId)
        ]);

        setLogs(logsResponse.data);
        setLogCount(count);
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setError('Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && transactionId) {
      fetchData();
    }
  }, [isOpen, transactionId]);

  const handleRestore = async (log: TransLog) => {
    if (!transactionId) return;
    
    setRestoring(log.id);
    try {
      const isFirstEntry = logs.filter(l => l.fieldName === log.fieldName)
        .sort((a, b) => a.id - b.id)[0]?.id === log.id;
      
      await api.post(`/transactions/${transactionId}/restore`, {
        fieldName: log.fieldName,
        value: log.oldValue,
        logId: log.id,
        isFirstEntry
      });
      
      const [logsResponse, count] = await Promise.all([
        api.get<TransLog[]>(`/translog/${transactionId}`),
        transactionsApi.getLogCount(transactionId)
      ]);
      
      setLogs(logsResponse.data);
      setLogCount(count);
      showToast('Prior transaction detail restored');
    } catch (error) {
      console.error('Error restoring value:', error);
      setError('Failed to restore value');
    } finally {
      setRestoring(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Transaction Editing Log</h2>
            <p className="text-sm text-gray-600">
              Transaction ID: {transactionId} ({logCount} changes)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LuX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-pulse text-gray-600">Loading...</div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-4">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Timestamp</th>
                    <th className="px-4 py-2 text-left">Field</th>
                    <th className="px-4 py-2 text-left">Previous</th>
                    <th className="px-4 py-2 text-left">Changed To</th>
                    <th className="px-4 py-2 text-left">Method</th>
            
                   <th className="px-4 py-2 text-left">Restore</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">{log.fieldName}</td>
                      <td className="px-4 py-2">
                          {log.oldValue === "true" ? "yes" : log.oldValue === "false" ? "no" : (log.oldValue || '-')}
                        </td>
                        <td className="px-4 py-2">
                          {log.newValue === "true" ? "yes" : log.newValue === "false" ? "no" : (log.newValue || '-')}
                        </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                          ${log.method === 'human' ? 'bg-blue-100 text-blue-800' : 
                            log.method === 'robot' ? 'bg-purple-100 text-purple-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {log.method}
                        </span>
                      </td>
            
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleRestore(log)}
                          disabled={restoring === log.id}
                          className={`text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:text-gray-400 disabled:no-underline disabled:hover:text-gray-400
                            cursor-pointer`}
                        >
                          {restoring === log.id ? 'Restoring...' : 'restore'}
                        </button>
                      </td> 
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogModal;
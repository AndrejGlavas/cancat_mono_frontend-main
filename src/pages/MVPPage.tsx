import { useState, useEffect, useCallback } from 'react';
import { useQuilttSession } from '@quiltt/react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import QuilttConnect from './QuilttConnect';
import { quilttApi } from '../services/quilttApi';
import useAuth from '../hooks/useAuth';
import type { QuilttConnection, ConnectionState, SyncStatus } from '../types/quiltt';

const MVPPage = () => {
  const { taxYear } = useAuth();
  const { session } = useQuilttSession();
  const [connections, setConnections] = useState<QuilttConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    progress: undefined,
  });

  const loadData = useCallback(async () => {
    if (!session?.token) {
      console.log('No session token available');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Loading connections via GraphQL...');
      
      const response = await quilttApi.getConnectionsGraphQL();
      
      console.log('GraphQL connections response:', {
        connectionCount: response?.connections?.length || 0,
        connections: response?.connections
      });

      setConnections(response?.connections || []);

    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.token) {
      loadData();
    }
  }, [loadData, session?.token]);

  const handleConnectionChange = async (connectionState: ConnectionState) => {
    console.log('Connection state changed:', connectionState);
    
    if (connectionState.status === 'connected' && connectionState.connectionId) {
      loadData();
      
      // Start syncing transactions if we have a tax year
      if (taxYear) {
        setSyncStatus({ 
          status: 'syncing',
          message: 'Starting transaction sync...'
        });

        try {
          const connection = connections.find(c => c.id === connectionState.connectionId);
          
          if (connection?.accounts) {
            let current = 0;
            const total = connection.accounts.length;

            for (const account of connection.accounts) {
              current++;
              setSyncStatus({
                status: 'syncing',
                message: `Syncing transactions for ${account.name}...`,
                progress: {
                  current,
                  total,
                  accountName: account.name
                }
              });

              const transactions = await quilttApi.getAllAccountTransactions(
                account.id,
                taxYear
              );

              console.log(`Synced ${transactions.length} transactions for account ${account.id}`);
            }

            setSyncStatus({
              status: 'completed',
              message: 'Transaction sync completed'
            });
          }
        } catch (error) {
          console.error('Transaction sync failed:', error);
          setSyncStatus({
            status: 'error',
            message: 'Failed to sync transactions'
          });
        }
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading bank connections...</div>;
  }

  return (
    <div className="bg-gray-200 p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6">
        <div className="space-y-6">
          {/* Connection Section */}
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Bank {taxYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <QuilttConnect onConnectionChange={handleConnectionChange} />
            </CardContent>
          </Card>
  
          {connections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Connected Banks</CardTitle>
              </CardHeader>
              <CardContent>
                {connections.map((conn) => (
                  <div key={conn.id} className="mt-4 rounded bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{conn.institution?.name}</h3>
                      <span
                        className={`rounded px-2 py-1 text-sm ${
                          conn.status === 'SYNCED'
                            ? 'bg-green-100 text-green-800'
                            : conn.status === 'SYNCING'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {conn.status.toLowerCase()}
                      </span>
                    </div>
  
                    {conn.accounts?.map((acc) => (
                      <div key={acc.id} className="mt-2 ml-4 flex justify-between text-sm">
                        <span>
                          {acc.name} {acc.mask ? `x${acc.mask}` : ''}
                        </span>
                        <span className="text-gray-600">
                          ${acc.currentBalance?.toFixed(2) ?? 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
  
                {syncStatus.status !== 'idle' && (
                  <Alert
                    className={`mt-4 ${
                      syncStatus.status === 'completed'
                        ? 'bg-green-50'
                        : syncStatus.status === 'error'
                          ? 'bg-red-50'
                          : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {syncStatus.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : syncStatus.status === 'error' ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                      <AlertTitle>
                        {syncStatus.status === 'completed'
                          ? 'Success!'
                          : syncStatus.status === 'error'
                            ? 'Error'
                            : 'Syncing...'}
                      </AlertTitle>
                    </div>
                    <AlertDescription className="mt-2">
                      {syncStatus.message}
                      {syncStatus.progress && (
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{syncStatus.progress.accountName}</span>
                            <span>
                              {syncStatus.progress.current} of {syncStatus.progress.total} banks
                            </span>
                          </div>
                          <Progress
                            value={(syncStatus.progress.current / syncStatus.progress.total) * 100}
                          />
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

  export default MVPPage;
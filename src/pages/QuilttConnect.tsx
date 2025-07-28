import { useState, useEffect } from 'react';
import { QuilttButton, ConnectorSDKEventType, useQuilttSession } from '@quiltt/react';
import type { ConnectorSDKCallbackMetadata } from '@quiltt/react';
import { quilttApi } from '../services/quilttApi';
import { Card, CardContent } from '../components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { QuilttAccount, ConnectionState } from '../types/quiltt';

interface QuilttConnectProps {
  onConnectionChange?: (state: ConnectionState) => void;
}

export default function QuilttConnect({ onConnectionChange }: QuilttConnectProps) {
  const { session } = useQuilttSession();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'idle',
  });
  const [connectedAccounts, setConnectedAccounts] = useState<QuilttAccount[]>([]);
  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean;
    message?: string;
    error?: string;
  }>({ isSyncing: false });

  useEffect(() => {
    if (session?.token) {
      loadConnectedAccounts();
    }
  }, [session?.token]);

  const loadConnectedAccounts = async () => {
    try {
      const response = await quilttApi.getConnectionsGraphQL();
      console.log('GraphQL connections response:', response);
      
      // Fix the institution mapping
      const allAccounts = response.connections.flatMap(conn => 
        (conn.accounts || []).map(acc => ({
          ...acc,
          institution: {
            name: conn.institution?.name || 'Unknown Institution'
          }
        }))
      );
      
      setConnectedAccounts(allAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkSyncStatus = async () => {
      if (!connectionState.connectionId || !syncStatus.isSyncing) return;

      try {
        const status = await quilttApi.getSyncStatus(connectionState.connectionId);
        
        if (status.data.isSyncing) {
          const newState: ConnectionState = {
            ...connectionState,
            status: 'syncing',
            message: 'Syncing your transactions...'
          };
          setConnectionState(newState);
          onConnectionChange?.(newState);
          
          setSyncStatus({
            isSyncing: true,
            message: 'Syncing your transactions...',
          });
        } else {
          const newState: ConnectionState = {
            ...connectionState,
            status: 'connected',
            message: 'Sync completed'
          };
          setConnectionState(newState);
          onConnectionChange?.(newState);
          
          setSyncStatus({ isSyncing: false });
          await loadConnectedAccounts();
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error checking sync status:', error);
        const newState: ConnectionState = {
          ...connectionState,
          status: 'error',
          message: 'Failed to check sync status'
        };
        setConnectionState(newState);
        onConnectionChange?.(newState);
        
        setSyncStatus({
          isSyncing: false,
          error: 'Failed to check sync status',
        });
        clearInterval(intervalId);
      }
    };

    if (syncStatus.isSyncing) {
      intervalId = setInterval(checkSyncStatus, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionState, onConnectionChange, syncStatus.isSyncing]);

  const handleEvent = async (
    type: ConnectorSDKEventType,
    metadata: ConnectorSDKCallbackMetadata
  ) => {
    console.log(`Quiltt event: ${type}`, metadata);

    try {
      switch (type) {
        case ConnectorSDKEventType.Open: {
          const newState: ConnectionState = {
            status: 'connecting',
            message: 'Connecting to bank...',
          };
          setConnectionState(newState);
          onConnectionChange?.(newState);
          break;
        }

        case ConnectorSDKEventType.ExitSuccess: {
          console.log('ExitSuccess Debug:', metadata);  
          
          if (!metadata.connectionId || !metadata.profileId) {
            throw new Error('Missing connection or profile ID');
          }
        
          try {
            // Save connection to database (this method already gets GraphQL data)
            const saveResponse = await quilttApi.saveConnection(metadata.connectionId);
            console.log('Connection save response:', saveResponse);
        
            setSyncStatus({
              isSyncing: true,
              message: 'Starting initial sync...',
            });
            
            const connectedState: ConnectionState = {
              status: 'connected',
              message: 'Connected successfully, syncing data...',
              connectionId: metadata.connectionId,
              profileId: metadata.profileId,
            };
            setConnectionState(connectedState);
            onConnectionChange?.(connectedState);
            
            await loadConnectedAccounts();
            
          } catch (error) {
            console.error('Connection process failed:', error);
            const errorState: ConnectionState = {
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to establish connection',
            };
            setConnectionState(errorState);
            onConnectionChange?.(errorState);
          }
          break;
        }

        case ConnectorSDKEventType.ExitError: {
          const errorState: ConnectionState = {
            status: 'error',
            message: 'Connection failed. Please try again.',
          };
          setConnectionState(errorState);
          onConnectionChange?.(errorState);
          break;
        }

        case ConnectorSDKEventType.ExitAbort: {
          const idleState: ConnectionState = {
            status: 'idle',
            message: 'Connection cancelled',
          };
          setConnectionState(idleState);
          onConnectionChange?.(idleState);
          break;
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      const errorState: ConnectionState = {
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
      setConnectionState(errorState);
      onConnectionChange?.(errorState);
    }
  };

  const connectorId = import.meta.env.VITE_QUILTT_CONNECTOR_ID;

  if (!connectorId) {
    console.error('Missing VITE_QUILTT_CONNECTOR_ID environment variable');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <QuilttButton
          connectorId={connectorId}
          onEvent={handleEvent}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={['connecting', 'initializing', 'syncing'].includes(connectionState.status)}
        >
          {connectionState.status === 'idle' ? 'Connect Account' : 'Connecting...'}
        </QuilttButton>

        {(connectionState.message || syncStatus.message || syncStatus.error) && (
          <Alert
            className={`
              ${connectionState.status === 'error' || syncStatus.error
                ? 'bg-red-50'
                : connectionState.status === 'connected' && !syncStatus.isSyncing
                  ? 'bg-green-50'
                  : 'bg-blue-50'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {syncStatus.isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : connectionState.status === 'error' || syncStatus.error ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertTitle>
                {syncStatus.error
                  ? 'Error'
                  : syncStatus.isSyncing
                    ? 'Syncing...'
                    : connectionState.status === 'error'
                      ? 'Error'
                      : 'Success'}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {syncStatus.error || connectionState.message || syncStatus.message}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {connectedAccounts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">My Connected Accounts</h3>
            <div className="space-y-4">
              {connectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{account.institution?.name}</h4>
                      <p className="text-sm text-gray-600">
                        Account {account.mask ? `x${account.mask}` : account.name}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {account.currentBalance != null && (
                        <div className="mb-1">
                          ${account.currentBalance.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { taxYearApi } from '../services/taxYearApi';
import { Transaction } from '../utils/types';
import { transactionsApi } from '../services/transactionsApi';

interface DayCounts {
  business: number;
  personal: number;
  total: number;
}

interface TransactionCounts {
  [date: string]: DayCounts;
}

interface DayLabel {
  key: string;
  label: string;
}

const ContributionGrid: React.FC = () => {
  const [transactionCounts, setTransactionCounts] = useState<TransactionCounts>({});
  const [taxYear, setTaxYear] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days: DayLabel[] = [
    { key: 'Mon', label: 'M' },
    { key: 'Tue', label: 'T' },
    { key: 'Wed', label: 'W' },
    { key: 'Thu', label: 'T' },
    { key: 'Fri', label: 'F' },
    { key: 'Sat', label: 'S' },
    { key: 'Sun', label: 'S' }
  ];
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const taxYearResponse = await taxYearApi.get();
        const year = taxYearResponse.taxYear;
        setTaxYear(year);
        
        // Fetch both regular and income transactions
        const [regularResponse, incomeResponse] = await Promise.all([
          transactionsApi.fetch({
            page: 1,
            itemsPerPage: 5000,
            sortColumn: "date",
            sortDirection: "asc"
          }),
          transactionsApi.getIncomeTransactions({})
        ]);

        // Combine both transaction sets
        const allTransactions = [
          ...(regularResponse.transactions || []),
          ...(incomeResponse.transactions || [])
        ];

        if (allTransactions.length > 0) {
          const dateMap = new Map<string, DayCounts>();
          
          allTransactions.forEach((transaction: Transaction) => {
            const date = new Date(transaction.date).toISOString().split('T')[0];
            if (!dateMap.has(date)) {
              dateMap.set(date, {
                business: 0,
                personal: 0,
                total: 0
              });
            }
            const counts = dateMap.get(date)!;
            
            // Count business transactions
            if (transaction.business) {
              counts.business++;
            } else {
              counts.personal++;
            }
            counts.total++;
          });

          const counts: TransactionCounts = {};
          dateMap.forEach((value, key) => {
            counts[key] = value;
          });

          setTransactionCounts(counts);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
        setError('Failed to load transaction data');
      }
    };

    loadData();
  }, []);

  
  const getContributionColor = (counts: DayCounts): string => {
    if (!counts || counts.total === 0) return 'bg-gray-100';
    
    if (counts.business > 0 && counts.personal === 0) {
      return 'bg-blue-500';
    } else if (counts.personal > 0 && counts.business === 0) {
      return 'bg-green-500';
    } else if (counts.business > 0 && counts.personal > 0) {
      return 'bg-purple-500';
    }
    return 'bg-gray-100';
  };

  const generateWeeks = (): Date[][] => {
    if (!taxYear) return [];
    
    const start = new Date(`${taxYear}-01-01`);
    const end = new Date(`${taxYear}-12-31`);
    
    const weeks: Date[][] = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        if (currentDate <= end) {
          week.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const weeks = generateWeeks();

  if (!taxYear) return null;
  if (error) return <div className="text-red-500">{error}</div>;

  // Rest of your return statement remains the same...
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center">
          Transaction Uploads for {taxYear}
        </h2>
      </div>
      <div className="flex">
        <div className="w-8 flex-shrink-0">
          <div className="h-6" />
          {days.map(({ key, label }) => (
            <div key={key} className="h-4 mb-1 text-xs font-bold text-gray-600">
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="flex flex-col gap-1">
              {week[0] && (
                <div className="h-6 text-xs text-gray-600 text-center">
                  {week[0].getDate() <= 7 ? months[week[0].getMonth()] : ''}
                </div>
              )}
              {week.map((date, dayIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const counts = transactionCounts[dateStr] || { business: 0, personal: 0, total: 0 };
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-4 h-4 rounded-sm ${getContributionColor(counts)}`}
                    title={`${date.toLocaleDateString()}: ${counts.total} total (Business: ${counts.business}, Personal: ${counts.personal})`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded-sm" /> No Transactions
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 rounded-sm" /> Business Only
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded-sm" /> Personal Only
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-purple-500 rounded-sm" /> Mixed
        </div>
      </div>
    </div>
  );
};

export default ContributionGrid;
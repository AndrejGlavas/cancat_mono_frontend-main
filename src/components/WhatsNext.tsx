import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Upload, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/alert';
import type { Transaction } from '../utils/types';
import { banksApi } from '../services/banksApi';

interface WhatsNextProps {
  transactions: Transaction[];
}

const WhatsNext = ({ transactions = [] }: WhatsNextProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [analytics, setAnalytics] = useState({
    hasUncategorizedIncome: false,
    hasLowTransactionCount: false,
    needsBusinessCategories: false,
    needsBankSetup: true,
    hasUntaggedPersonalDeductions: false,
  });

  useEffect(() => {
    const checkBankSetup = async () => {
      try {
        const banksResponse = await banksApi.getAll();
        if (banksResponse.status === 'success') {
          setAnalytics((prev) => ({
            ...prev,
            needsBankSetup: !banksResponse.data || banksResponse.data.length === 0,
          }));
        }
      } catch (error) {
        console.error('Error checking bank setup:', error);
      }
    };

    checkBankSetup();
  }, []);

  useEffect(() => {
    // Find uncategorized income transactions
    const uncategorizedIncome = transactions.filter(
      (t) => t.deposit === true && t.income === true && t.hidden === false && !t.tag
    ).length;

    // Check total transaction count
    const hasLowTransactionCount = transactions.length < 50;

    // Calculate business transaction percentage
    const businessTransactions = transactions.filter(
      (t) => t.deposit === false && t.business === true && t.split === false && t.hidden === false
    ).length;

    const businessPercentage =
      transactions.length > 0 ? (businessTransactions / transactions.length) * 100 : 0;

    // Check for untagged personal deductions
    const untaggedPersonal =
      transactions.filter((t) => !t.business && !t.deposit && !t.tag && !t.hidden).length > 0;

    setAnalytics((prev) => ({
      ...prev,
      hasUncategorizedIncome: uncategorizedIncome > 0,
      hasLowTransactionCount,
      needsBusinessCategories: businessPercentage < 5,
      hasUntaggedPersonalDeductions: untaggedPersonal,
    }));
  }, [transactions]);

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  interface ActionCardProps {
    isVisible: boolean;
    title: string;
    description: string;
    linkTo: string;
    expandKey: string;
    buttonText?: string;
    icon?: React.ReactNode;
  }

  const ActionCard = ({
    isVisible,
    title,
    description,
    linkTo,
    expandKey,
    buttonText = 'Take Action',
    icon,
  }: ActionCardProps) => {
    if (!isVisible) return null;

    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <button
            type="button"
            className="mb-2 flex cursor-pointer items-center justify-between"
            onClick={() => toggleExpand(expandKey)}
          >
            <div className="flex items-center gap-2">
              {icon && <div className="text-indigo-600">{icon}</div>}
              <h3 className="font-semibold text-indigo-700 text-lg">{title}</h3>
            </div>
            {expandedItems[expandKey] ? (
              <ChevronUp className="text-gray-500" />
            ) : (
              <ChevronDown className="text-gray-500" />
            )}
          </button>

          {expandedItems[expandKey] && (
            <Alert className="mb-4 bg-gray-50">
              <AlertDescription>{description}</AlertDescription>
            </Alert>
          )}

          <Link
            to={linkTo}
            className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            {buttonText}
          </Link>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 font-bold text-2xl text-gray-800">What's Next?</h2>

      <ActionCard
        isVisible={analytics.needsBankSetup}
        title="Connect Your Bank"
        description="Start by connecting your bank accounts to automatically import your transactions. This will help you track your income and expenses more efficiently."
        linkTo="/settings"
        expandKey="bank"
        buttonText="Add Bank"
        icon={<PiggyBank className="h-5 w-5" />}
      />

      <ActionCard
        isVisible={analytics.hasUncategorizedIncome}
        title="Categorize Your Income"
        description="You have uncategorized income transactions. Properly categorizing your income between W2 and 1099 helps ensure accurate tax calculations."
        linkTo="/income"
        expandKey="income"
        buttonText="Categorize Income"
      />

      <ActionCard
        isVisible={analytics.hasLowTransactionCount}
        title="Upload More Transactions"
        description="Add more transactions to get a complete picture of your finances for tax purposes. More transactions mean more opportunities for tax deductions."
        linkTo="/upload"
        expandKey="upload"
        buttonText="Upload Now"
        icon={<Upload className="h-5 w-5" />}
      />

      <ActionCard
        isVisible={analytics.needsBusinessCategories}
        title="Find Business Transactions"
        description="You may have uncategorized business expenses. Categorizing transactions as 'business' allows you to tag their deduction category."
        linkTo="/expenses"
        expandKey="business"
        buttonText="Find Business Expenses"
      />

      <ActionCard
        isVisible={analytics.hasUntaggedPersonalDeductions}
        title="Tag Personal Deductions"
        description="You have untagged personal transactions that might qualify as tax deductions. Adding tags helps your accountant identify potential tax savings."
        linkTo="/expenses"
        expandKey="personal"
        buttonText="Review Personal Expenses"
      />

      {!Object.values(analytics).some(Boolean) && (
        <div className="py-4 text-center text-gray-500">
          You're all caught up! Keep managing your transactions as they come in.
        </div>
      )}
    </div>
  );
};

export default WhatsNext;

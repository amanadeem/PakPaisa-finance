export type AccountType = 'Cash' | 'Meezan Bank' | 'HBL' | 'SadaPay' | 'NayaPay' | 'Bank Alfalah' | 'EasyPaisa';

export interface BankAccount {
  id: string;
  name: string;
  type: AccountType;
  accountNumber: string;
  balance: number;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountType: AccountType;
  isSimulated?: boolean;
}

export interface SMSParseResult {
  amount: number | null;
  transactionType: 'debit' | 'credit' | null;
  bankName: AccountType | 'Unknown';
  merchant: string;
  category: string;
  parsedSuccessfully: boolean;
  notes?: string;
}

export interface InvestmentScheme {
  id: string;
  name: string;
  category: 'Gold' | 'Mutual Funds' | 'National Savings' | 'Stocks' | 'Real Estate';
  expectedReturnRate: number; // annual % return e.g. 18 for 18%
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
  taxTreatmentFiler: string;
  taxTreatmentNonFiler: string;
  minimumInvestment: number;
  isHalal: boolean;
  shariahAdvisor?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlyDeposit: number;
  monthsToGoal: number;
  targetCategory: string; // e.g. "Hajj", "Car", "House Downpayment", "Wedding"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

import React, { useState, useMemo, FormEvent } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Search,
  Scale,
  Sparkles,
  Calculator,
  MessageSquare,
  ShieldCheck,
  Building,
  Briefcase,
  Layers,
  Percent,
  CheckCircle,
  HelpCircle,
  DollarSign,
  ArrowUpRight,
  HeartHandshake,
  TrendingUp as ProfitIcon,
  Pencil,
  X,
  Link,
  AlertCircle
} from 'lucide-react';
import { Transaction, AccountType, BankAccount, InvestmentScheme, SavingsGoal } from './types.ts';
import SMSParser from './components/SMSParser.tsx';
import AIChatBot from './components/AIChatBot.tsx';

// Initial Pakistan Bank Accounts list with realistic opening balances
const INITIAL_ACCOUNTS: BankAccount[] = [
  { id: '1', name: 'Wallet Cash', type: 'Cash', accountNumber: 'Physical Wallet', balance: 18500 },
  { id: '2', name: 'Meezan Bank Ltd', type: 'Meezan Bank', accountNumber: 'PK76MEZN000213985', balance: 145000 },
  { id: '3', name: 'SadaPay Wallet', type: 'SadaPay', accountNumber: '03001234567', balance: 24300 },
  { id: '4', name: 'HBL Account', type: 'HBL', accountNumber: 'PK12HABB008923055', balance: 75200 },
  { id: '5', name: 'EasyPaisa Account', type: 'EasyPaisa', accountNumber: '03459876543', balance: 8900 }
];

// Initial Transactions Ledger with local context (chai, fuel, foodpanda, salary in PKR)
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', amount: 85000, description: 'Software Freelance Gig Payment (Upwork)', type: 'income', category: 'Salary & Investments', date: '2026-06-01', accountType: 'HBL' },
  { id: 't2', amount: 1250, description: 'Gloria Jeans Iced Latte & Chai with Friends', type: 'expense', category: 'Food & Chai', date: '2026-06-02', accountType: 'SadaPay' },
  { id: 't3', amount: 4500, description: 'Kurta Purchase at J. Junaid Jamshed', type: 'expense', category: 'Shopping', date: '2026-06-02', accountType: 'Meezan Bank' },
  { id: 't4', amount: 3000, description: 'Petrol Refuel for Honda Civic', type: 'expense', category: 'Fuel & Transport', date: '2026-05-31', accountType: 'Cash' },
  { id: 't5', amount: 15400, description: 'K-Electric Monthly Utility Bill', type: 'expense', category: 'Bills & Utilities', date: '2026-05-28', accountType: 'Meezan Bank' },
  { id: 't6', amount: 1000, description: 'Easyload Jazz Super Cards', type: 'expense', category: 'Mobile Recharge', date: '2026-05-30', accountType: 'EasyPaisa' },
  { id: 't7', amount: 5000, description: 'Charity Contribution to Edhi Foundation', type: 'expense', category: 'Zakat & Donations', date: '2026-05-27', accountType: 'Cash' }
];

// Local realistic Shariah-Compliant Investment options in Pakistan
const INVESTMENT_SCHEMES: InvestmentScheme[] = [
  {
    id: 'inv1',
    name: 'Al-Meezan Sovereign Fund',
    category: 'Mutual Funds',
    expectedReturnRate: 18.5,
    riskLevel: 'Low',
    description: 'High-liquidity open-end mutual fund investing in short-term Halal govt securities & deposits. Ideal for capital preservation plus healthy daily yield.',
    taxTreatmentFiler: '15% withholding tax on capital gains.',
    taxTreatmentNonFiler: '30% withholding penalty on capital gains.',
    minimumInvestment: 5000,
    isHalal: true,
    shariahAdvisor: 'Mufti Muhammad Naveed Alam'
  },
  {
    id: 'inv2',
    name: 'Physical 24K Gold Accumulation',
    category: 'Gold',
    expectedReturnRate: 22.0,
    riskLevel: 'Medium',
    description: 'Direct hedge against PKR currency depreciation. Accumulating gold bars through authorized dealers matching SARAF bullion market rates.',
    taxTreatmentFiler: 'No tax unless declared in capital assets wealth return (disposable gains taxed as per standard asset holding terms).',
    taxTreatmentNonFiler: 'Subject to double audit checks and high wealth mismatch penalties during registration.',
    minimumInvestment: 15000,
    isHalal: true,
    shariahAdvisor: 'Consensus classic asset'
  },
  {
    id: 'inv3',
    name: 'Sarwa Islamic Savings Plan',
    category: 'National Savings',
    expectedReturnRate: 16.2,
    riskLevel: 'Low',
    description: 'Shariah-compliant government certificates managed by Central Directorate of National Savings. Safe, backed directly by Gov of Pakistan.',
    taxTreatmentFiler: '15% withholding tax at source.',
    taxTreatmentNonFiler: '35% penal tax rate for non-filers on generated profit.',
    minimumInvestment: 10000,
    isHalal: true,
    shariahAdvisor: 'National Savings Shariah Board'
  },
  {
    id: 'inv4',
    name: 'Meezan Islamic index (KMI-30) PSX',
    category: 'Stocks',
    expectedReturnRate: 25.0,
    riskLevel: 'High',
    description: 'Investment in Shariah-screened blue chip stocks listed on the Pakistan Stock Exchange, exhibiting stellar dividend yields and active growth.',
    taxTreatmentFiler: '15% tax on stock dividends, 15% on capital gains under 1 year holding.',
    taxTreatmentNonFiler: '30% tax on stock dividends, 30% capital gains.',
    minimumInvestment: 1000,
    isHalal: true,
    shariahAdvisor: 'Meezan Shariah Supervisory Board'
  }
];

// Standard Savings Goals for a Pakistani middle class family
const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  { id: 'g1', title: 'Umrah Package for Parents', targetAmount: 650000, currentAmount: 350000, monthlyDeposit: 30000, monthsToGoal: 10, targetCategory: 'Religious' },
  { id: 'g2', title: 'Honda City Downpayment', targetAmount: 1800000, currentAmount: 850000, monthlyDeposit: 50000, monthsToGoal: 19, targetCategory: 'Vehicle' },
  { id: 'g3', title: 'Emergency Halal Fund (6M Expenses)', targetAmount: 300000, currentAmount: 120000, monthlyDeposit: 15000, monthsToGoal: 12, targetCategory: 'Security' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tax' | 'zakat' | 'investments' | 'advisor'>('dashboard');

  // Core Ledger State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  
  // Mobile Modal state & cleared checklist state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [clearedTxIds, setClearedTxIds] = useState<string[]>(['t1', 't2', 't4', 't5']);

  // Edit transaction state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Category filter chip state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  // New Transaction Form State
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('Food & Chai');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txAccount, setTxAccount] = useState<AccountType>('Meezan Bank');
  const [txSearch, setTxSearch] = useState('');

  // User Interactive Profile Context
  const [salaryProfile, setSalaryProfile] = useState<number>(180000); // Monthly Salary in PKR
  const [taxStatus, setTaxStatus] = useState<'filer' | 'non-filer'>('filer');
  const [majorGoal, setMajorGoal] = useState('Hajj / Umrah');
  const [riskPref, setRiskPref] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // Interactive Zakat Form State
  const [zSourceBank, setZSourceBank] = useState<number>(350000); // Bank Savings subject to Zakat
  const [zSourceCash, setZSourceCash] = useState<number>(25000); // Physical Cash
  const [zSourceGoldVal, setZSourceGoldVal] = useState<number>(480000); // Total worth of gold owned
  const [zSourceSilverVal, setZSourceSilverVal] = useState<number>(30000); // Silver value
  const [zSourceStocks, setZSourceStocks] = useState<number>(120000); // Shares/Mutual funds value
  const [zSourceReceivables, setZSourceReceivables] = useState<number>(0); // Business receivables
  const [zLiabilities, setZLiabilities] = useState<number>(15000); // Immediate bills or loans payable
  const nisabSilverThreshold = 145000; // Average silver threshold value in PKR for Saheb-e-Nisab

  // Savings Goals State
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(INITIAL_SAVINGS_GOALS);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDeposit, setNewGoalDeposit] = useState('');
  const [newGoalCat, setNewGoalCat] = useState('Religious');

  // Sandbox simulated bank interface states
  const [activeSimulationBank, setActiveSimulationBank] = useState<AccountType>('Meezan Bank');
  const [simulationAmount, setSimulationAmount] = useState('');
  const [simulationType, setSimulationType] = useState<'debit' | 'credit'>('debit');
  const [simulationMerchant, setSimulationMerchant] = useState('Foodpanda Delivery');
  const [generatedSMSText, setGeneratedSMSText] = useState('');

  // Income categories list
  const categoriesList = [
    "Food & Chai",
    "Fuel & Transport",
    "Bills & Utilities",
    "Mobile Recharge",
    "Shopping",
    "Entertainment & Services",
    "Zakat & Donations",
    "Salary & Investments",
    "Rent & Home",
    "Medical & Health",
    "Others"
  ];

  // Calculated ledger figures
  const { totalIncome, totalExpense, currentNetWorth } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    // Dynamically calculate based on starting bank values + operations
    // For a cleaner simulation let starting balance be modified or dynamic
    const accountSum = accounts.reduce((acc, b) => acc + b.balance, 0);
    return {
      totalIncome: inc,
      totalExpense: exp,
      currentNetWorth: accountSum
    };
  }, [transactions, accounts]);

  // Handle transaction deletion
  const handleDeleteTransaction = (id: string, amount: number, type: 'income' | 'expense', acType: AccountType) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    // Revert bank account balance
    setAccounts(prev => prev.map(ac => {
      if (ac.type === acType) {
        return {
          ...ac,
          balance: type === 'expense' ? ac.balance + amount : ac.balance - amount
        };
      }
      return ac;
    }));
  };

  // Open edit modal with the selected transaction pre-filled
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx({ ...tx });
    setIsEditModalOpen(true);
  };

  // Save edited transaction — revert old balance effect then apply new
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const original = transactions.find(t => t.id === editingTx.id);
    if (!original) return;

    setTransactions(prev => prev.map(t => t.id === editingTx.id ? editingTx : t));

    // Revert original balance, then apply new
    setAccounts(prev => prev.map(ac => {
      let bal = ac.balance;
      // Revert original transaction effect
      if (ac.type === original.accountType) {
        bal = original.type === 'expense' ? bal + original.amount : bal - original.amount;
      }
      // Apply new transaction effect (if same account, both adjustments happen sequentially)
      if (ac.type === editingTx.accountType) {
        bal = editingTx.type === 'expense' ? bal - editingTx.amount : bal + editingTx.amount;
      }
      if (ac.type === original.accountType || ac.type === editingTx.accountType) {
        return { ...ac, balance: Math.max(0, bal) };
      }
      return ac;
    }));

    setIsEditModalOpen(false);
    setEditingTx(null);
  };

  // Add parsed or manually typed transaction
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const txId = `tx-${Date.now()}`;
    const formattedTx: Transaction = {
      ...newTx,
      id: txId
    };

    setTransactions(prev => [formattedTx, ...prev]);
    // Auto clear new logs
    setClearedTxIds(prev => [...prev, txId]);

    // Apply directly to the simulated bank balance
    setAccounts(prev => prev.map(ac => {
      if (ac.type === newTx.accountType) {
        const factor = newTx.type === 'income' ? 1 : -1;
        return {
          ...ac,
          balance: Math.max(0, ac.balance + (newTx.amount * factor))
        };
      }
      return ac;
    }));
  };

  // Manual transaction submission from the form
  const handleManualTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || parseFloat(txAmount) <= 0 || !txDesc.trim()) return;

    handleAddTransaction({
      amount: parseFloat(txAmount),
      description: txDesc.trim(),
      type: txType,
      category: txCategory,
      date: txDate,
      accountType: txAccount
    });

    setTxAmount('');
    setTxDesc('');
    setIsTxModalOpen(false); // Close the beautiful touch-friendly overlay modal
  };

  // Quick SMS generator for testing the SMS parser
  const handleGenerateSimulatedSMS = () => {
    const amt = parseFloat(simulationAmount) || 1200;
    const mid = simulationMerchant.trim() || 'Foodpanda Delivery';
    const bName = activeSimulationBank;

    let sms = '';
    const dateStr = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: false });

    if (bName === 'Meezan Bank') {
      sms = `Meezan Bank: Your account 0201******921 has been ${simulationType === 'debit' ? 'debited' : 'credited'} with PKR ${amt.toLocaleString('.2f')} for transaction at ${mid} on ${dateStr} ${timeStr}.`;
    } else if (bName === 'SadaPay') {
      sms = simulationType === 'debit' 
        ? `Spent Rs. ${amt.toLocaleString('.2f')} at ${mid} with your SadaPay Card. Ref: ${Math.floor(100000 + Math.random() * 900000)}`
        : `Rs. ${amt.toLocaleString('.2f')} was added to your SadaPay wallet from ${mid}. Bal: Rs. 42,900.00`;
    } else if (bName === 'EasyPaisa') {
      sms = simulationType === 'debit'
        ? `EasyPaisa: Paid Rs. ${amt.toLocaleString('.2f')} to ${mid} on ${dateStr}. TransID: 29388192`
        : `EasyPaisa: You have received Rs. ${amt.toLocaleString('.2f')} from ${mid}. Your new EasyPaisa balance is Rs. 18,340.00.`;
    } else if (bName === 'HBL') {
      sms = `HBL info: ${simulationType === 'debit' ? 'Debit' : 'Credit'} transaction of PKR ${amt.toLocaleString('.2f')} on Acct ending 4402 on ${dateStr} for ${mid}. Ref: HBL${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      sms = `Bank Alert: PKR ${amt.toLocaleString('.2f')} has been ${simulationType === 'debit' ? 'debited from' : 'credited to'} your account for ${mid} on ${dateStr}.`;
    }

    setGeneratedSMSText(sms);
  };

  // Calculate annual/monthly PKR Income Tax
  const taxCalculations = useMemo(() => {
    const annualSalary = salaryProfile * 12;
    let annualTax = 0;
    let slabDetails = '';

    // Salaried tax rates budget FY2024-2025
    if (annualSalary <= 600000) {
      annualTax = 0;
      slabDetails = 'Rs. 0 to 6 Lakhs/yr is tax-exempt in Pakistan.';
    } else if (annualSalary <= 1200000) {
      annualTax = (annualSalary - 600000) * 0.025;
      slabDetails = '2.5% of amount exceeding Rs. 600,000.';
    } else if (annualSalary <= 2200000) {
      annualTax = 15000 + (annualSalary - 1200000) * 0.125;
      slabDetails = 'Rs. 15,000 + 12.5% of amount exceeding Rs. 1.2 Million.';
    } else if (annualSalary <= 3200000) {
      annualTax = 140000 + (annualSalary - 2200000) * 0.225;
      slabDetails = 'Rs. 140,000 + 22.5% of amount exceeding Rs. 2.2 Million.';
    } else if (annualSalary <= 4100000) {
      annualTax = 365000 + (annualSalary - 3200000) * 0.275;
      slabDetails = 'Rs. 365,000 + 27.5% of amount exceeding Rs. 3.2 Million.';
    } else {
      annualTax = 612500 + (annualSalary - 4100000) * 0.35;
      slabDetails = 'Rs. 612,500 + 35% of amount exceeding Rs. 4.1 Million.';
    }

    const monthlyTax = annualTax / 12;
    const netTakeHome = salaryProfile - monthlyTax;

    return {
      annualTx: annualTax,
      monthlyTx: monthlyTax,
      takeHome: netTakeHome,
      slab: slabDetails,
      annualSalary
    };
  }, [salaryProfile]);

  // Interactive Zakat status calculations
  const zakatCalculations = useMemo(() => {
    const totalAssets = zSourceBank + zSourceCash + zSourceGoldVal + zSourceSilverVal + zSourceStocks + zSourceReceivables;
    const netLiabilities = zLiabilities;
    const zakatableWealth = Math.max(0, totalAssets - netLiabilities);
    const meetsNisab = zakatableWealth >= nisabSilverThreshold;
    const calculatedZakat = meetsNisab ? zakatableWealth * 0.025 : 0;

    return {
      totalAssets,
      zakatableWealth,
      meetsNisab,
      calculatedZakat
    };
  }, [zSourceBank, zSourceCash, zSourceGoldVal, zSourceSilverVal, zSourceStocks, zSourceReceivables, zLiabilities]);

  // Add custom savings goal
  const handleAddSavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget);
    const deposit = parseFloat(newGoalDeposit);
    if (!newGoalTitle.trim() || isNaN(target) || target <= 0) return;

    const monthlyDep = isNaN(deposit) || deposit <= 0 ? Math.round(target / 12) : deposit;
    const months = Math.ceil(target / monthlyDep);

    const newGoal: SavingsGoal = {
      id: `g-${Date.now()}`,
      title: newGoalTitle.trim(),
      targetAmount: target,
      currentAmount: 0,
      monthlyDeposit: monthlyDep,
      monthsToGoal: months,
      targetCategory: newGoalCat
    };

    setSavingsGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalDeposit('');
  };

  // Delete saving goal
  const handleDeleteGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  // Filter Transactions list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(txSearch.toLowerCase()) ||
                          t.category.toLowerCase().includes(txSearch.toLowerCase());
      const matchCategory = activeCategoryFilter === 'All' || t.category === activeCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [transactions, txSearch, activeCategoryFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" id="app-root">
      {/* Prime Top Branding Header */}
      <header className="bg-emerald-950 text-white shadow-md border-b border-emerald-800" id="main-header">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <span className="text-4xl">🇵🇰</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-100 to-emerald-400 bg-clip-text text-transparent">
                PK Expense & Investment Tracker
              </h1>
              <p className="text-xs text-emerald-300 font-medium">
                Comprehensive Islamic Finance Planner • Customized for Pakistan Context
              </p>
            </div>
          </div>

          {/* Core Pakistani User Profile Quick Summary */}
          <div className="flex flex-wrap items-center gap-2.5 bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/60 max-w-lg">
            <div className="text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span className="font-semibold uppercase font-sans">Profile Panel</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div>
                  <span className="text-slate-400">Monthly Pay:</span>{' '}
                  <span className="text-white font-bold">Rs. {salaryProfile.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Tax Status:</span>{' '}
                  <span className="px-1.5 py-0.5 bg-emerald-600 rounded text-[10px] uppercase font-bold text-white">
                    {taxStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-l border-emerald-800/80 pl-2.5 ml-1 text-xs">
              <button
                type="button"
                id="tab-toggle-profile"
                onClick={() => {
                  // Instant focus layout or toggle status
                  setTaxStatus(prev => prev === 'filer' ? 'non-filer' : 'filer');
                }}
                className="px-2 py-1 bg-emerald-700/80 hover:bg-emerald-600 rounded text-[11px] font-bold transition-colors cursor-pointer"
              >
                Toggle Filer Status
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Sub-Navigation Row */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" id="sub-nav">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1.5 overflow-x-auto py-2.5">
          <button
            type="button"
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-900 text-white shadow-inner'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>PK Ledger & SMS Parser</span>
          </button>

          <button
            type="button"
            id="nav-tab-tax"
            onClick={() => setActiveTab('tax')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tax'
                ? 'bg-emerald-900 text-white shadow-inner'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span>FBR Tax Calculator (FY24/25)</span>
          </button>

          <button
            type="button"
            id="nav-tab-zakat"
            onClick={() => setActiveTab('zakat')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'zakat'
                ? 'bg-emerald-900 text-white shadow-inner'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            <span>Islamic Zakat Planner</span>
          </button>

          <button
            type="button"
            id="nav-tab-investments"
            onClick={() => setActiveTab('investments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'investments'
                ? 'bg-emerald-900 text-white shadow-inner'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Halal Wealth & Savings Planners</span>
          </button>

          <button
            type="button"
            id="nav-tab-advisor"
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-emerald-800 bg-emerald-50 hover:bg-emerald-100/85 cursor-pointer ${
              activeTab === 'advisor'
                ? 'bg-emerald-750 text-emerald-900 ring-2 ring-emerald-600/30 font-extrabold'
                : ''
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>RupeeWise AI Chat Coach</span>
          </button>
        </div>
      </nav>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 py-6" id="main-content-layout">
        
        {/* TAB 1: LEDGER AND BANK SMS INTEGRATION SIMULATION */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6" id="tab-dashboard-panel">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between" id="metric-pkr-balance">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Simulated Liquid Assets</span>
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    Rs. {currentNetWorth.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">Cumulative across 5 PK bank-wallets</span>
                </div>
                <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between" id="metric-pkr-income">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Monthly Total Inflow</span>
                  <span className="text-2xl font-bold text-emerald-700 tracking-tight">
                    Rs. {totalIncome.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600/95 font-medium block">Freelance earnings & salary additions</span>
                </div>
                <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between" id="metric-pkr-expense">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Monthly Spent Ledger</span>
                  <span className="text-2xl font-bold text-rose-700 tracking-tight">
                    Rs. {totalExpense.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-rose-500 font-medium block">Utility bills, groceries, tea-pani</span>
                </div>
                <div className="p-3.5 bg-rose-50 text-rose-700 rounded-xl">
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Split Screen Panel for SMS Simulator and parser */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Parsers and simulator (7 cols) */}
              <div className="lg:col-span-7 space-y-6">

                {/* Meezan Bank Connection Info Panel */}
                <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 text-amber-700 rounded-xl flex-shrink-0">
                      <Link className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800 text-sm">Connect Meezan Bank Account</h3>
                        <span className="text-[9px] px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full uppercase tracking-wide">Coming Soon</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Pakistani banks including Meezan Bank do not yet offer a public Open Banking API. Real-time automatic account syncing is not currently available. You can track your Meezan account two ways:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-800 uppercase">Option 1 — SMS Parser</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Paste your Meezan Bank transaction SMS alerts into the parser below. It auto-extracts amount, type, and logs it to your ledger.
                          </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Pencil className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-800 uppercase">Option 2 — Manual Entry</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Use the "Add Transaction" drawer to manually log each spend or income from your Meezan account.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <AlertCircle className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500">
                          Your Meezan Bank balance shown in the portfolio below is simulated. Update it manually to match your actual Meezan account balance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* SMS parser integration */}
                <SMSParser onAddTransaction={handleAddTransaction} />

                {/* Simulated SMS Bank Dispatcher (The simulator mock) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-base">Pakistani Bank Transaction Mock Simulator</h3>
                        <p className="text-xs text-slate-500">Draft & send custom SMS texts to inspect extraction logic</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">SELECT SENDER BANK</label>
                      <select
                        id="sim-bank-select"
                        value={activeSimulationBank}
                        onChange={(e) => setActiveSimulationBank(e.target.value as AccountType)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-850"
                      >
                        <option value="Meezan Bank">Meezan Bank Ltd (POS / Islamic Info)</option>
                        <option value="SadaPay">SadaPay Wallet Info</option>
                        <option value="EasyPaisa">EasyPaisa Mobile Wallet</option>
                        <option value="HBL">Habib Bank Ltd (HBL Mobile)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">TRANSACTION VALUE (PKR)</label>
                      <input
                        id="sim-amount-input"
                        type="number"
                        value={simulationAmount}
                        onChange={(e) => setSimulationAmount(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">TYPE OF MOVEMENT</label>
                      <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          id="btn-sim-debit"
                          onClick={() => setSimulationType('debit')}
                          className={`flex-1 text-center py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            simulationType === 'debit' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          Debit (Spent)
                        </button>
                        <button
                          type="button"
                          id="btn-sim-credit"
                          onClick={() => setSimulationType('credit')}
                          className={`flex-1 text-center py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            simulationType === 'credit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          Credit (Received)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">PARTICIPANT MERCHANT</label>
                      <input
                        id="sim-merchant-input"
                        type="text"
                        value={simulationMerchant}
                        onChange={(e) => setSimulationMerchant(e.target.value)}
                        placeholder="e.g. Foodpanda, KE Web Payment, KHALID MEHMOOD"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      id="generate-simulated-sms-btn"
                      onClick={handleGenerateSimulatedSMS}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Generate Mock SMS SMS text below
                    </button>

                    {generatedSMSText && (
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                        <span className="text-[10px] font-bold text-indigo-700 block mb-1">SIMULATED SMS FROM SENDER:</span>
                        <p className="text-xs text-slate-800 font-mono select-all bg-white p-2 border border-slate-100 rounded-lg">
                          {generatedSMSText}
                        </p>
                        <button
                          type="button"
                          id="trigger-sms-parse-btn"
                          onClick={() => {
                            // Populate the parser input of SMSParser.tsx
                            const textareaInput = document.getElementById('sms-textarea-input') as HTMLTextAreaElement;
                            if (textareaInput) {
                              textareaInput.value = generatedSMSText;
                              // Simulate typing event for react
                              const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
                              nativeTextAreaValueSetter?.call(textareaInput, generatedSMSText);
                              textareaInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                            // Trigger the parse with high priority scroll to viewport
                            document.getElementById('sms-textarea-input')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="mt-2 text-indigo-700 text-xs font-bold underline hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          Copy and send instantly to PK SMS Parser ↑
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Physical/Wallet balances list */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-semibold text-slate-800 text-sm">Liquid Balance Portfolio (Banks & Digital Wallets)</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full font-serif">PKR Accounts</span>
                  </div>
                  <div className="space-y-3">
                    {accounts.map(ac => (
                      <div key={ac.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-emerald-50 text-emerald-805 rounded-xl text-center min-w-[40px] font-extrabold text-[10px]">
                            {ac.type === 'Cash' ? '🪙' : '🏦'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{ac.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-medium">{ac.accountNumber}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-slate-800 font-sans block">Rs. {ac.balance.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-500 italic">No withholding liability</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Ledger Entry and Transaction List (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Manual Transaction Input Trigger Card */}
                <div className="bg-gradient-to-br from-slate-50 to-emerald-50/20 rounded-2xl border border-slate-150/75 shadow-xs p-6 relative overflow-hidden flex flex-col justify-between h-[180px]">
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3 pointer-events-none">
                    <Plus className="h-32 w-32 text-emerald-950 font-extrabold" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-2 font-mono">
                      Handy Ledger Tool
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm">Add Transaction Manually</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                      Easily log physical cash spendings, chai-pani receipts, or daily wages.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTxModalOpen(true)}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-800 to-teal-900 hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer mt-3 active:scale-98"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Launch Transaction Drawer</span>
                  </button>
                </div>

                {/* Ledger Listing */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <h3 className="font-semibold text-slate-800 text-sm">Financial Ledger</h3>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        id="ledger-search-input"
                        type="text"
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        placeholder="Search items, Category..."
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none w-full text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Category filter chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {['All', ...categoriesList].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          activeCategoryFilter === cat
                            ? 'bg-emerald-800 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto custom-scrollbar">
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        <p className="text-xs">No ledger history matches filter criteria</p>
                      </div>
                    ) : (
                      filteredTransactions.map((t) => {
                        const isCleared = clearedTxIds.includes(t.id);
                        return (
                          <div 
                            key={t.id} 
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                              isCleared 
                                ? 'bg-slate-50/65 border-slate-200/50 opacity-75' 
                                : 'bg-white border-slate-200 shadow-xs hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              {/* Reconcile toggle */}
                              <button
                                type="button"
                                id={`toggle-clear-${t.id}`}
                                title={isCleared ? "Mark as Pending" : "Reconcile & Clear"}
                                onClick={() => {
                                  setClearedTxIds(prev => 
                                    prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                                  );
                                }}
                                className={`h-5 w-5 rounded-full flex items-center justify-center border transition-all cursor-pointer flex-shrink-0 ${
                                  isCleared 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                    : 'border-slate-300 hover:border-emerald-600 hover:scale-105 active:scale-95 bg-slate-50'
                                }`}
                              >
                                <svg className={`h-3 w-3 text-white stroke-[3.5] ${isCleared ? 'block' : 'hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>

                              <div className="min-w-0">
                                <span className={`text-xs font-semibold block truncate ${
                                  isCleared ? 'text-slate-400 line-through decoration-slate-300 decoration-1 font-normal' : 'text-slate-800'
                                }`}>
                                  {t.description}
                                </span>
                                <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                    isCleared 
                                      ? 'bg-slate-200/50 text-slate-500' 
                                      : 'bg-emerald-50 text-emerald-800'
                                  }`}>
                                    {t.category}
                                  </span>
                                  <span>•</span>
                                  <span>{t.date}</span>
                                  <span>•</span>
                                  <span className="font-bold text-slate-500 font-mono tracking-tight uppercase">
                                    {t.accountType === 'Cash' ? '🪙 Cash' : `🏦 ${t.accountType}`}
                                  </span>
                                  {isCleared && (
                                    <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded uppercase tracking-wider">
                                      Cleared
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <span className={`text-xs font-bold font-sans mr-1 ${
                                isCleared 
                                  ? 'text-slate-400 font-normal' 
                                  : t.type === 'income' ? 'text-emerald-700' : 'text-slate-700'
                              }`}>
                                {t.type === 'income' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                              </span>
                              <button
                                type="button"
                                title="Edit transaction"
                                onClick={() => handleOpenEdit(t)}
                                className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                id={`ledger-del-btn-${t.id}`}
                                title="Delete transaction"
                                onClick={() => handleDeleteTransaction(t.id, t.amount, t.type, t.accountType)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: FILER VS NON-FILER TAX CALCULATOR IN PAKISTAN */}
        {activeTab === 'tax' && (
          <div className="space-y-6 animate-fadeIn" id="tab-tax-panel">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                  <Scale className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">
                    FBR Salaried Income Tax Calculator & Filer Comparison
                  </h2>
                  <p className="text-xs text-slate-500">
                    Slab rates updated for Tax Year 2024–2025. Illustrating benefits of becoming an active taxpayer in Pakistan.
                  </p>
                </div>
              </div>

              {/* Input for monthly salary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      SPECIFY YOUR MONTHLY GROSS SALARY (PKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 font-bold text-slate-400 text-sm">Rs.</span>
                      <input
                        id="tax-salary-input"
                        type="number"
                        min="10000"
                        step="5000"
                        value={salaryProfile}
                        onChange={(e) => setSalaryProfile(parseFloat(e.target.value) || 0)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-base"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1.5">
                      Equivalent to Rs. {(salaryProfile * 12).toLocaleString()} PKR per year.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      FILER VS NON-FILER TAX CLASSIFICATION
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        id="btn-tax-status-filer"
                        onClick={() => setTaxStatus('filer')}
                        className={`p-3.5 rounded-xl border text-xs font-bold tracking-wide cursor-pointer transition-all ${
                          taxStatus === 'filer'
                            ? 'bg-emerald-950 text-white border-emerald-900 shadow-sm'
                            : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1.5">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span>Filer Status</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        id="btn-tax-status-nonfiler"
                        onClick={() => setTaxStatus('non-filer')}
                        className={`p-3.5 rounded-xl border text-xs font-bold tracking-wide cursor-pointer transition-all ${
                          taxStatus === 'non-filer'
                            ? 'bg-rose-950 text-white border-rose-900 shadow-sm'
                            : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1.5">
                          <span>Non-Filer Status</span>
                        </div>
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1.5">
                      Determines withholding rates on banking transactions, purchase of property, and investments.
                    </span>
                  </div>
                </div>
              </div>

              {/* Output computation details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Salary Slab Breakdown & Tax Deductibles (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                    MONTHLY PAYSLIP DEDUCTIONS BREAKDOWN
                  </h3>

                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Gross Monthly Salary</span>
                      <span className="font-bold text-slate-800">Rs. {salaryProfile.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs bg-rose-50/40 p-2.5 rounded-lg border border-rose-100/20">
                      <div className="flex flex-col">
                        <span className="font-semibold text-rose-800">Monthly Salaried Income Tax Deductible</span>
                        <span className="text-[10px] text-slate-400 italic">Based on {taxCalculations.slab}</span>
                      </div>
                      <span className="font-bold text-rose-700 text-sm">
                        - Rs. {Math.round(taxCalculations.monthlyTx).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                      <span className="text-slate-800 font-bold">Estimated Take-Home (Net Salary)</span>
                      <span className="font-bold text-emerald-800 text-base">
                        Rs. {Math.round(taxCalculations.takeHome).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* FBR Slab schedule reference info */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                    <h4 className="font-bold text-slate-800 mb-2">Salary Tax Slab Schedule FY-2025:</h4>
                    <ul className="space-y-1 text-[11px] text-slate-650 list-disc pl-4.5">
                      <li>Up to PKR 600,000 / year: <strong className="text-slate-900 font-bold">Exempt (0% Tax)</strong></li>
                      <li>Rs. 600,001 to Rs. 1,200,000 / year: <strong className="text-slate-900 font-bold">2.5%</strong> of amount exceeding Rs. 600,000</li>
                      <li>Rs. 1,200,001 to Rs. 2,200,000 / year: <strong className="text-slate-900 font-bold">Rs. 15,000 + 12.5%</strong> of amount exceeding Rs. 1.2M</li>
                      <li>Rs. 2,200,001 to Rs. 3,200,000 / year: <strong className="text-slate-900 font-bold">Rs. 140,000 + 22.5%</strong> of amount exceeding Rs. 2.2M</li>
                      <li>Rs. 3,200,001 to Rs. 4,100,000 / year: <strong className="text-slate-900 font-bold">Rs. 365,000 + 27.5%</strong> of amount exceeding Rs. 3.2M</li>
                      <li>Above Rs. 4,100,000 / year: <strong className="text-slate-900 font-bold">Rs. 612,500 + 35%</strong> of amount exceeding Rs. 4.1M</li>
                    </ul>
                  </div>
                </div>

                {/* Non-Filer Pain Chart / Penalties Showcase (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-850">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building className="h-5 w-5 text-amber-400" />
                    <h3 className="font-bold text-sm text-yellow-400">FBR Active Filer Tax Comparison</h3>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                    In Pakistan, the FBR maintains heavy withholding taxes on individuals listed as **Non-Active Taxpayers (Non-Filers)**.
                  </p>

                  <div className="space-y-3.5">
                    
                    <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400 block font-medium uppercase font-sans text-[10px]">Savings Bank Profit Tax</span>
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <span className="text-emerald-400 font-bold text-xs">Filer: 15%</span>
                        </div>
                        <div className="border-l border-slate-700 pl-4">
                          <span className="text-red-400 font-bold text-xs">Non-Filer: 35%</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-450 block mt-1 italic">Meezan daily savings profit accounts, etc.</span>
                    </div>

                    <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400 block font-medium uppercase font-sans text-[10px]">Stock Market Dividends PSX</span>
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <span className="text-emerald-400 font-bold text-xs">Filer: 15%</span>
                        </div>
                        <div className="border-l border-slate-700 pl-4">
                          <span className="text-red-400 font-bold text-xs">Non-Filer: 30%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400 block font-medium uppercase font-sans text-[10px]">Bank Cash Withdrawals</span>
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <span className="text-emerald-400 font-bold text-xs">Filer: 0% Tax</span>
                        </div>
                        <div className="border-l border-slate-700 pl-4">
                          <span className="text-red-400 font-bold text-xs">Non-Filer: 0.6% tax (above 50K/day)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400 block font-medium uppercase font-sans text-[10px]">Mutual Funds Redemption</span>
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          <span className="text-emerald-400 font-bold text-xs">Filer: 15%</span>
                        </div>
                        <div className="border-l border-slate-700 pl-4">
                          <span className="text-red-400 font-bold text-xs">Non-Filer: 30%</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="mt-5 border-t border-slate-800 pt-4 text-center">
                    <span className="text-[10px] text-amber-300 font-bold block bg-amber-950/40 p-2 rounded-lg border border-amber-900/30">
                      Recommendation: File your income tax return via FBR IRIS portal to automatically claim target lower rates in 48 hours.
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: ISLAMIC GENERAL ZAKAT PLANNER */}
        {activeTab === 'zakat' && (
          <div className="space-y-6 animate-fadeIn" id="tab-zakat-panel">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                  <HeartHandshake className="h-6 w-6 font-bold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">Islamic Zakat Calculation Planner</h2>
                  <p className="text-xs text-slate-500">
                    Interactive Zakat helper using standard 2.5% (1/40th) rate on cumulative assets held for a full lunar year.
                  </p>
                </div>
              </div>

              {/* Informative alert about Nisab */}
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs flex justify-between gap-4 flex-wrap mb-8">
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-1">Nisab Threshold Rule (Silver standard)</span>
                  <p className="text-[11px] text-emerald-900/90 leading-relaxed max-w-3xl">
                    Gold Nisab equals 7.5 Tolas (87.5 grams), and Silver Nisab is 52.5 Tolas (612.4 grams). Classical scholars recommend silver-equivalent threshold (<span className="font-bold underline">approx Rs. 145,000</span> PKR depending on local rates) for multi-asset wallets so that more charitable proceeds are available for the needy.
                  </p>
                </div>
                <div className="bg-emerald-800 text-white font-extrabold p-2 rounded-lg text-center flex flex-col justify-center">
                  <span className="text-[10px]">LOCAL SIL NISAB</span>
                  <span className="text-xs">Rs. 145,000</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Inputs area (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-bold text-slate-800 text-xs uppercase block tracking-wider border-b border-slate-100 pb-1.5">
                    SPECIFY ASSET VALUES IN PKR (Held for full year)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Bank Savings accounts / deposits</label>
                      <input
                        id="zakat-bank-input"
                        type="number"
                        value={zSourceBank}
                        onChange={(e) => setZSourceBank(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Physical Cash (on hand/wallets)</label>
                      <input
                        id="zakat-cash-input"
                        type="number"
                        value={zSourceCash}
                        onChange={(e) => setZSourceCash(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Worth of Gold (per Tola/10g rates)</label>
                      <input
                        id="zakat-gold-input"
                        type="number"
                        value={zSourceGoldVal}
                        onChange={(e) => setZSourceGoldVal(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Worth of Silver owned</label>
                      <input
                        id="zakat-silver-input"
                        type="number"
                        value={zSourceSilverVal}
                        onChange={(e) => setZSourceSilverVal(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Stocks / Mutual Funds units</label>
                      <input
                        id="zakat-stocks-input"
                        type="number"
                        value={zSourceStocks}
                        onChange={(e) => setZSourceStocks(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Active business receivables</label>
                      <input
                        id="zakat-receivables-input"
                        type="number"
                        value={zSourceReceivables}
                        onChange={(e) => setZSourceReceivables(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-red-600 mb-1">Subtract Immediate liabilities / loans due</label>
                    <input
                      id="zakat-liability-input"
                      type="number"
                      value={zLiabilities}
                      onChange={(e) => setZLiabilities(parseFloat(e.target.value) || 0)}
                      className="w-full max-w-sm p-2.5 bg-red-50/40 border border-red-200 rounded-lg text-xs font-semibold text-red-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Calculation Outputs (5 cols) */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm block tracking-wide border-b border-slate-200 pb-2">
                      ZAKAT SUMMARY REPORT
                    </h3>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Gross assets owned value:</span>
                      <span className="font-bold text-slate-705">Rs. {zakatCalculations.totalAssets.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Subtract liabilities:</span>
                      <span className="font-bold text-red-650">- Rs. {zLiabilities.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border border-dashed border-slate-200">
                      <span className="text-slate-600 font-semibold text-[11px]">Calculated Net Assets</span>
                      <span className="font-extrabold text-slate-800">
                        Rs. {zakatCalculations.zakatableWealth.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Compare with Nisab limit:</span>
                      <span className={`font-bold pb-0.5 ${
                        zakatCalculations.meetsNisab ? 'text-emerald-700' : 'text-slate-600'
                      }`}>
                        {zakatCalculations.zakatableWealth >= nisabSilverThreshold ? 'Wealth exceeds Nisab ✓' : 'Below Nisab Limit ✕'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase block mb-1">QUALIFYING ANNUAL ZAKAT DUE (2.5%)</span>
                    <div className="bg-emerald-900 text-white rounded-xl p-4 text-center">
                      <span className="text-2xl font-extrabold font-sans block">
                        Rs. {Math.round(zakatCalculations.calculatedZakat).toLocaleString()}
                      </span>
                      <span className="text-[9.5px] text-emerald-250 italic">
                        {zakatCalculations.meetsNisab 
                          ? 'This amount must be paid out to certified Halal charities or families in need.'
                          : 'No Zakat mandatory as net assets are below Nisab threshold.'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 4: INVESTMENT SCHEMES AND SAVINGS PLANNING */}
        {activeTab === 'investments' && (
          <div className="space-y-6 animate-fadeIn" id="tab-investments-panel">
            
            {/* Interactive savings goals tracker */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-805 rounded-xl">
                  <TrendingUp className="h-5 w-5 font-bold" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Savings Goals Planner</h3>
                  <p className="text-xs text-slate-500">Plan and log future targets like Hajj, Umrah, or buying a car in Pakistan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left side: Add new savings goal (4 cols) */}
                <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 tracking-wider pb-1.5 border-b border-slate-200">
                    CREATE SAVINGS PLAN
                  </h4>

                  <form onSubmit={handleAddSavingsGoal} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">GOAL TITLE / EVENT</label>
                      <input
                        id="goal-title-input"
                        type="text"
                        value={newGoalTitle}
                        required
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        placeholder="e.g. Wedding Arrangements, Umrah"
                        className="w-full p-2 bg-white border border-slate-205 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">TARGET VALUE</label>
                        <input
                          id="goal-target-input"
                          type="number"
                          value={newGoalTarget}
                          required
                          onChange={(e) => setNewGoalTarget(e.target.value)}
                          placeholder="e.g. 500000"
                          className="w-full p-2 bg-white border border-slate-205 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">MONTHLY ALLOCATION</label>
                        <input
                          id="goal-deposit-input"
                          type="number"
                          value={newGoalDeposit}
                          onChange={(e) => setNewGoalDeposit(e.target.value)}
                          placeholder="e.g. 25000"
                          className="w-full p-2 bg-white border border-slate-205 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">CATEGORICAL CLASS</label>
                      <select
                        id="goal-category-select"
                        value={newGoalCat}
                        onChange={(e) => setNewGoalCat(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-205 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 text-slate-800"
                      >
                        <option value="Religious">Religious Obligation (Hajj / Umrah)</option>
                        <option value="Vehicle">Vehicle Acquisition</option>
                        <option value="Security">Emergency Reserves</option>
                        <option value="Wedding">Wedding Expense</option>
                        <option value="Investments">Direct Capital Investment</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      id="goal-submit-btn"
                      className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-extrabold cursor-pointer transition-colors"
                    >
                      Insert Savings Target
                    </button>
                  </form>
                </div>

                {/* Right side: Goals tracker listing (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  <h4 className="font-bold text-slate-850 text-xs uppercase tracking-wider">ACTIVE SAVINGS PIPELINES</h4>

                  <div className="space-y-4">
                    {savingsGoals.map((g) => {
                      const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                      return (
                        <div key={g.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                          <button
                            type="button"
                            id={`del-goal-${g.id}`}
                            onClick={() => handleDeleteGoal(g.id)}
                            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-2.5">
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">{g.title}</span>
                              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded tracking-wide inline-block mt-0.5 mt-1 font-sans">
                                {g.targetCategory}
                              </span>
                            </div>
                            <div className="text-left md:text-right pr-6">
                              <span className="text-xs font-bold text-slate-800 block">
                                Rs. {g.currentAmount.toLocaleString()} / Rs. {g.targetAmount.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Save Rs. <strong className="text-slate-800">{g.monthlyDeposit.toLocaleString()}</strong>/month for {g.monthsToGoal} months to clear.
                              </span>
                            </div>
                          </div>

                          {/* Beautiful Progress Track */}
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden block">
                            <div 
                              className="bg-gradient-to-r from-emerald-600 to-teal-700 h-full rounded-full transition-all" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] text-slate-500 font-medium">Accumulation pipeline:</span>
                            <span className="text-[10px] font-bold text-emerald-800">{percentage}% Tracked</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* Shariah-Screened (Halal) Investment listings */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6 border-b border-slate-105 pb-3">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight">Shariah-Screened & Halal Investment Options</h3>
                  <p className="text-xs text-slate-500">Regulated options to preserve and multiply wealth in Pakistan while avoiding Riba (interest)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {INVESTMENT_SCHEMES.map((sch) => (
                  <div key={sch.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase font-sans tracking-wide">{sch.category}</span>
                          <h4 className="font-extrabold text-sm text-slate-805 mt-0.5">{sch.name}</h4>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg shrink-0">
                          ~{sch.expectedReturnRate}% Return / yr
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed mb-4">
                        {sch.description}
                      </p>

                      <div className="space-y-1.5 p-3.5 bg-white border border-slate-100 rounded-xl text-[10.5px] shadow-2xs mb-4">
                        <div>
                          <span className="text-slate-400 font-medium block">TAX PENALTY AS FILER:</span>
                          <span className="text-slate-800 font-semibold">{sch.taxTreatmentFiler}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-slate-400 font-medium block">TAX PENALTY AS NON-FILER:</span>
                          <span className="text-rose-700 font-bold">{sch.taxTreatmentNonFiler}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10.5px] border-t border-slate-150 pt-3">
                      <div>
                        <span className="text-slate-400 block font-medium">Minimum Start:</span>
                        <strong className="text-slate-700">Rs. {sch.minimumInvestment.toLocaleString()}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-450 block font-medium">Shariah Certified:</span>
                        <span className="text-emerald-700 font-bold">{sch.shariahAdvisor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: AI COACH RUPEEWISE BOT */}
        {activeTab === 'advisor' && (
          <div className="max-w-4xl mx-auto animate-fadeIn" id="tab-advisor-panel">
            <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 flex flex-col md:flex-row items-center justify-between text-xs gap-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">🕌</span>
                <p className="text-slate-600">
                  RupeeWise is loaded with **FBR Tax Slabs FY25**, **Halal certified mutual funds**, and classical **Zakat guidelines** to assist you relative to your current budget profile.
                </p>
              </div>
            </div>
            <AIChatBot 
              userProfile={{
                salary: salaryProfile,
                taxStatus,
                majorGoal,
                riskPref,
                banks: ['Meezan Bank', 'SadaPay', 'Cash']
              }} 
            />
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-200 mt-16 py-8" id="footer-summary">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2 text-xs text-slate-500">
          <p className="font-semibold text-slate-755 leading-tight">
            PK Expense & Investment Planner • Realized for localized Pakistani banking and wealth preservation rules
          </p>
          <p className="font-light">
            Calculators are designed as helpful simulators on historical tax codes and generic Islamic Nisab limits. Please consult the FBR IRS portal or qualified advisors before making physical equity/tax transactions.
          </p>
        </div>
      </footer>

      {/* Touch-Friendly Floating Action Button (FAB) for Mobile + Desktop */}
      <button
        type="button"
        id="fab-add-transaction"
        onClick={() => setIsTxModalOpen(true)}
        title="Add transaction manually"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-full p-4 md:px-5 md:py-3.5 shadow-2xl flex items-center justify-center space-x-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer hover:ring-3 hover:ring-emerald-500/25 border-0 focus:outline-none"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span className="hidden md:inline text-xs font-bold font-sans tracking-wide">Add Transaction</span>
      </button>

      {/* Beautiful Backdrop Blur Overlay & Manual Transaction Input Modal */}
      {isTxModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
          style={{ animationDuration: '200ms' }}
          id="manual-tx-modal-overlay"
          onClick={() => setIsTxModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 bg-emerald-800/55 rounded-xl">
                  <Plus className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Add Transaction Manually</h3>
                  <p className="text-[10px] text-emerald-250 italic">Record cash spending, chai-water, fuel, or salaries</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTxModalOpen(false)}
                className="p-1 px-2 text-[11px] font-extrabold uppercase bg-emerald-950/40 hover:bg-emerald-950/70 transition-colors text-emerald-200 hover:text-white rounded-lg cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleManualTxSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              
              {/* Transaction Inflow / Outflow Row */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">TRANSACTION FLAG</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`text-center py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      txType === 'expense' 
                        ? 'bg-white text-rose-800 shadow-xs ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    🔻 Outflow (Expense)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`text-center py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      txType === 'income' 
                        ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    🔼 Inflow (Income)
                  </button>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1 bg-white">DATE OF RECORD</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-slate-800 font-medium"
                />
              </div>

              {/* Amount input block with Local PKR Indicator */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">PKR VALUE (RUPEES)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[11px] font-bold text-slate-400 font-sans">Rs.</span>
                  <input
                    type="number"
                    value={txAmount}
                    required
                    min="1"
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Destination/Source Account Type */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1">ACCOUNT / WALLET</label>
                <select
                  value={txAccount}
                  onChange={(e) => setTxAccount(e.target.value as AccountType)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-slate-800 font-semibold"
                >
                  <option value="Cash">Physical Cash Wallet</option>
                  <option value="Meezan Bank">Meezan Bank Ltd (Shariah Account)</option>
                  <option value="HBL">HBL Account</option>
                  <option value="SadaPay">SadaPay Wallet</option>
                  <option value="NayaPay">NayaPay Wallet</option>
                  <option value="EasyPaisa">EasyPaisa (Mobile Wallet)</option>
                </select>
              </div>

              {/* Categorical tag */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1">BUDGET CATEGORY</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-slate-800 font-semibold"
                >
                  {categoriesList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description summary */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1">DESCRIPTION BRIEF</label>
                <input
                  type="text"
                  value={txDesc}
                  required
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="e.g. Metro ride, Office Samosa/Chai"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-slate-800"
                />
              </div>

              {/* Submission Submit Trigger */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-800 to-teal-805 hover:from-emerald-900 hover:to-teal-900 text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 active:scale-98"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Log Verified Transaction</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {isEditModalOpen && editingTx && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => { setIsEditModalOpen(false); setEditingTx(null); }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-800/55 rounded-xl">
                  <Pencil className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Edit Transaction</h3>
                  <p className="text-[10px] text-blue-200 italic">Update the details and save</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsEditModalOpen(false); setEditingTx(null); }}
                className="p-1 px-2 text-[11px] font-extrabold uppercase bg-blue-950/40 hover:bg-blue-950/70 text-blue-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {/* Type */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">TRANSACTION TYPE</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl">
                  <button type="button" onClick={() => setEditingTx({...editingTx, type: 'expense'})}
                    className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${editingTx.type === 'expense' ? 'bg-white text-rose-800 shadow-xs ring-1 ring-slate-200' : 'text-slate-500'}`}>
                    🔻 Outflow (Expense)
                  </button>
                  <button type="button" onClick={() => setEditingTx({...editingTx, type: 'income'})}
                    className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${editingTx.type === 'income' ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200' : 'text-slate-500'}`}>
                    🔼 Inflow (Income)
                  </button>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1">DATE</label>
                <input type="date" value={editingTx.date}
                  onChange={(e) => setEditingTx({...editingTx, date: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-800 font-medium" />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1">PKR AMOUNT</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[11px] font-bold text-slate-400">Rs.</span>
                  <input type="number" required min="1"
                    value={editingTx.amount}
                    onChange={(e) => setEditingTx({...editingTx, amount: parseFloat(e.target.value) || 0})}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-800" />
                </div>
              </div>

              {/* Account */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1">ACCOUNT / WALLET</label>
                <select value={editingTx.accountType}
                  onChange={(e) => setEditingTx({...editingTx, accountType: e.target.value as AccountType})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-800 font-semibold">
                  <option value="Cash">Physical Cash Wallet</option>
                  <option value="Meezan Bank">Meezan Bank Ltd</option>
                  <option value="HBL">HBL Account</option>
                  <option value="SadaPay">SadaPay Wallet</option>
                  <option value="NayaPay">NayaPay Wallet</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1">CATEGORY</label>
                <select value={editingTx.category}
                  onChange={(e) => setEditingTx({...editingTx, category: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-800 font-semibold">
                  {categoriesList.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest mb-1">DESCRIPTION</label>
                <input type="text" required value={editingTx.description}
                  onChange={(e) => setEditingTx({...editingTx, description: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-slate-800" />
              </div>

              <div className="pt-2">
                <button type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-900 hover:to-blue-800 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer flex items-center justify-center space-x-2 active:scale-98">
                  <CheckCircle className="h-4 w-4 stroke-[2.5]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

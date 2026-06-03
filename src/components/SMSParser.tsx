import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Transaction, SMSParseResult, AccountType } from '../types.ts';

interface SMSParserProps {
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

const TEMPLATE_SMS = [
  {
    label: "Meezan POS Spend (J.)",
    bank: "Meezan Bank",
    text: "Meezan Bank: Your account 0201******921 has been debited with PKR 4,500.00 for POS transaction at J. Junaid Jamshed on 02-Jun-2026 18:30."
  },
  {
    label: "SadaPay Cafe spend (Gloria Jean's)",
    bank: "SadaPay",
    text: "Spent Rs. 1,250.00 at Gloria Jean's Coffees with your SadaPay Card. Ref: 228392"
  },
  {
    label: "EasyPaisa Income Transfer",
    bank: "EasyPaisa",
    text: "EasyPaisa: You have received Rs. 5,000.00 from KHALID MEHMOOD (Transfer). Your new EasyPaisa balance is Rs. 18,340.00."
  },
  {
    label: "HBL Bill Payment (K-Electric)",
    bank: "HBL",
    text: "HBL info: Debit transaction of PKR 12,300.00 on Acct ending 4402 on 01-06-2026 for K-ELECTRIC Web Payment. Ref: KE3391"
  },
  {
    label: "Alfalah Fuel Station spend",
    bank: "Bank Alfalah",
    text: "Alfalah Alert: Rs 3,400.00 debited from Acct *3312 at Total Parco Fuel Station on 02/06/2026 14:15."
  }
];

export default function SMSParser({ onAddTransaction }: SMSParserProps) {
  const [smsInput, setSmsInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<SMSParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleParse = async (textToParse: string) => {
    const activeText = textToParse || smsInput;
    if (!activeText.trim()) {
      setError("Please paste a valid bank SMS transaction text or click one of the templates above.");
      return;
    }

    setParsing(true);
    setError(null);
    setParsedResult(null);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/parse-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsText: activeText })
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const result: SMSParseResult = await response.json();
      setParsedResult(result);
    } catch (err: any) {
      setError("AI parsing failed. Please try again or use the offline fallback. " + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleLoadTemplate = (text: string) => {
    setSmsInput(text);
    setError(null);
    setParsedResult(null);
    setStatusMessage(null);
    // Instant parse for immediate feedback
    handleParse(text);
  };

  const handleAddParsedToLedger = () => {
    if (!parsedResult || parsedResult.amount === null) return;

    onAddTransaction({
      amount: parsedResult.amount,
      description: parsedResult.merchant || "Bank Transaction",
      type: parsedResult.transactionType || 'expense',
      category: parsedResult.category || 'Others',
      date: new Date().toISOString().split('T')[0],
      accountType: parsedResult.bankName as AccountType || 'Cash',
      isSimulated: true
    });

    setStatusMessage(`Successfully imported Rs. ${parsedResult.amount.toLocaleString()} for ${parsedResult.merchant}!`);
    // Clear inputs after successful submission
    setSmsInput('');
    setParsedResult(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 text-lg">RupeeWise Bank SMS Parser</h2>
          <p className="text-xs text-slate-500">Instant transactions tracking relative to cash-flows in Pakistan</p>
        </div>
      </div>

      <div className="mb-5">
        <span className="text-xs font-semibold text-slate-600 block mb-2">TRY POPULAR PK BANK SMS TEMPLATES</span>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_SMS.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              id={`sms-temp-btn-${idx}`}
              onClick={() => handleLoadTemplate(tmpl.text)}
              className="text-xs px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-700 rounded-full transition-colors font-medium cursor-pointer"
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-705 mb-1.5">
            PASTE TRANSACTION SMS TEXT HERE
          </label>
          <textarea
            id="sms-textarea-input"
            value={smsInput}
            onChange={(e) => setSmsInput(e.target.value)}
            placeholder="Paste raw SMS text received from Meezan Bank, SadaPay, HBL, Bank Alfalah, NayaPay, or EasyPaisa..."
            className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 font-mono resize-none transition-all"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            id="clear-sms-btn"
            onClick={() => { setSmsInput(''); setParsedResult(null); setError(null); }}
            className="text-xs flex items-center space-x-1 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>

          <button
            id="parse-sms-submit-btn"
            onClick={() => handleParse('')}
            disabled={parsing || !smsInput.trim()}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center space-x-2 shadow-sm ${
              parsing || !smsInput.trim()
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-700 to-teal-800 hover:opacity-95'
            }`}
          >
            {parsing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing SMS...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Parse SMS using AI</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-805 text-xs flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {parsedResult && (
          <div className="bg-slate-50 border border-slate-200/65 rounded-xl p-4 mt-3">
            <div className="flex justify-between items-center border-b border-slate-200/65 pb-2 mb-3">
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-emerald-600" /> Parsed Details
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                parsedResult.transactionType === 'debit' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {parsedResult.transactionType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <span className="text-[10px] text-slate-500 block">TRANSACTION AMOUNT</span>
                <span className="text-base font-bold text-slate-800 font-sans">
                  Rs. {parsedResult.amount !== null ? parsedResult.amount.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">SOURCE / WALLET</span>
                <span className="text-sm font-semibold text-slate-805">
                  {parsedResult.bankName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">RECIPIENT / MERCHANT</span>
                <span className="text-sm font-semibold text-slate-805">
                  {parsedResult.merchant || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">SUGGESTED CATEGORY</span>
                <span className="text-sm font-semibold text-slate-850">
                  {parsedResult.category}
                </span>
              </div>
            </div>

            {parsedResult.notes && (
              <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100 mb-3 block">
                {parsedResult.notes}
              </p>
            )}

            {parsedResult.amount !== null && (
              <button
                type="button"
                id="apply-to-ledger-btn"
                onClick={handleAddParsedToLedger}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verify & Add transaction to Ledger</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

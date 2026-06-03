import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ----------------------------------------------------------------------------
// Local Regex Backup SMS Parser for Pakistani Banks
// ----------------------------------------------------------------------------
function parseSMSRegex(smsText: string): any {
  const text = smsText.toLowerCase();
  let amount: number | null = null;
  let transactionType: 'debit' | 'credit' | null = null;
  let bankName: string = 'Unknown';
  let merchant = 'Unknown Merchant';
  let category = 'Others';
  let notes = 'Parsed locally using smart heuristic rules.';

  // Determine Bank
  if (text.includes('meezan')) {
    bankName = 'Meezan Bank';
  } else if (text.includes('hbl') || text.includes('habib bank')) {
    bankName = 'HBL';
  } else if (text.includes('sadapay')) {
    bankName = 'SadaPay';
  } else if (text.includes('nayapay')) {
    bankName = 'NayaPay';
  } else if (text.includes('alfalah')) {
    bankName = 'Bank Alfalah';
  } else if (text.includes('easypaisa')) {
    bankName = 'EasyPaisa';
  }

  // Detect amounts (look for Rs. or PKR followed by number)
  // Matching Rs. 1,500.00 or Rs 1500 or PKR 1,200.50
  const amountRegex = /(?:rs\.?|pkr)\s*([\d,]+(?:\.\d{2})?)/i;
  const matchAmount = smsText.match(amountRegex);
  if (matchAmount) {
    amount = parseFloat(matchAmount[1].replace(/,/g, ''));
  }

  // Detect Transaction Type
  if (text.includes('debited') || text.includes('spent') || text.includes('sent') || text.includes('withdrawn') || text.includes('paid')) {
    transactionType = 'debit';
  } else if (text.includes('credited') || text.includes('received') || text.includes('deposited') || text.includes('added')) {
    transactionType = 'credit';
  }

  // Find Merchant/Recipient details
  // e.g. "at NETFLIX", "for Biryani", "Transfer to Ali"
  if (text.includes('spent at')) {
    const parts = smsText.split(/spent at/i);
    if (parts[1]) merchant = parts[1].split(/[.at]/)[0].trim();
  } else if (text.includes('for transfer to')) {
    const parts = smsText.split(/for transfer to/i);
    if (parts[1]) merchant = parts[1].split(/[.at]/)[0].trim();
  } else if (text.includes('paid to')) {
    const parts = smsText.split(/paid to/i);
    if (parts[1]) merchant = parts[1].split(/[.at]/)[0].trim();
  } else if (text.includes('received from')) {
    const parts = smsText.split(/received from/i);
    if (parts[1]) merchant = parts[1].split(/[.at]/)[0].trim();
  } else if (text.includes('at')) {
    const parts = smsText.split(/at/i);
    if (parts[1]) merchant = parts[1].slice(0, 20).trim();
  }

  // Categories fallback mapping based on merchant keywords
  const merchantL = merchant.toLowerCase();
  if (merchantL.includes('netflix') || merchantL.includes('spotify') || merchantL.includes('steam')) {
    category = 'Entertainment';
  } else if (merchantL.includes('dhaba') || merchantL.includes('biryani') || merchantL.includes('foodpanda') || merchantL.includes('restaurant') || merchantL.includes('chai')) {
    category = 'Food & Chai';
  } else if (merchantL.includes('k-electric') || merchantL.includes('utility') || merchantL.includes('ptcl') || merchantL.includes('sui gas') || merchantL.includes('bills')) {
    category = 'Bills & Utilities';
  } else if (merchantL.includes('careem') || merchantL.includes('indrive') || merchantL.includes('yango') || merchantL.includes('petrol') || merchantL.includes('fuel')) {
    category = 'Fuel & Transport';
  } else if (merchantL.includes('mobile') || merchantL.includes('easyload') || merchantL.includes('jazz') || merchantL.includes('telenor') || merchantL.includes('zong')) {
    category = 'Mobile Recharge';
  }

  return {
    amount,
    transactionType,
    bankName,
    merchant: merchant !== 'Unknown Merchant' ? merchant : 'General Merchant',
    category,
    parsedSuccessfully: amount !== null,
    notes
  };
}

// ----------------------------------------------------------------------------
// POST: /api/parse-sms
// ----------------------------------------------------------------------------
app.post("/api/parse-sms", async (req, res) => {
  const { smsText } = req.body;
  if (!smsText || typeof smsText !== "string") {
    res.status(400).json({ error: "SMS text string is required." });
    return;
  }

  const client = getAIClient();
  if (!client) {
    // Graceful fallback if no Gemini client available
    const regexParsed = parseSMSRegex(smsText);
    res.json({
      ...regexParsed,
      notes: "Parsed via local heuristic engine (No API Secret key set)."
    });
    return;
  }

  try {
    const prompt = `
You are an expert Pakistani banking SMS transaction parser.
Your task is to take standard SMS notifications dispatched by Pakistani financial institutions (like Meezan Bank, SadaPay, HBL, Bank Alfalah, National Bank, NayaPay, EasyPaisa, JazzCash, etc.) and extract transaction details into variables.

The bank can be any of the local Pakistani options: "Cash", "Meezan Bank", "HBL", "SadaPay", "NayaPay", "Bank Alfalah", "EasyPaisa", or "Other".
The transaction type must be either "debit" (money spent, paid, or sent out) or "credit" (money received, earned, or deposited in).

Suggest an appropriate personal finance category out of these standard Pakistani budget categories:
- "Food & Chai" (Dhabas, Biryani, Foodpanda, Groceries, Dining out)
- "Fuel & Transport" (Petrol pumps, Careem, InDrive, Yango, Bike fuel)
- "Bills & Utilities" (K-Electric, Sui Gas, PTCL, Water bills, Internet)
- "Mobile Recharge" (Easyload, Jazz / Telenor / Zong / Ufone internet packages)
- "Shopping" (Centaurus Mall, Daraz, Emporium Mall, local markets, clothing)
- "Entertainment & Services" (Netflix subscriptions, gaming, cinemas)
- "Zakat & Donations" (Zakat, Sadqah, charity given to Edhi, Chhipa, Indus Hospital, etc.)
- "Salary & Investments" (Monthly paycheck, mutual fund profits, freelance earnings)
- "Rent & Home" (House rent, maid salary, maintenance)
- "Medical & Health" (Clinic fees, hospital visit, pharmacy medicines)
- "Others" (Default)

Return strict JSON formatting matching the requested response schema.

SMS MESSAGE CODE TO PARSE:
"${smsText}"
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: {
              type: Type.NUMBER,
              description: "The parsed transaction amount in Pakistani Rupees numeric float (PKR / Rs.). Must be a positive number e.g. 1500.25",
            },
            transactionType: {
              type: Type.STRING,
              description: "Must be either 'debit' or 'credit'",
            },
            bankName: {
              type: Type.STRING,
              description: "The name of the bank or wallet: 'Meezan Bank', 'HBL', 'SadaPay', 'NayaPay', 'Bank Alfalah', 'EasyPaisa', or 'Unknown'"
            },
            merchant: {
              type: Type.STRING,
              description: "The merchant, shop, person, or organization involved, e.g. 'K-Electric', 'Daraz', 'Edhi Foundation', 'Habib Metro Petrol Pump', or 'Friend Transfer'"
            },
            category: {
              type: Type.STRING,
              description: "Categorize appropriately based on the allowed list only"
            },
            notes: {
              type: Type.STRING,
              description: "A short, helpful summary explaining the transaction in Pakistani context, e.g. 'Biryani order parsed successfully from your SadaPay swipe.'"
            }
          },
          required: ["amount", "transactionType", "bankName", "merchant", "category"]
        },
      },
    });

    const parsedJsonText = response.text?.trim() || "{}";
    const data = JSON.parse(parsedJsonText);
    res.json({
      ...data,
      parsedSuccessfully: true
    });
  } catch (err: any) {
    console.error("Gemini SMS parsing failed, falling back to local engine:", err);
    const regexParsed = parseSMSRegex(smsText);
    res.json({
      ...regexParsed,
      notes: "Parsed using backup regex engine due to system error: " + err.message
    });
  }
});

// ----------------------------------------------------------------------------
// POST: /api/advisor
// ----------------------------------------------------------------------------
app.post("/api/advisor", async (req, res) => {
  const { messages, userProfile } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Invalid layout formats. List of messages expected." });
    return;
  }

  const client = getAIClient();
  const profileSummary = userProfile 
    ? `User Profile Context in Pakistan:
- Monthly Income: PKR ${userProfile.salary || 'N/A'}
- Tax Code Profile: ${userProfile.taxStatus || 'Filer'} (${userProfile.taxStatus === 'filer' ? 'Lower withholding taxes in Pakistan' : 'Filer penalty withholds, high tax rates on transactions/investments'})
- Major Savings Goal: ${userProfile.majorGoal || 'General Savings'}
- Primary Banking: ${userProfile.banks ? userProfile.banks.join(", ") : 'Cash/Meezan Bank'}
- Preferred Risk Category: ${userProfile.riskPref || 'Medium'}`
    : "No profile specified yet. Answer assuming standard Pakistani middle/upper-middle class guidelines.";

  const systemInstruction = `
You are "RupeeWise", an elite personal finance and halal investment coach designed specifically for the Pakistani context.
You advise users on managing money, handling budgets, and planning safe, halal investments in Pakistan.

Your knowledge includes:
1. TAX LAWS (Filer vs Non-Filer status in Pakistan):
   - Filers pay lower tax rates on capital gains, mutual funds, banks profit, and real estate purchases.
   - Non-filers pay heavy penal taxation (up to 30%+ withholding on bank withdraws, doubled duty on car and plot registerings, higher tax on dividends). Highly encourage becoming a Tax Filer through the FBR IRIS portal if they earn taxable income.
2. LOCAL HALAL INVESTMENT VEHICLES:
   - Al-Meezan Investments, UBL Al-Ameen, Mahana Funds (halal open-end mutual funds regulated by SECP).
   - National Savings Schemes (NSS): Behbood Savings Certificates (highly profitable for widows, seniors, and disabled), Sarwa Islamic Savings Account (SISA).
   - Gold investments: local rate tracks SARAF / ARY rates per Tola or 10 grams. Safe hedge against PKR inflation.
   - Pakistan Stock Exchange (PSX): KSE-100 index companies, Meezan Islamic Index (KMI-30) for Shariah-compliant equities.
   - SadaPay/NayaPay and digital savings wallets (some offer daily halal profit, e.g. SadaBiz, or mutual fund integrations).
3. CURRENCY: Always speak in Pakistani Rupees (Rs. or PKR).
4. CULTURAL VIBE:
   - Use simple English mixed with high-quality localized terms e.g. "Chai-Pani expenses", "FBR Filer status", "Mahana (monthly) savings", "committee/bishi" (informal saving circles), "Lakhs & Crores" instead of hundreds of thousands/millions.
   - Be respectful, extremely realistic, and warm. Provide distinct structured bulleted guidance.

Keep answers concise (maximum 3 paragraphs or structural bullets) so it reads gorgeously in a chat panel.
  `;

  if (!client) {
    // Generate a beautiful, realistic fallback locally
    const lastUserQuery = messages[messages.length - 1]?.content || "";
    let mockResponse = `As your RupeeWise advisor, I'd love to help you with that! (Using offline backup advice model). 

**Quick Pakistan Personal Finance Takeaways:**
1. **Tax Filer Strategy:** Ensure you are registered as an **FBR Tax Filer**. In Pakistan, Non-Filers face double withholding taxes on bank withdrawals, dividend income (30% vs 15% for Filers), and mutual fund profits.
2. **Beat PKR Inflation:** Since inflation can erode paper cash value, consider shifting liquid savings into modern Shariah-Compliant open-ended mutual funds (e.g., Al Meezan, UBL Fund Managers, or NBP Funds) which offer 15-20% annualized yields with direct withdrawal access.
3. **Gold and PSX Option:** You can accumulate physical or digital Gold (per Tola) as a hedge, or purchase blue-chip Shariah-compliant dividend paying stocks on the Pakistan Stock Exchange (PSX) using a certified CDC sub-account.

*Let me know if you would like me to specialize on any of these topics like Zakat calculation (2.5% of unused assets held for a lunar year) or monthly expense budgeting!*`;

    res.json({
      role: "model",
      content: mockResponse
    });
    return;
  }

  try {
    const lastMsg = messages[messages.length - 1];
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: `${systemInstruction}\n\n${profileSummary}\n\nUser Question: ${lastMsg.content}` }
      ],
      config: {
        temperature: 0.7,
      }
    });

    const reply = response.text || "I apologize, I'm having trouble formulating advice right now. Please try again in a bit!";
    res.json({
      role: "model",
      content: reply
    });
  } catch (err: any) {
    console.error("Gemini Advisor call failed, using fallback advice:", err);
    res.json({
      role: "model",
      content: `I'm having a brief connection issue with the main advisor brain. However, as your local PK finance coach: Always prioritize becoming an FBR Filer to save on withholding taxes, look into mutual funds (like Al Meezan or Sarwa Account) for halal passive returns, and keep some reserves in Gold/PKR Cash for monthly grocery & chai-pani essentials!`
    });
  }
});

// ----------------------------------------------------------------------------
// Serve static client bundle or mount Vite dev middleware
// ----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in Development Mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in Production Mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PK Expense Tracker backend listening on http://localhost:${PORT}`);
  });
}

startServer();

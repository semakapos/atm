
import { GoogleGenAI } from "@google/genai";
import { ReconcileRecord, Machine } from "../types";

const getAIClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const analyzeFinancials = async (
  records: ReconcileRecord[],
  machines: Machine[]
): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Filter for last 30 days to keep context manageable
    const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50);

    // Map machine names to IDs for the AI
    const machineMap = machines.reduce((acc, m) => {
      acc[m.id] = `${m.name} (${m.bankName})`;
      return acc;
    }, {} as Record<string, string>);

    const dataSummary = sortedRecords.map(r => ({
        date: r.date,
        machine: machineMap[r.machineId] || 'Unknown Machine',
        machine_report: {
          mada: r.mada,
          visa: r.visa,
          master: r.mastercard,
          gcc: r.gcc,
          total: r.machineTotal
        },
        bank_credit: {
          mada: r.bankMada,
          visa: r.bankVisa,
          master: r.bankMastercard,
          gcc: r.bankGcc,
          total: r.bankCredit
        },
        diff: r.difference,
        notes: r.notes
    }));

    const prompt = `
      You are a financial reconciliation expert for card terminals. 
      
      I will provide you with a JSON summary of daily machine reconciliations.
      Each record contains a "machine_report" (what the machine printed) and a "bank_credit" (what was actually received in the bank).
      
      Important Formula: Difference = Bank Credit - Machine Report.
      - A NEGATIVE difference means a SHORTAGE (Bank received less than Machine reported).
      - A POSITIVE difference means a SURPLUS (Bank received more).
      
      Your goal is to:
      1. Identify suspicious patterns (e.g., recurring shortages, large discrepancies).
      2. Analyze specific card type failures. For example, check if Mada is correct but Visa is short, or if Bank Visa is higher than Machine Visa.
      3. Summarize total net balance.
      4. Provide actionable advice based on which specific card network is causing issues.
      5. Format the output in Markdown (bullet points, bold text).
      
      Data:
      \`\`\`json
      ${JSON.stringify(dataSummary, null, 2)}
      \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No analysis could be generated at this time.";
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return "Unable to generate AI analysis. Please check your API configuration.";
  }
};

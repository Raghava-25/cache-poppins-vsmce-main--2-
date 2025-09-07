export type RegistrationPayload = {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  rollNo: string;
  section: string;
  selectedEvents: string[];
  totalAmount: number;
  transactionRef: string;
  paidAtIso?: string;
};

export async function postRegistrationToSheets(payload: RegistrationPayload): Promise<Response> {
  const endpoint = (import.meta as any).env?.VITE_SHEETS_WEBHOOK_URL;
  if (!endpoint) throw new Error("Missing VITE_SHEETS_WEBHOOK_URL env var");
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    // Avoid caching issues on Apps Script
    cache: 'no-store',
  });
}



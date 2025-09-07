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
  upiTxnId?: string;
};

export async function postRegistrationToSheets(payload: RegistrationPayload): Promise<Response> {
  const endpoint = (import.meta as any).env?.VITE_SHEETS_WEBHOOK_URL;
  if (!endpoint) throw new Error("Missing VITE_SHEETS_WEBHOOK_URL env var");

  console.log("Using endpoint:", endpoint);

  // Use GET request with URL parameters to avoid CORS issues
  const params = new URLSearchParams({
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    college: payload.college,
    rollNo: payload.rollNo,
    section: payload.section,
    selectedEvents: payload.selectedEvents.join(','),
    totalAmount: payload.totalAmount.toString(),
    transactionRef: payload.transactionRef,
    paidAtIso: payload.paidAtIso || '',
    upiTxnId: payload.upiTxnId || '',
  });

  const url = `${endpoint}?${params.toString()}`;
  console.log("Full URL being used:", url);

  // Use iframe method to bypass CORS
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;

    iframe.onload = () => {
      document.body.removeChild(iframe);
      // Create a mock response since we can't get the actual response
      resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    };

    iframe.onerror = () => {
      document.body.removeChild(iframe);
      reject(new Error('Failed to submit to Google Sheets'));
    };

    document.body.appendChild(iframe);

    // Fallback timeout
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
        resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      }
    }, 5000);
  });
}



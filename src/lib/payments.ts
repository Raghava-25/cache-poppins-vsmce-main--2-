export type UpiIntentParams = {
  payeeVpa: string; // pa
  payeeName: string; // pn
  amount: number; // am
  transactionNote: string; // tn
  transactionRef: string; // tr
  currency?: 'INR'; // cu
};

export function buildUpiIntentUrl(params: UpiIntentParams): string {
  const { payeeVpa, payeeName, amount, transactionNote, transactionRef, currency = 'INR' } = params;
  const query = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: amount.toFixed(2),
    tn: transactionNote,
    tr: transactionRef,
    cu: currency,
  });
  // Generic UPI intent. Google Pay supports upi://pay and tez://upi/pay
  return `upi://pay?${query.toString()}`;
}

export function buildGPayIntentUrl(params: UpiIntentParams): string {
  const base = buildUpiIntentUrl(params);
  // Some devices prefer the tez:// scheme for GPay
  return base.replace('upi://pay', 'tez://upi/pay');
}

export function buildPhonePeIntentUrl(params: UpiIntentParams): string {
  const { payeeVpa, payeeName, amount, transactionNote, transactionRef, currency = 'INR' } = params;
  const query = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: amount.toFixed(2),
    tn: transactionNote,
    tr: transactionRef,
    cu: currency,
  });
  // PhonePe uses the standard UPI scheme
  return `upi://pay?${query.toString()}`;
}

export function buildPaytmIntentUrl(params: UpiIntentParams): string {
  const { payeeVpa, payeeName, amount, transactionNote, transactionRef, currency = 'INR' } = params;
  const query = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: amount.toFixed(2),
    tn: transactionNote,
    tr: transactionRef,
    cu: currency,
  });
  return `paytmmp://pay?${query.toString()}`;
}

export function buildBhimIntentUrl(params: UpiIntentParams): string {
  const { payeeVpa, payeeName, amount, transactionNote, transactionRef, currency = 'INR' } = params;
  const query = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: amount.toFixed(2),
    tn: transactionNote,
    tr: transactionRef,
    cu: currency,
  });
  return `bhim://pay?${query.toString()}`;
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor;
  return /iphone|ipad|ipod/i.test(ua);
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor;
  return /android/i.test(ua);
}

export function isLikelyMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor;
  return /android|iphone|ipad|ipod/i.test(ua);
}

export function generateTransactionRef(prefix = 'CACHE'): string {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}



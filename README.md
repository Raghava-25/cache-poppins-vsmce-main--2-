# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/19ff58a5-9823-4bb0-bb8a-d483c3fc34de

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/19ff58a5-9823-4bb0-bb8a-d483c3fc34de) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Payments + Google Sheets Setup

Add a simple UPI payment flow with Google Pay and store successful registrations in Google Sheets.

### Environment variables

Create a `.env` (or `.env.local`) in the project root:

```
VITE_UPI_VPA=your-vpa@okbank
VITE_UPI_NAME=Your Payee Name
VITE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Notes:
- `VITE_UPI_VPA`: The UPI VPA that receives payments.
- `VITE_UPI_NAME`: Display name for the payee in UPI apps.
- `VITE_SHEETS_WEBHOOK_URL`: Google Apps Script Web App URL (see below).

Restart the dev server after changing env vars.

### Google Apps Script (Sheets)

1. Create a new Google Sheet with a first row containing headers like:
   `timestamp, fullName, email, phone, college, rollNo, section, selectedEvents, totalAmount, transactionRef, paidAtIso, upiTxnId, ticketDownloadTime`
   
   Note: All timestamps (paidAtIso, ticketDownloadTime) are automatically converted to Indian Standard Time (IST) format.
2. Open Extensions → Apps Script and paste the following minimal script:

```javascript
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0];
  const data = JSON.parse(e.postData.contents);

  // Find column indexes by header
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  function col(name) { return headers.indexOf(name) + 1; }

  // Ensure headers exist (run once)
  const required = [
    'timestamp','fullName','email','phone','college','rollNo','section',
    'selectedEvents','totalAmount','transactionRef','paidAtIso','upiTxnId','ticketDownloadTime','screenshotBase64','dupFlag'
  ];
  if (!headers || headers.length === 0 || required.some(h => headers.indexOf(h) === -1)) {
    sheet.getRange(1,1,1,required.length).setValues([required]);
  }

  // Check duplicate UPI Txn ID
  let dupFlag = '';
  if (data.upiTxnId) {
    const upiCol = col('upiTxnId');
    const txns = sheet.getRange(2, upiCol, Math.max(sheet.getLastRow()-1,0), 1).getValues().flat();
    if (txns.includes(data.upiTxnId)) dupFlag = 'Duplicate/Fraud';
  }

  const row = [
    new Date(),
    data.fullName,
    data.email,
    data.phone,
    data.college,
    data.rollNo,
    data.section,
    (data.selectedEvents || []).join(','),
    data.totalAmount,
    data.transactionRef,
    data.paidAtIso || '',
    data.upiTxnId || '',
    data.ticketDownloadTime || '',
    data.screenshotBase64 || '',
    dupFlag
  ];
  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({ ok: true, dupFlag }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → New deployment → Select type “Web app”.
   - Execute as: Me
   - Who has access: Anyone with the link
   - Copy the Web App URL and set it to `VITE_SHEETS_WEBHOOK_URL`.

### App flow

- On Registration, selecting events computes the total.
- Clicking “Pay with Google Pay (UPI)” opens a UPI intent (tez:// / upi://). On desktop it opens in a new tab; on mobile it launches the app if installed.
- After paying, click “I have completed the payment” to submit participant details to Google Sheets using the Apps Script URL.

Files involved:
- `src/lib/payments.ts`: builds UPI intent URLs and helpers.
- `src/lib/sheets.ts`: posts JSON to Apps Script endpoint.
- `src/pages/Registration.tsx`: integrates the payment + submission flow.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/19ff58a5-9823-4bb0-bb8a-d483c3fc34de) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

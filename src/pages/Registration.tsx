import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { buildUpiIntentUrl, generateTransactionRef } from "@/lib/payments";
import { postRegistrationToSheets, checkUtrExists } from "@/lib/sheets";
import { generateReceiptPDF, ReceiptData } from "@/lib/pdf-receipt";
import Footer from "@/components/Footer";
import qrStatic from "@/pages/1343c33b-2a08-4fc1-8540-ccf73c77131b.jpg";

const events = {
  technical: [
    { id: 'web-dev', name: 'Web Development Challenge', price: 200 },
    { id: 'poster', name: 'Poster Presentation', price: 100 },
    { id: 'tech-expo', name: 'Tech Expo', price: 300 },
    { id: 'pymaster', name: 'PyMaster Contest', price: 150 },
    { id: 'tech-quiz', name: 'Technical Quiz', price: 100 },
  ],
  nonTechnical: [
    { id: 'photography', name: 'Photography Contest', price: 150 },
    { id: 'free-fire', name: 'Free Fire Esports Championship', price: 200 },
    { id: 'drawing', name: 'Live Drawing', price: 100 },
    { id: 'bgmi', name: 'BGMI Esports Tournament', price: 100 },
    { id: 'meme-contest', name: 'Tech Meme Contest', price: 50 },
  ],
};

const Registration = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    rollNo: '',
    section: '',
  });
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [upiTxnId, setUpiTxnId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isOcrChecking, setIsOcrChecking] = useState(false);
  const [proofInputKey, setProofInputKey] = useState(0);

  // Pre-select event from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eventParam = searchParams.get('event');
    if (eventParam) {
      setSelectedEvents([eventParam]);
    }
  }, [location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };


  // Generate dynamic UPI QR with exact amount; fallback to static image on error
  useEffect(() => {
    const totalAmount = getTotalAmount();
    if (totalAmount <= 0) {
      setQrDataUrl(null);
      return;
    }
    (async () => {
      try {
        const envVars = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
        const upiUrl = buildUpiIntentUrl({
          payeeVpa: envVars.VITE_UPI_VPA || "raghavap1115-1@okicici",
          payeeName: envVars.VITE_UPI_NAME || "Raghava P",
          amount: totalAmount,
          transactionNote: `Cache 2025 - ${formData.fullName || "Participant"}`,
          transactionRef: generateTransactionRef(),
          currency: 'INR',
        });
        const mod = await import("qrcode") as { toDataURL: (text: string, options?: { width?: number; margin?: number }) => Promise<string> };
        const dataUrl: string = await mod.toDataURL(upiUrl, { width: 240, margin: 1 });
        setQrDataUrl(dataUrl);
      } catch {
        setQrDataUrl(qrStatic as unknown as string);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvents, formData.fullName]);

  const getTotalAmount = () => {
    return [...events.technical, ...events.nonTechnical]
      .filter(event => selectedEvents.includes(event.id))
      .reduce((total, event) => total + event.price, 0);
  };

  // No direct payment button now; users scan the static QR and then confirm

  const handleConfirmPayment = async () => {
    // Validate required fields
    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }
    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    // Enforce gmail.com emails only
    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(formData.email.trim())) {
      toast({
        title: "Validation Error",
        description: "Email must end with gmail.com",
        variant: "destructive",
      });
      return;
    }
    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      toast({
        title: "Validation Error",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.college.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your college name",
        variant: "destructive",
      });
      return;
    }
    if (!formData.rollNo.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your roll number",
        variant: "destructive",
      });
      return;
    }
    if (!formData.section.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your section",
        variant: "destructive",
      });
      return;
    }
    if (!upiTxnId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your 12-digit UTR ID",
        variant: "destructive",
      });
      return;
    }
    if (upiTxnId.trim().length !== 12 || !/^\d{12}$/.test(upiTxnId.trim())) {
      toast({
        title: "Validation Error",
        description: "UTR ID must be exactly 12 digits",
        variant: "destructive",
      });
      return;
    }
    // Fraud check: prevent duplicate UTR usage on this device
    try {
      const usedUtrRaw = localStorage.getItem("usedUtrIds");
      const usedUtrIds: string[] = usedUtrRaw ? JSON.parse(usedUtrRaw) : [];
      if (usedUtrIds.includes(upiTxnId.trim())) {
        toast({
          title: "Fraud Detected",
          description: "This UTR ID has already been used.",
          variant: "destructive",
        });
        return;
      }
    } catch {
      // ignore localStorage JSON errors
    }
    if (selectedEvents.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one event",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm("Have you completed the payment in Google Pay?");
    if (!confirmed) return;
    setIsLoading(true);
    try {
      // OCR check: verify that the uploaded proof contains the exact 12-digit UTR
      if (!proofFile) {
        toast({ title: "Validation Error", description: "Please upload payment proof.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      setIsOcrChecking(true);
      try {
        // Tesseract is loaded globally via script tag
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const T: any = (window as any).Tesseract;
        if (!T?.createWorker) throw new Error("OCR unavailable");
        const worker = await T.createWorker();
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const imageUrl = URL.createObjectURL(proofFile);
        const { data } = await worker.recognize(imageUrl);
        await worker.terminate();
        URL.revokeObjectURL(imageUrl);
        const text = String(data?.text || "");
        // Prefer labeled 12-digit patterns first (UTR:, UPI transaction ID:)
        const labeledMatch = text.match(/(?:UTR\s*[:#-]?|UPI\s*transaction\s*ID\s*[:#-]?)[^\d]*(\d{12})/i);
        const foundMatch = (labeledMatch?.[1]) || (text.match(/\b\d{12}\b/g) || []).find(Boolean);
        if (!foundMatch) {
          toast({ title: "Verification Failed", description: "Could not detect a 12-digit UTR in the screenshot.", variant: "destructive" });
          setIsOcrChecking(false);
          setIsLoading(false);
          return;
        }
        if (foundMatch !== upiTxnId.trim()) {
          toast({ title: "Verification Failed", description: "Uploaded proof UTR does not match the entered UTR.", variant: "destructive" });
          setIsOcrChecking(false);
          setIsLoading(false);
          return;
        }

      } catch (err) {
        // Block submission on OCR errors and keep the form data
        toast({ title: "Verification Error", description: "We couldn't verify the UTR from the screenshot. Please try a clearer image.", variant: "destructive" });
        setIsOcrChecking(false);
        setIsLoading(false);
        return;
      } finally {
        setIsOcrChecking(false);
      }
      // Optional pre-check (non-blocking): warn if UTR already exists server-side, but do not block
      try {
        const exists = await checkUtrExists(upiTxnId.trim());
        if (exists) {
          toast({
            title: "Notice",
            description: "This UTR appears in our records. If incorrect, we will verify manually.",
          });
        }
      } catch {}

      const totalAmount = getTotalAmount();
      const transactionRef = generateTransactionRef();
      const paidAtIso = new Date().toISOString();
      const payload = {
        ...formData,
        selectedEvents,
        totalAmount,
        transactionRef,
        paidAtIso,
        upiTxnId: upiTxnId.trim() || undefined,
      };

      console.log("Sending to Google Sheets:", payload);

      const res = await postRegistrationToSheets(payload);
      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Sheets error response:", errorText);
        throw new Error(`Sheets error: ${res.status} - ${errorText}`);
      }

      const result = await res.json();
      console.log("Success response:", result);

      // Generate and download PDF receipt
      const receiptData: ReceiptData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        rollNo: formData.rollNo,
        section: formData.section,
        selectedEvents,
        totalAmount,
        transactionRef,
        upiTxnId: upiTxnId.trim(),
        paidAtIso,
      };

      // Generate PDF receipt
      generateReceiptPDF(receiptData);

      toast({
        title: "Registration submitted",
        description: "Your details have been recorded successfully. Receipt downloaded!",
      });

      // Mark UTR as used (client-side) to deter reuse on this device
      try {
        const usedUtrRaw = localStorage.getItem("usedUtrIds");
        const usedUtrIds: string[] = usedUtrRaw ? JSON.parse(usedUtrRaw) : [];
        usedUtrIds.push(upiTxnId.trim());
        localStorage.setItem("usedUtrIds", JSON.stringify(usedUtrIds));
      } catch {
        // ignore storage errors
      }

      // Reset the form after successful submission and PDF download
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        college: '',
        rollNo: '',
        section: '',
      });
      setSelectedEvents([]);
      setUpiTxnId("");
      setQrDataUrl(null);
      setProofFile(null);
      setProofInputKey((k) => k + 1);
    } catch (error) {
      console.error("Error submitting to sheets:", error);
      toast({
        title: "Error",
        description: `Failed to submit registration: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 text-gradient">
              Register for Cache 2025
            </h1>
            <p className="text-xl text-muted-foreground">
              Join us for the ultimate tech fest experience on Sep 18 & 19
            </p>
          </div>

          {/* Notice */}
          <div className="mb-8 animate-fade-in">
            <Alert className="card-gradient border-border">
              <AlertTitle className="text-lg font-semibold">Notice</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Please keep your payment transaction screenshot ready. You must show it along with your ticket before entering any event.
              </AlertDescription>
            </Alert>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {/* Personal Information */}
            <Card className="card-gradient border-border animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl text-gradient">Personal Information</CardTitle>
                <CardDescription>Please fill in your details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setFormData(prev => ({ ...prev, phone: digitsOnly }));
                      }}
                      required
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      className="mt-1"
                      placeholder="Enter 10-digit phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="college">College *</Label>
                    <Input
                      id="college"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Enter your college name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rollNo">Roll Number *</Label>
                    <Input
                      id="rollNo"
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Enter your roll number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="section">Section *</Label>
                    <Input
                      id="section"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="Enter your section"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Selection */}
            <Card className="card-gradient border-border animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl text-gradient">Select Events</CardTitle>
                <CardDescription>Choose the events you want to participate in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Technical Events */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Technical Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {events.technical.map(event => (
                      <div key={event.id} className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30">
                        <Checkbox
                          id={event.id}
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={() => handleEventToggle(event.id)}
                        />
                        <Label htmlFor={event.id} className="flex-1 cursor-pointer">
                          {event.name}
                        </Label>
                        <span className="text-sm font-medium text-primary">₹{event.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non-Technical Events */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-secondary">Non-Technical Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {events.nonTechnical.map(event => (
                      <div key={event.id} className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30">
                        <Checkbox
                          id={event.id}
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={() => handleEventToggle(event.id)}
                        />
                        <Label htmlFor={event.id} className="flex-1 cursor-pointer">
                          {event.name}
                        </Label>
                        <span className="text-sm font-medium text-secondary">₹{event.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Amount */}
                {selectedEvents.length > 0 && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">₹{getTotalAmount()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Proof */}
            <Card className="card-gradient border-border animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl text-gradient">Payment Proof *</CardTitle>
                <CardDescription>Enter 12-digit UTR ID from your payment (Required)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="upiTxnId">12-Digit UTR (Unique Transaction Reference) ID *</Label>
                  <Input
                    id="upiTxnId"
                    name="upiTxnId"
                    placeholder="e.g., 123456789012"
                    value={upiTxnId}
                    onChange={(e) => setUpiTxnId(e.target.value)}
                    className="mt-1"
                    required
                    maxLength={12}
                    pattern="[0-9]{12}"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    <strong>How to find your 12-digit UTR ID:</strong>
                    <br />• Check your UPI app (PhonePe, Google Pay, Paytm, etc.)
                    <br />• Look for the transaction reference number
                    <br />• It's a 12-digit number (no letters)
                    <br />• Example: 123456789012
                  </div>
                </div>
                <div>
                  <Label htmlFor="upiProof">Upload Payment Proof (screenshot) *</Label>
                  <Input
                    key={proofInputKey}
                    id="upiProof"
                    name="upiProof"
                    type="file"
                    accept="image/*"
                    className="mt-1"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ensure the screenshot clearly shows the 12-digit UTR ID.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Static QR + Confirm */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {qrDataUrl && (
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-muted/30">
                  <img src={qrDataUrl} alt="UPI QR" className="w-[220px] h-[220px] object-contain" />
                  <div className="text-sm text-muted-foreground text-center">
                    UPI ID: <span className="font-medium">raghavap1115-1@okicici</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Amount for selected events: ₹{getTotalAmount()}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isLoading || getTotalAmount() <= 0 || !formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.college.trim() || !formData.rollNo.trim() || !formData.section.trim() || !upiTxnId.trim() || upiTxnId.trim().length !== 12 || !/^\d{12}$/.test(upiTxnId.trim()) || selectedEvents.length === 0}
                  onClick={handleConfirmPayment}
                >
                  {isLoading ? "Submitting..." : "I have completed the payment"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Registration;
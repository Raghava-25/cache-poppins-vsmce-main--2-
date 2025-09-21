import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "react-router-dom";
import {
  buildUpiIntentUrl,
  buildGPayIntentUrl,
  buildPhonePeIntentUrl,
  buildPaytmIntentUrl,
  buildBhimIntentUrl,
  generateTransactionRef,
  isIOS,
  isAndroid
} from "@/lib/payments";
import { postRegistrationToSheets, checkUtrExists } from "@/lib/sheets";
import Footer from "@/components/Footer";
import QRCodeDisplay from "@/components/QRCodeDisplay";

const events = {
  technical: [
    { id: 'web-dev', name: 'Web Development Challenge', price: 100, teamSize: { min: 1, max: 2, type: 'team' } },
    { id: 'poster', name: 'Poster Presentation', price: 100, teamSize: { min: 1, max: 1, type: 'optional' } },
    { id: 'tech-expo', name: 'Tech Expo', price: 100, teamSize: { min: 1, max: 1, type: 'solo' } },
    { id: 'pymaster', name: 'PyMaster Contest', price: 50, teamSize: { min: 1, max: 1, type: 'solo' } },
    { id: 'tech-quiz', name: 'Technical Quiz', price: 100, teamSize: { min: 1, max: 1, type: 'optional' } },
  ],
  nonTechnical: [
    { id: 'photography', name: 'Photography Contest', price: 50, teamSize: { min: 1, max: 1, type: 'solo' } },
    { id: 'free-fire', name: 'Free Fire Esports Championship', price: 200, teamSize: { min: 1, max: 3, type: 'optional' } },
    { id: 'drawing', name: 'Live Drawing', price: 50, teamSize: { min: 1, max: 1, type: 'solo' } },
    { id: 'bgmi', name: 'BGMI Esports Tournament', price: 200, teamSize: { min: 1, max: 3, type: 'optional' } },
    { id: 'meme-contest', name: 'Tech Meme Contest', price: 50, teamSize: { min: 1, max: 1, type: 'solo' } },
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
  const [upiTxnId, setUpiTxnId] = useState("");
  const [awaitingUpiReturn, setAwaitingUpiReturn] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{[eventId: string]: string[]}>({});

  // Pre-select event from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eventParam = searchParams.get('event');
    if (eventParam) {
      setSelectedEvents([eventParam]);
    }
  }, [location]);

  // Add beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if form has any data that would be lost
      const hasFormData = formData.fullName || formData.email || formData.phone || 
                         formData.college || formData.rollNo || formData.section ||
                         selectedEvents.length > 0 || upiTxnId;
      
      if (hasFormData && !showThankYou) {
        e.preventDefault();
        e.returnValue = 'Your registration form data will be lost if you leave this page. Are you sure you want to continue?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, selectedEvents, upiTxnId, showThankYou]);

  // Handle visibility change to detect when user returns from UPI app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && awaitingUpiReturn) {
        // User returned from UPI app, but payment is not completed until UTR is entered
        setTimeout(() => {
          setAwaitingUpiReturn(false);
          toast({
            title: "Returned from UPI App",
            description: "Please enter your 12-digit UTR ID below to complete the payment process.",
          });
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [awaitingUpiReturn, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUpiTxnId(value);

    // Mark payment as completed when valid UTR is entered
    if (value.trim().length === 12 && /^\d{12}$/.test(value.trim())) {
      setPaymentCompleted(true);
      toast({
        title: "Payment Completed!",
        description: "Valid UTR ID entered. You can now download your ticket.",
      });
    } else {
      setPaymentCompleted(false);
    }
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => {
      const newSelectedEvents = prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId];
      
      // Clear team members for deselected events
      if (prev.includes(eventId)) {
        setTeamMembers(prevTeam => {
          const newTeam = { ...prevTeam };
          delete newTeam[eventId];
          return newTeam;
        });
      }
      
      return newSelectedEvents;
    });
  };

  const handleTeamMemberChange = (eventId: string, index: number, value: string) => {
    setTeamMembers(prev => {
      const eventTeam = prev[eventId] || [];
      const newTeam = [...eventTeam];
      newTeam[index] = value;
      return { ...prev, [eventId]: newTeam };
    });
  };

  const addTeamMember = (eventId: string) => {
    setTeamMembers(prev => {
      const eventTeam = prev[eventId] || [];
      return { ...prev, [eventId]: [...eventTeam, ''] };
    });
  };

  const removeTeamMember = (eventId: string, index: number) => {
    setTeamMembers(prev => {
      const eventTeam = prev[eventId] || [];
      const newTeam = eventTeam.filter((_, i) => i !== index);
      return { ...prev, [eventId]: newTeam };
    });
  };

  const getEventTeamSize = (eventId: string) => {
    const allEvents = [...events.technical, ...events.nonTechnical];
    return allEvents.find(e => e.id === eventId)?.teamSize;
  };



  const getTotalAmount = () => {
    return [...events.technical, ...events.nonTechnical]
      .filter(event => selectedEvents.includes(event.id))
      .reduce((total, event) => total + event.price, 0);
  };

  const handleUpiPayment = () => {
    const totalAmount = getTotalAmount();
    if (totalAmount <= 0) {
      toast({
        title: "Error",
        description: "Please select at least one event to proceed with payment",
        variant: "destructive",
      });
      return;
    }

    try {
      const envVars = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
      const paymentParams = {
        payeeVpa: envVars.VITE_UPI_VPA || "raghavap1115-1@okicici",
        payeeName: envVars.VITE_UPI_NAME || "Raghava P",
        amount: totalAmount,
        transactionNote: `Cache 2025 - ${formData.fullName || "Participant"}`,
        transactionRef: generateTransactionRef(),
        currency: 'INR' as const,
      };

      // Try to open UPI app directly - this will open the default UPI app (PhonePe, GPay, etc.)
      const upiUrl = buildUpiIntentUrl(paymentParams);

      // Use window.location.href for better compatibility
      try {
        window.location.href = upiUrl;
        toast({
          title: "Opening UPI App",
          description: "Redirecting to your UPI app for payment...",
        });
      } catch (error) {
        // Fallback: try opening in new window
        try {
          window.open(upiUrl, '_blank');
          toast({
            title: "Opening UPI App",
            description: "Redirecting to your UPI app for payment...",
          });
        } catch (windowError) {
          // If both fail, show UPI details for manual entry
          const upiDetails = `UPI ID: ${paymentParams.payeeVpa}\nAmount: ₹${totalAmount}\nNote: ${paymentParams.transactionNote}`;

          if (navigator.clipboard) {
            navigator.clipboard.writeText(upiDetails).then(() => {
              toast({
                title: "UPI Details Copied",
                description: "UPI details copied to clipboard. Open your UPI app and paste the details.",
              });
            }).catch(() => {
              toast({
                title: "UPI Payment Details",
                description: `UPI ID: ${paymentParams.payeeVpa}, Amount: ₹${totalAmount}`,
              });
            });
          } else {
            toast({
              title: "UPI Payment Details",
              description: `UPI ID: ${paymentParams.payeeVpa}, Amount: ₹${totalAmount}`,
            });
          }
        }
      }

      // Set awaiting state
      setAwaitingUpiReturn(true);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open UPI app. Please try again.",
        variant: "destructive",
      });
    }
  };

  // No direct payment button now; users scan the static QR and then confirm

  const handleSubmitRegistration = async () => {
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
    if (!rulesAccepted) {
      toast({
        title: "Validation Error",
        description: "Please read and accept the event rules before submitting",
        variant: "destructive",
      });
      return;
    }

    // Validate team members for team events
    for (const eventId of selectedEvents) {
      const eventTeamSize = getEventTeamSize(eventId);
      if (eventTeamSize && eventTeamSize.type === 'team') {
        const eventTeam = teamMembers[eventId] || [];
        const validMembers = eventTeam.filter(member => member.trim().length > 0);
        
        if (validMembers.length < eventTeamSize.min) {
          const allEvents = [...events.technical, ...events.nonTechnical];
          const eventName = allEvents.find(e => e.id === eventId)?.name;
          toast({
            title: "Validation Error",
            description: `${eventName} requires at least ${eventTeamSize.min} team member(s). Please add team member names.`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setIsLoading(true);
    try {
      // Optional pre-check (non-blocking): warn if UTR already exists server-side, but do not block
      try {
        const exists = await checkUtrExists(upiTxnId.trim());
        if (exists) {
          toast({
            title: "Notice",
            description: "This UTR appears in our records. If incorrect, we will verify manually.",
          });
        }
      } catch {
        // Ignore server check errors, continue with registration
      }

      const totalAmount = getTotalAmount();
      const transactionRef = generateTransactionRef();
      const paidAtIso = new Date().toISOString();
      const ticketDownloadTime = new Date().toISOString();

      // Generate verification hash for security
      const verificationData = `${transactionRef}-${upiTxnId.trim()}-${totalAmount}-${selectedEvents.join(',')}`;
      const verificationHash = btoa(verificationData).substring(0, 12).toUpperCase();

      const payload = {
        ...formData,
        selectedEvents,
        totalAmount,
        transactionRef,
        paidAtIso,
        upiTxnId: upiTxnId.trim() || undefined,
        ticketDownloadTime,
        verificationHash,
        teamMembers,
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

      // Show success popup and thank you message
      setShowSuccessPopup(true);
      setShowThankYou(true);

      toast({
        title: "🎉 Registration Successful!",
        description: "Thank you for registering! Our team will send your ticket through email.",
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

      // Reset the form after successful submission
      setTimeout(() => {
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
        setShowThankYou(false);
        setPaymentCompleted(false);
        setRulesAccepted(false);
        setShowSuccessPopup(false);
        setTeamMembers({});
      }, 5000);
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
                      <div key={event.id} className="p-3 rounded-lg bg-muted/30 space-y-3">
                        <div className="flex items-center space-x-2">
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
                        
                        {/* Team Member Fields */}
                        {selectedEvents.includes(event.id) && event.teamSize.type !== 'solo' && (
                          <div className="ml-6 space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Team Members {event.teamSize.type === 'team' ? '(Required)' : '(Optional)'}:
                            </div>
                            {(teamMembers[event.id] || []).map((member, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  placeholder={`Team Member ${index + 1} Name`}
                                  value={member}
                                  onChange={(e) => handleTeamMemberChange(event.id, index, e.target.value)}
                                  className="flex-1"
                                />
                                {(teamMembers[event.id] || []).length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeTeamMember(event.id, index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}
                            {(teamMembers[event.id] || []).length < event.teamSize.max && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addTeamMember(event.id)}
                              >
                                + Add Team Member
                              </Button>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {event.teamSize.type === 'team' 
                                ? `Required: ${event.teamSize.min}-${event.teamSize.max} members`
                                : `Optional: up to ${event.teamSize.max} members`
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non-Technical Events */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-secondary">Non-Technical Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {events.nonTechnical.map(event => (
                      <div key={event.id} className="p-3 rounded-lg bg-muted/30 space-y-3">
                        <div className="flex items-center space-x-2">
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
                        
                        {/* Team Member Fields */}
                        {selectedEvents.includes(event.id) && event.teamSize.type !== 'solo' && (
                          <div className="ml-6 space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Team Members {event.teamSize.type === 'team' ? '(Required)' : '(Optional)'}:
                            </div>
                            {(teamMembers[event.id] || []).map((member, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  placeholder={`Team Member ${index + 1} Name`}
                                  value={member}
                                  onChange={(e) => handleTeamMemberChange(event.id, index, e.target.value)}
                                  className="flex-1"
                                />
                                {(teamMembers[event.id] || []).length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeTeamMember(event.id, index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}
                            {(teamMembers[event.id] || []).length < event.teamSize.max && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addTeamMember(event.id)}
                              >
                                + Add Team Member
                              </Button>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {event.teamSize.type === 'team' 
                                ? `Required: ${event.teamSize.min}-${event.teamSize.max} members`
                                : `Optional: up to ${event.teamSize.max} members`
                              }
                            </div>
                          </div>
                        )}
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

            {/* Rules Acceptance */}
            <Card className="card-gradient border-border animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl text-gradient">Rules & Guidelines</CardTitle>
                <CardDescription>Please read and accept the event rules before proceeding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="rulesAccepted"
                    checked={rulesAccepted}
                    onCheckedChange={(checked) => setRulesAccepted(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="rulesAccepted" className="cursor-pointer">
                      I have read and agree to the{" "}
                      <a 
                        href="/rules" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Event Rules and Guidelines
                      </a>
                      . I understand that I must follow all rules and that any misconduct may lead to disqualification without refund.
                    </Label>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <p className="font-medium mb-2">Important Reminders:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Carry your college ID and event ticket at all times</li>
                    <li>Follow volunteers' instructions and campus guidelines</li>
                    <li>Decisions by judges/organizers are final</li>
                    <li>Keep your payment screenshot ready to show at the event</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            {selectedEvents.length > 0 && getTotalAmount() > 0 && (
              <Card className="card-gradient border-border animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-2xl text-gradient">Payment</CardTitle>
                  <CardDescription>
                    {awaitingUpiReturn
                      ? "Waiting for payment completion..."
                      : paymentCompleted
                        ? "Payment completed! You can now download your ticket."
                        : "Click the button below to pay with your UPI app"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* UPI Payment Button - Show when not completed */}
                  {!paymentCompleted && (
                    <div className="flex flex-col items-center gap-4">
                      <Button
                        type="button"
                        size="lg"
                        className="w-full max-w-md bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                        onClick={handleUpiPayment}
                        disabled={isLoading || awaitingUpiReturn}
                      >
                        {awaitingUpiReturn ? "⏳ Waiting for payment..." : isIOS() ? "📋 Copy UPI Details" : "💳 Pay with GPay/UPI"}
                      </Button>
                      <p className="text-sm text-muted-foreground text-center">
                        {awaitingUpiReturn
                          ? "Complete the payment in your UPI app and return here"
                          : isIOS()
                            ? "UPI details will be copied to clipboard"
                            : `Opens your UPI app with amount: ₹${getTotalAmount()}`
                        }
                      </p>

                      {/* QR Code Display */}
                      <div className="mt-6">
                        <QRCodeDisplay
                          upiId="raghavap1115-1@okicici"
                          amount={getTotalAmount()}
                          transactionNote={`Cache 2025 - ${formData.fullName || "Participant"}`}
                          onCopyDetails={() => {
                            const upiDetails = `UPI ID: raghavap1115-1@okicici\nAmount: ₹${getTotalAmount()}\nNote: Cache 2025 - ${formData.fullName || "Participant"}`;
                            navigator.clipboard.writeText(upiDetails).then(() => {
                              toast({
                                title: "UPI Details Copied",
                                description: "UPI details copied to clipboard",
                              });
                            });
                          }}
                        />
                      </div>

                      {/* iOS Manual UPI Details */}
                      {isIOS() && !awaitingUpiReturn && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                          <p className="text-sm font-medium mb-2">For iOS users - Manual UPI Entry:</p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p><strong>UPI ID:</strong> raghavap1115-1@okicici</p>
                            <p><strong>Amount:</strong> ₹{getTotalAmount()}</p>
                            <p><strong>Note:</strong> Cache 2025 - {formData.fullName || "Participant"}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            If the button doesn't work, copy these details and open your UPI app manually.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Download Ticket Button - Only shown after payment is completed */}
                  {paymentCompleted && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-center space-y-2">
                        <div className="text-4xl">✅</div>
                        <p className="text-lg font-semibold text-green-600">Payment Completed!</p>
                        <p className="text-sm text-muted-foreground">
                          Your UTR ID has been verified. Click below to submit your registration.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="lg"
                        className="w-full max-w-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                        onClick={handleSubmitRegistration}
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : "📝 Submit Registration"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Details */}
            {selectedEvents.length > 0 && getTotalAmount() > 0 && (
              <Card className="card-gradient border-border animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-2xl text-gradient">Payment Details *</CardTitle>
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
                      onChange={handleUtrChange}
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
                </CardContent>
              </Card>
            )}

            {/* Thank You Message */}
            {showThankYou && (
              <Card className="card-gradient border-green-500 animate-slide-up">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎉</div>
                    <h3 className="text-2xl font-bold text-green-600">Thank You for Registering!</h3>
                    <p className="text-muted-foreground">
                      Your registration has been submitted successfully. Our team will send your ticket through email.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please keep your payment screenshot ready to show at the event.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>

      {/* Success Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-green-600">
              🎉 Registration Successful!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Thank you for registering for Cache 2025!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="text-6xl">✅</div>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Your registration has been submitted successfully. Our team will send your ticket through email.
              </p>
              <p className="text-sm text-muted-foreground">
                Please keep your payment screenshot ready to show at the event.
              </p>
            </div>
            <Button 
              onClick={() => setShowSuccessPopup(false)}
              className="w-full"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Registration;
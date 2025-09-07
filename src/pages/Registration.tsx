import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { generateTransactionRef } from "@/lib/payments";
import { postRegistrationToSheets } from "@/lib/sheets";
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
    { id: 'bgmi', name: 'BGMI Esports Tournament', price: 250 },
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

  // Set static QR when total > 0
  useEffect(() => {
    const totalAmount = getTotalAmount();
    if (totalAmount <= 0) {
      setQrDataUrl(null);
      return;
    }
    setQrDataUrl(qrStatic as unknown as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvents, formData.fullName]);

  const getTotalAmount = () => {
    return [...events.technical, ...events.nonTechnical]
      .filter(event => selectedEvents.includes(event.id))
      .reduce((total, event) => total + event.price, 0);
  };

  // No direct payment button now; users scan the static QR and then confirm

  const handleConfirmPayment = async () => {
    const confirmed = window.confirm("Have you completed the payment in Google Pay?");
    if (!confirmed) return;
    setIsLoading(true);
    try {
      const totalAmount = getTotalAmount();
      const transactionRef = generateTransactionRef();
      const res = await postRegistrationToSheets({
        ...formData,
        selectedEvents,
        totalAmount,
        transactionRef,
        paidAtIso: new Date().toISOString(),
      });
      if (!res.ok) throw new Error(`Sheets error: ${res.status}`);
      toast({
        title: "Registration submitted",
        description: "Your details have been recorded successfully.",
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
              Join us for the ultimate tech fest experience on Sep 17 & 18
            </p>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
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
                  disabled={isLoading || getTotalAmount() <= 0}
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
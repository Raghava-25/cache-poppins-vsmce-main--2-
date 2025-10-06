import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { postRegistrationToSheets } from "@/lib/sheets";
import Footer from "@/components/Footer";

const events = {
  technical: [
    {
      id: "web-dev",
      name: "Web Development Challenge",
      price: 100,
      teamSize: { min: 1, max: 2, type: "team" },
    },
    {
      id: "poster",
      name: "Poster Presentation",
      price: 100,
      teamSize: { min: 1, max: 1, type: "optional" },
    },
    {
      id: "tech-expo",
      name: "Tech Expo",
      price: 100,
      teamSize: { min: 1, max: 2, type: "team" },
    },
    {
      id: "pymaster",
      name: "PyMaster Contest",
      price: 50,
      teamSize: { min: 1, max: 1, type: "solo" },
    },
    {
      id: "tech-quiz",
      name: "Technical Quiz",
      price: 100,
      teamSize: { min: 1, max: 1, type: "optional" },
    },
  ],
  nonTechnical: [
    {
      id: "photography",
      name: "Photography Contest",
      price: 50,
      teamSize: { min: 1, max: 1, type: "solo" },
    },
    {
      id: "free-fire",
      name: "Free Fire Esports Championship",
      price: 200,
      teamSize: { min: 1, max: 3, type: "optional" },
    },
    {
      id: "drawing",
      name: "Live Drawing",
      price: 50,
      teamSize: { min: 1, max: 1, type: "solo" },
    },
    {
      id: "bgmi",
      name: "BGMI Esports Tournament",
      price: 200,
      teamSize: { min: 1, max: 3, type: "optional" },
    },
    {
      id: "meme-contest",
      name: "Tech Meme Contest",
      price: 50,
      teamSize: { min: 1, max: 1, type: "solo" },
    },
  ],
};

const Registration = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    rollNo: "",
    section: "",
  });
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{
    [eventId: string]: string[];
  }>({});

  // Pre-select event from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eventParam = searchParams.get("event");
    if (eventParam) {
      setSelectedEvents([eventParam]);
    }
  }, [location]);

  // Add beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if form has any data that would be lost
      const hasFormData =
        formData.fullName ||
        formData.email ||
        formData.phone ||
        formData.college ||
        formData.rollNo ||
        formData.section ||
        selectedEvents.length > 0;

      if (hasFormData && !showThankYou) {
        e.preventDefault();
        e.returnValue =
          "Your registration form data will be lost if you leave this page. Are you sure you want to continue?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, selectedEvents, showThankYou]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // UTR and payment are not required for free events

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents((prev) => {
      const newSelectedEvents = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];

      // Clear team members for deselected events
      if (prev.includes(eventId)) {
        setTeamMembers((prevTeam) => {
          const newTeam = { ...prevTeam };
          delete newTeam[eventId];
          return newTeam;
        });
      }

      return newSelectedEvents;
    });
  };

  const handleTeamMemberChange = (
    eventId: string,
    index: number,
    value: string
  ) => {
    setTeamMembers((prev) => {
      const eventTeam = prev[eventId] || [];
      const newTeam = [...eventTeam];
      newTeam[index] = value;
      return { ...prev, [eventId]: newTeam };
    });
  };

  const addTeamMember = (eventId: string) => {
    setTeamMembers((prev) => {
      const eventTeam = prev[eventId] || [];
      return { ...prev, [eventId]: [...eventTeam, ""] };
    });
  };

  const removeTeamMember = (eventId: string, index: number) => {
    setTeamMembers((prev) => {
      const eventTeam = prev[eventId] || [];
      const newTeam = eventTeam.filter((_, i) => i !== index);
      return { ...prev, [eventId]: newTeam };
    });
  };

  const getEventTeamSize = (eventId: string) => {
    const allEvents = [...events.technical, ...events.nonTechnical];
    return allEvents.find((e) => e.id === eventId)?.teamSize;
  };

  const getTotalAmount = () => 0;

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
    // UTR validations removed for free events
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
      if (eventTeamSize && eventTeamSize.type === "team") {
        const eventTeam = teamMembers[eventId] || [];
        const validMembers = eventTeam.filter(
          (member) => member.trim().length > 0
        );

        if (validMembers.length < eventTeamSize.min) {
          const allEvents = [...events.technical, ...events.nonTechnical];
          const eventName = allEvents.find((e) => e.id === eventId)?.name;
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
      const totalAmount = 0;
      const transactionRef = "FREE-REG";
      const paidAtIso = "";
      const ticketDownloadTime = new Date().toISOString();

      const payload = {
        ...formData,
        selectedEvents,
        totalAmount,
        transactionRef,
        paidAtIso,
        upiTxnId: "",
        ticketDownloadTime,
        verificationHash: "",
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
        description:
          "Thank you for registering! We will send your ticket via email.",
      });

      // Reset the form after successful submission
      setTimeout(() => {
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          college: "",
          rollNo: "",
          section: "",
        });
        setSelectedEvents([]);
        setShowThankYou(false);
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
              Join us for the ultimate tech fest experience on Oct 9 & 10
            </p>
          </div>

          {/* Notice */}
          <div className="mb-8 animate-fade-in">
            <Alert className="card-gradient border-border">
              <AlertTitle className="text-lg font-semibold">Good news!</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                All events are free. Just register and participate.
              </AlertDescription><br />
              <AlertTitle className="text-lg font-semibold">Note</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                There is no cash prizes for the events.
                <br />
                <br/>participant certificate will be given to the final round participants.<br />
                <br />
                first and second round participants will be given a certificate.<br />
                <br />
                If any one previously registered for the events, the amount will be refunded.
              </AlertDescription>
            </Alert>
          </div>

          

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {/* Personal Information */}
            <Card className="card-gradient border-border animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl text-gradient">
                  Personal Information
                </CardTitle>
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
                        const digitsOnly = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setFormData((prev) => ({ ...prev, phone: digitsOnly }));
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
                <CardTitle className="text-2xl text-gradient">
                  Select Events
                </CardTitle>
                <CardDescription>
                  Choose the events you want to participate in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Technical Events */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    Technical Events
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {events.technical.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg bg-muted/30 space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={event.id}
                            checked={selectedEvents.includes(event.id)}
                            onCheckedChange={() => handleEventToggle(event.id)}
                          />
                          <Label
                            htmlFor={event.id}
                            className="flex-1 cursor-pointer"
                          >
                            {event.name}
                          </Label>
                          {/* Price hidden for free events */}
                        </div>

                        {/* Team Member Fields */}
                        {selectedEvents.includes(event.id) &&
                          event.teamSize.type !== "solo" && (
                            <div className="ml-6 space-y-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                Team Members{" "}
                                {event.teamSize.type === "team"
                                  ? "(Required)"
                                  : "(Optional)"}
                                :
                              </div>
                              {(teamMembers[event.id] || []).map(
                                (member, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <Input
                                      placeholder={`Team Member ${
                                        index + 1
                                      } Name`}
                                      value={member}
                                      onChange={(e) =>
                                        handleTeamMemberChange(
                                          event.id,
                                          index,
                                          e.target.value
                                        )
                                      }
                                      className="flex-1"
                                    />
                                    {(teamMembers[event.id] || []).length >
                                      1 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          removeTeamMember(event.id, index)
                                        }
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                )
                              )}
                              {(teamMembers[event.id] || []).length <
                                event.teamSize.max && (
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
                                {event.teamSize.type === "team"
                                  ? `Required: ${event.teamSize.min}-${event.teamSize.max} members`
                                  : `Optional: up to ${event.teamSize.max} members`}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non-Technical Events */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-secondary">
                    Non-Technical Events
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {events.nonTechnical.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg bg-muted/30 space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={event.id}
                            checked={selectedEvents.includes(event.id)}
                            onCheckedChange={() => handleEventToggle(event.id)}
                          />
                          <Label
                            htmlFor={event.id}
                            className="flex-1 cursor-pointer"
                          >
                            {event.name}
                          </Label>
                          {/* Price hidden for free events */}
                        </div>

                        {/* Team Member Fields */}
                        {selectedEvents.includes(event.id) &&
                          event.teamSize.type !== "solo" && (
                            <div className="ml-6 space-y-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                Team Members{" "}
                                {event.teamSize.type === "team"
                                  ? "(Required)"
                                  : "(Optional)"}
                                :
                              </div>
                              {(teamMembers[event.id] || []).map(
                                (member, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <Input
                                      placeholder={`Team Member ${
                                        index + 1
                                      } Name`}
                                      value={member}
                                      onChange={(e) =>
                                        handleTeamMemberChange(
                                          event.id,
                                          index,
                                          e.target.value
                                        )
                                      }
                                      className="flex-1"
                                    />
                                    {(teamMembers[event.id] || []).length >
                                      1 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          removeTeamMember(event.id, index)
                                        }
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                )
                              )}
                              {(teamMembers[event.id] || []).length <
                                event.teamSize.max && (
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
                                {event.teamSize.type === "team"
                                  ? `Required: ${event.teamSize.min}-${event.teamSize.max} members`
                                  : `Optional: up to ${event.teamSize.max} members`}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Amount section removed for free events */}
              </CardContent>
            </Card>

            {/* Rules Acceptance */}
            <Card className="card-gradient border-border animate-slide-up">
              <CardHeader>
                <CardTitle className="text-2xl text-gradient">
                  Rules & Guidelines
                </CardTitle>
                <CardDescription>
                  Please read and accept the event rules before proceeding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="rulesAccepted"
                    checked={rulesAccepted}
                    onCheckedChange={(checked) =>
                      setRulesAccepted(checked as boolean)
                    }
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
                      . I understand that I must follow all rules and that any
                      misconduct may lead to disqualification without refund.
                    </Label>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <p className="font-medium mb-2">Important Reminders:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Carry your college ID and event ticket at all times</li>
                    <li>
                      Follow volunteers' instructions and campus guidelines
                    </li>
                    <li>Decisions by judges/organizers are final</li>
                    <li>
                      Bring your college ID and arrive on time for your events.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Submit Registration */}
            <div className="flex justify-center">
              <Button
                type="button"
                size="lg"
                className="w-full max-w-md bg-gradient-primary hover:opacity-90 text-primary-foreground"
                onClick={handleSubmitRegistration}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "📝 Submit Registration"}
              </Button>
            </div>

            {/* Thank You Message */}
            {showThankYou && (
              <Card className="card-gradient border-green-500 animate-slide-up">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎉</div>
                    <h3 className="text-2xl font-bold text-green-600">
                      Thank You for Registering!
                    </h3>
                    <p className="text-muted-foreground">
                      Your registration has been submitted successfully. Our
                      team will send your ticket through email.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bring your college ID and arrive on time for your events.
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
                Your registration has been submitted successfully. Our team will
                send your ticket through email.
              </p>
              <p className="text-sm text-muted-foreground">
                Bring your college ID and arrive on time for your events.
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

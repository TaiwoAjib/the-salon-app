import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { settingsService, BusinessHours } from "@/services/settingsService";
import { bookingPolicyService } from "@/services/bookingPolicyService";
import GallerySettings from "./settings/GallerySettings";
import { PromoSettings } from "@/components/admin/PromoSettings";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salonName, setSalonName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [depositAmount, setDepositAmount] = useState("50");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [policyContent, setPolicyContent] = useState("");
  const [courtesyNotice, setCourtesyNotice] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { start: "09:00", end: "22:00", isOpen: true },
    tuesday: { start: "09:00", end: "22:00", isOpen: true },
    wednesday: { start: "09:00", end: "22:00", isOpen: true },
    thursday: { start: "09:00", end: "22:00", isOpen: true },
    friday: { start: "09:00", end: "22:00", isOpen: true },
    saturday: { start: "09:00", end: "22:00", isOpen: true },
    sunday: { start: "09:00", end: "22:00", isOpen: true },
  });

  useEffect(() => {
    fetchSettings();
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const policy = await bookingPolicyService.getPolicy();
      if (policy) {
        setPolicyContent(policy.content);
      }
    } catch (error) {
      console.error("Failed to load policy", error);
    }
  };


  const fetchSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      if (!data) return;
      
      setSalonName(data.salonName || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
      setEmail(data.email || "");
      setDepositAmount(data.depositAmount?.toString() || "50");
      setNotificationsEnabled(!!data.notificationsEnabled);
      setRequireApproval(data.requireApproval ?? true);
      setLogoUrl(data.logoUrl);
      setCourtesyNotice(data.courtesyNotice || "");
      if (data.businessHours) {
        setBusinessHours(data.businessHours);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await settingsService.uploadLogo(file);
      setLogoUrl(result.logoUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload logo");
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await settingsService.updateSettings({
        salonName,
        address,
        phone,
        email,
        depositAmount: parseFloat(depositAmount),
        notificationsEnabled,
        requireApproval,
        businessHours,
        courtesyNotice,
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePolicy = async () => {
    setIsSubmitting(true);
    try {
      await bookingPolicyService.updatePolicy(policyContent);
      toast.success("Policy updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update policy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDayChange = (day: string, field: string, value: any) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8 min-h-[80vh]">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your salon profile, business hours, and system preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full gap-2 bg-muted/50 p-1">
          <TabsTrigger value="general" className="flex-1 min-w-[100px]">General</TabsTrigger>
          <TabsTrigger value="hours" className="flex-1 min-w-[80px]">Hours</TabsTrigger>
          <TabsTrigger value="payments" className="flex-1 min-w-[90px]">Payments</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 min-w-[110px]">Notifications</TabsTrigger>
          <TabsTrigger value="policy" className="flex-1 min-w-[80px]">Policy</TabsTrigger>
          <TabsTrigger value="courtesy" className="flex-1 min-w-[90px]">Courtesy</TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1 min-w-[80px]">Gallery</TabsTrigger>
          <TabsTrigger value="promos" className="flex-1 min-w-[80px]">Promos</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Salon Information</CardTitle>
              <CardDescription>
                Update your salon's public profile and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Salon Logo</Label>
                <div className="flex items-center gap-4">
                  {logoUrl && (
                    <img 
                      src={logoUrl} 
                      alt="Salon Logo" 
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                  )}
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full max-w-xs"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Salon Name</Label>
                <Input
                  id="name"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-white" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>
                Set your weekly operating hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                  <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md gap-4">
                    <div className="flex items-center gap-4 w-32">
                        <Switch 
                            checked={businessHours[day]?.isOpen} 
                            onCheckedChange={(checked) => handleDayChange(day, 'isOpen', checked)}
                        />
                        <span className="font-medium capitalize">{day}</span>
                    </div>
                    
                    {businessHours[day]?.isOpen ? (
                        <div className="flex items-center gap-2">
                            <Input 
                                type="time" 
                                value={businessHours[day].start}
                                onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                                className="w-32"
                            />
                            <span>to</span>
                            <Input 
                                type="time" 
                                value={businessHours[day].end}
                                onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                                className="w-32"
                            />
                        </div>
                    ) : (
                        <span className="text-muted-foreground italic">Closed</span>
                    )}
                  </div>
                ))}
                <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-white w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Hours"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Rules</CardTitle>
              <CardDescription>Manage deposit requirements and payment gateways.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="deposit">Booking Scheduling Fee ($)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="deposit"
                    type="number"
                    className="pl-7"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Fixed fee charged upon booking (not deducted from service price).
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Stripe Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept credit card payments online.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                    <CreditCard className="h-4 w-4" />
                    Connected
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-white" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage automated email and SMS alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email and SMS notifications to customers
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Manually approve notifications before sending
                  </p>
                </div>
                <Switch
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>
              <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-white">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Settings */}
        <TabsContent value="policy" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Policy</CardTitle>
              <CardDescription>Update the booking guidelines displayed to customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="policy">Policy Content</Label>
                <Textarea
                  id="policy"
                  value={policyContent}
                  onChange={(e) => setPolicyContent(e.target.value)}
                  className="min-h-[400px]"
                />
              </div>
              <Button onClick={handleSavePolicy} className="bg-gold hover:bg-gold-dark text-white" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Policy"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courtesy Notice Settings */}
        <TabsContent value="courtesy" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Courtesy Notice</CardTitle>
              <CardDescription>Update the courtesy notice displayed above the Service selection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="courtesy">Notice Content</Label>
                <Textarea
                  id="courtesy"
                  value={courtesyNotice}
                  onChange={(e) => setCourtesyNotice(e.target.value)}
                  className="min-h-[300px]"
                  placeholder="Enter courtesy notice here..."
                />
              </div>
              <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-white" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Courtesy Notice"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Settings */}
        <TabsContent value="gallery" className="space-y-4 mt-6">
          <GallerySettings />
        </TabsContent>

        {/* Promo Settings */}
        <TabsContent value="promos" className="space-y-4 mt-6">
          <PromoSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

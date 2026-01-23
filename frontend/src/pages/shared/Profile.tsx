import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Upload, User as UserIcon, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authService, User } from "@/services/authService";
import { userService } from "@/services/userService";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDay: z.string().optional(),
  birthMonth: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface DashboardContext {
  setUser: (user: User) => void;
}

const Profile = () => {
  const { setUser: setGlobalUser } = useOutletContext<DashboardContext>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      birthDay: "",
      birthMonth: "",
      password: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await authService.getMe();
        console.log("Fetched user data:", userData);
        
        setUser(userData);
        setGlobalUser(userData);
        
        form.reset({
          fullName: userData.fullName ?? "",
          email: userData.email ?? "",
          phone: userData.phone ?? "",
          address: userData.address ?? "",
          birthDay: userData.birthDay ? userData.birthDay.toString() : "",
          birthMonth: userData.birthMonth ? userData.birthMonth.toString() : "",
          password: "",
        });
        
        if (userData.profileImage) {
          setPreviewImage(userData.profileImage);
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.address) formData.append("address", data.address);
      if (data.birthDay) formData.append("birthDay", data.birthDay);
      if (data.birthMonth) formData.append("birthMonth", data.birthMonth);
      if (data.password) formData.append("password", data.password);
      if (selectedFile) formData.append("profileImage", selectedFile);

      const updatedUser = await userService.updateProfile(formData);
      
      // Update local state
      setUser(updatedUser);
      setGlobalUser(updatedUser);
      
      // Update local storage user data via authService helper if needed, 
      // but authService.getMe() already updates it. 
      // We can manually update it here to be safe and instant.
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully");
      
      // Clear password field
      form.setValue("password", "");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 min-h-[80vh]">
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-charcoal">Profile Settings</h2>
        <p className="text-lg text-muted-foreground mt-2">Manage your account settings and profile picture.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage src={previewImage || ""} alt={user?.fullName} className="object-cover" />
                    <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="profile-image-upload" 
                    className="absolute bottom-0 right-0 bg-gold hover:bg-gold-dark text-white p-1.5 rounded-full cursor-pointer shadow-md transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <input 
                      id="profile-image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-medium text-lg">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a new photo. JPG, GIF or PNG.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Day</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="mb-4 text-lg font-medium">Security</h3>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-gold hover:bg-gold-dark text-white"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import styleBoxBraids from "@/assets/signature 1.jpeg";
import styleCornrows from "@/assets/signature 2.jpeg";
import styleBohoLocs from "@/assets/signature 3.jpeg";
import styleTwists from "@/assets/signature 4.jpeg";
import salonInterior from "@/assets/signature 5.jpeg";
import heroBraids from "@/assets/signature 6.jpeg";


const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["admin", "stylist", "customer"]).default("customer"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      if (!emblaApi) return;
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, 3000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      role: "customer",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await authService.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        password: data.password,
        role: data.role,
      });
      toast.success("Registration successful! Please login.");
      navigate("/thesalonadmin");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong during registration";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const images = [heroBraids, styleBoxBraids, styleCornrows, styleBohoLocs, styleTwists, salonInterior];

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="flex flex-col items-center justify-center p-6 md:p-10">
          <Link to="/" className="flex items-center gap-3 mb-6 group">
            <img src="/logo.png" alt="Victoria Braids" className="h-32 w-auto object-contain" />
          </Link>

          <Card className="w-full max-w-lg shadow-elegant border border-border">
            <CardHeader className="space-y-1 text-center p-4 pb-0">
              <CardTitle className="text-2xl font-serif text-foreground">Create an Account</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Join Victoria Braids & Weaves to book your appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="mb-2">
                <Tabs defaultValue="customer" onValueChange={(val) => form.setValue("role", val as "admin" | "stylist" | "customer")}>
                  <TabsList className="grid w-full grid-cols-3 h-8">
                    <TabsTrigger value="customer" className="text-xs">Customer</TabsTrigger>
                    <TabsTrigger value="stylist" className="text-xs">Stylist</TabsTrigger>
                    <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="h-8 text-sm border-gold/30 focus:border-gold" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} className="h-8 text-sm border-gold/30 focus:border-gold" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} className="h-8 text-sm border-gold/30 focus:border-gold" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Address (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} className="h-8 text-sm border-gold/30 focus:border-gold" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} className="h-8 text-sm border-gold/30 focus:border-gold" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} className="h-8 text-sm border-gold/30 focus:border-gold" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gold hover:bg-gold-dark text-white font-medium py-1.5 h-9 rounded-md transition-colors mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center p-2 pb-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/thesalonadmin" className="text-gold hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>

        <div className="relative hidden lg:block h-screen overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-background/20 to-transparent z-10" />
          <div className="h-full w-full" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((img, idx) => (
                <div key={idx} className="relative min-w-0 flex-[0_0_100%] h-full">
                  <img src={img} alt={`Style ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-6 left-6 bg-background/70 backdrop-blur-sm text-foreground px-4 py-2 rounded-md shadow-elegant border border-border z-20">
                    <span className="font-serif">Victoria Braids & Weaves</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

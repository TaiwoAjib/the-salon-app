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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Save to localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      toast.success("Login successful!");

      // Role-based redirection
      switch (response.user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "stylist":
          navigate("/stylist");
          break;
        case "customer":
        default:
          navigate("/dashboard");
          break;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid credentials";
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
          <Link to="/" className="flex items-center gap-3 mb-8 group">
            <img src="/logo.png" alt="Victoria Braids" className="h-32 w-auto object-contain" />
          </Link>

          <Card className="w-full max-w-3xl shadow-elegant border border-border">
            <CardHeader className="space-y-2 text-center p-10 pb-6">
              <CardTitle className="text-4xl font-serif text-foreground">Welcome Back</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Sign in to manage your appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} className="h-14 text-lg border-gold/30 focus:border-gold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="******" {...field} className="h-14 text-lg border-gold/30 focus:border-gold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg bg-gold hover:bg-gold-dark text-white font-medium rounded-md transition-colors mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/thesalonregister" className="text-gold hover:underline font-medium">
                  Register now
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

export default Login;

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { login, loginAsync } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Cookies from 'js-cookie';

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Dispatch login action with appropriate role
      const result = await dispatch(
        loginAsync({
          password: data.password,
          email: data.email,
        })
      ).unwrap();

      if (result.status === "success") {

        // store the token in cookies
        if (result.data.token) {
          const token = result.data.token;
          Cookies.set("auth_token", token);
        }

        // store the role in cookies
        if (result.data.role) {
          const role = result.data.role;
          Cookies.set("auth_role", role);
        }

        if (result.data.role === "ADMIN") {

          toast.success("Login Successful", {
            description: result.message || "Welcome to Admin Dashboard",
            duration: 1500,
            position: "top-right"
          });

          setTimeout(() => {
            router.push("/admin/dashboard");
          }, 1500);

        } else if (result.data.role === "USER") {

          if (result.data.user.isPortalAccess) {

            toast.success("Login Successful", {
              description: result.message || "Welcome to Money Manager",
              duration: 4500,
              position: "top-right"
            });

          } else {

            toast.error("Login Failed", {
              description: result.message || "You are not allowed to access this portal",
              duration: 1500,
              position: "top-right"
            });

          }


          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      }
    } catch (error: any) {

      toast.error("Login Failed", {
        description: error?.message || "Something went wrong. Please try again.",
        duration: 1500,
        position: "top-right"
      });

    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p>Password@123</p>
        <p>Mcodev@123</p>
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
            )}
          />
          <Link
            href="/auth/reset-password"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </Form>
  );
}

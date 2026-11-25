"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, User, CheckCircle2, TrendingUp, Shield } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function HomePage() {
  const { login, loginWithJamiiPass, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password, rememberMe });
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleJamiiPassLogin = async () => {
    try {
      await loginWithJamiiPass();
    } catch (error) {
      toast.error("JamiiPass login failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image */}
      <div className="w-[55%] relative">
        <Image
          src="/login3.png"
          alt="Tanzania Creative Hub"
          fill
          className="object-cover"
          priority
        />
        {/* Center Overlay Image */}
        <div className="absolute inset-0 z-10 flex items-center justify-center -translate-y-28">
          <Image
            src="/landing.png"
            alt="Landing"
            width={420}
            height={420}
            className="object-contain"
          />
        </div>

        {/* Bottom Welcome Text */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-10 pb-52">
          <h2 className="text-5xl font-bold text-white mb-3">Welcome!</h2>
          <p className="text-white/90 text-lg leading-snug mb-4">
            Manage, track and monitor the implementation<br />of activities for the Annual Action Plan.
          </p>
          <div className="w-12 h-1 bg-yellow-400 mb-6 rounded-full" />
          <div className="flex items-start gap-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-green-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Track Progress</p>
                <p className="text-white/70 text-xs">In real time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-blue-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Improve Performance</p>
                <p className="text-white/70 text-xs">With actionable insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-yellow-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Ensure Compliance</p>
                <p className="text-white/70 text-xs">And accountability</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 z-20 px-8 pt-6">
          <div className="flex items-center gap-4">
            <Image src="/coat.png" alt="Coat of Arms" width={60} height={60} className="object-contain shrink-0" />
            <div>
              <p className="text-white/80 text-xs uppercase tracking-widest font-medium">United Republic of Tanzania</p>
              <p className="text-white font-bold text-sm leading-snug">Ministry of Communication and<br />Information Technology</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-[45%] flex items-center justify-center p-8 bg-white dark:bg-background text-foreground">
        <div className="w-full max-w-sm">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#001f54] dark:bg-primary rounded-full flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-foreground mb-2">Log In</h2>
          <p className="text-center text-gray-500 dark:text-muted-foreground text-sm mb-8">
            Access your enterprise account to continue
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-300 dark:border-input bg-white dark:bg-input/30 text-gray-900 dark:text-foreground caret-foreground"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-300 dark:border-input bg-white dark:bg-input/30 text-gray-900 dark:text-foreground caret-foreground"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-muted-foreground dark:hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-gray-600 dark:text-muted-foreground cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-[#001f54] hover:bg-[#003580] text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-background text-gray-400 dark:text-muted-foreground">OR</span>
                </div>
              </div>

              {/* JamiiPass Login */}
              <Button
                type="button"
                variant="outline"
                onClick={handleJamiiPassLogin}
                className="w-full h-11 border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 font-medium"
                disabled={isLoading}
              >
                <Image src="/pass.PNG" alt="JamiiPass" width={20} height={20} className="mr-2 object-contain" />
                Continue with JamiiPass
              </Button>
            </form>

            {/* Contact Admin */}
            <p className="text-left text-sm text-gray-600 dark:text-muted-foreground mt-6">
              Don't have an account?{" "}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Contact System Administrator
              </a>
            </p>
        </div>
      </div>
    </div>
  );
}

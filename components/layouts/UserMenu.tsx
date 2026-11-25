"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useAuth } from "@/contexts/auth-context";
import {
  canSwitchRole,
  getActiveRole,
  getHomePathForUser,
  getUserRoles,
} from "@/lib/auth-roles";
import {
  Check,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  RefreshCw,
  Settings,
  Sun,
  User,
  KeyRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { toast } from "sonner";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";

const translations = {
  en: {
    dashboard: "Dashboard",
    profile: "My Profile",
    darkMode: "Dark mode",
    settings: "Settings",
    changePassword: "Change Password",
    logout: "Logout",
    switchRole: "Switch Role",
    auto: "AUTO",
  },
  sw: {
    dashboard: "Dashibodi",
    profile: "Wasifu Wangu",
    darkMode: "Hali ya giza",
    settings: "Mipangilio",
    changePassword: "Badilisha Nenosiri",
    logout: "Toka",
    switchRole: "Badilisha Jukumu",
    auto: "KIOTOMATIKI",
  },
};

export function UserMenu() {
  const language = useLanguageStore((state) => state.language);
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const t = translations[language];
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  if (!isAuthenticated || !user?.email) {
    return null;
  }

  const userName = user.name || user.username || "User";
  const userEmail = user.email;
  const userAvatar = undefined;
  const homePath = getHomePathForUser(user);
  const roles = getUserRoles(user);
  const activeRole = getActiveRole(user);
  const multiRole = canSwitchRole(user);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleSwitch = (role: string) => {
    if (role === activeRole) return;
    switchRole(role);
    toast.success(`Switched to ${role}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-11 items-center gap-3 rounded-full border border-border bg-card px-3 pr-4 shadow-sm hover:bg-accent"
        >
          <Avatar className="size-8">
            <AvatarImage src={userAvatar || "/placeholder.png"} alt={userName} />
            <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground md:block">
            {userEmail}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 border-none shadow-2xl">
        <Link href={homePath}>
          <DropdownMenuItem className="cursor-pointer py-2.5">
            <LayoutDashboard className="text-muted-foreground mr-3 h-5 w-5" />
            <span>{t.dashboard}</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer py-2.5">
            <User className="text-muted-foreground mr-3 h-5 w-5" />
            <span>{t.profile}</span>
          </DropdownMenuItem>
        </Link>

        {multiRole && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer py-2.5">
                <RefreshCw className="text-muted-foreground mr-3 h-5 w-5" />
                <span>{t.switchRole}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {roles.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => handleSwitch(role)}
                    className="cursor-pointer"
                  >
                    <span className="flex-1">{role}</span>
                    {role === activeRole && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="cursor-pointer py-2.5"
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              {theme === "dark" ? (
                <Moon className="text-muted-foreground mr-3 h-5 w-5" />
              ) : (
                <Sun className="text-muted-foreground mr-3 h-5 w-5" />
              )}
              <span>{t.darkMode}</span>
            </div>
            <span className="text-primary text-xs font-semibold">{t.auto}</span>
          </div>
        </DropdownMenuItem>

        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer py-2.5">
            <Settings className="text-muted-foreground mr-3 h-5 w-5" />
            <span>{t.settings}</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={() => setIsChangePasswordOpen(true)}
          className="cursor-pointer py-2.5"
        >
          <KeyRound className="text-muted-foreground mr-3 h-5 w-5" />
          <span>{t.changePassword}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer py-2.5"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>{t.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </DropdownMenu>
  );
}

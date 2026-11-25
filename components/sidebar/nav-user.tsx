"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ChevronsUpDown, LogOut, Settings, User, KeyRound, Check, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";
import { canSwitchRole, getActiveRole, getUserRoles } from "@/lib/auth-roles";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout, switchRole } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const userName = user
    ? `${user.name || ""}`.trim() || user.username || "User"
    : "User";
  const userEmail = user?.email || "";
  const userAvatar = undefined;
  const roles = getUserRoles(user);
  const activeRole = getActiveRole(user);
  const multiRole = canSwitchRole(user);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

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
    <SidebarMenu>
      <SidebarMenuItem suppressHydrationWarning>
        <DropdownMenu>
          <DropdownMenuTrigger asChild suppressHydrationWarning>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white/10 hover:bg-white/10 text-white"
              suppressHydrationWarning
            >
              <Avatar className="h-10 w-10 rounded-full border-2 border-white/20">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="rounded-full text-xs font-semibold bg-white/20 text-white">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">{userName}</span>
                {userEmail && (
                  <span className="truncate text-xs text-white/70">{userEmail}</span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 text-white/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-[#003580] border-white/20"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full border-2 border-white/20">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="rounded-full text-xs font-semibold bg-white/20 text-white">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">{userName}</span>
                  {userEmail && (
                    <span className="truncate text-xs text-white/70">{userEmail}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-white/20" />

            {multiRole && (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 focus:text-white data-[state=open]:bg-white/10">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Switch Role
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-[#003580] border-white/20 text-white">
                    {roles.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => handleSwitch(role)}
                        className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                      >
                        <span className="flex-1">{role}</span>
                        {role === activeRole && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="bg-white/20" />
              </>
            )}

            <DropdownMenuItem asChild className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsChangePasswordOpen(true)}
              className="cursor-pointer text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/20" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer hover:bg-white/10 focus:bg-white/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </SidebarMenu>
  );
}

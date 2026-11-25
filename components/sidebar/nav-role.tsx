"use client";

import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/components/ui/sidebar";
import { canSwitchRole, getActiveRole, getUserRoles } from "@/lib/auth-roles";
import { Check, ChevronsUpDown, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function NavRole() {
  const { user, switchRole } = useAuth();
  const { state, isMobile } = useSidebar();

  if (state === "collapsed" || !user) {
    return null;
  }

  const activeRole = getActiveRole(user);
  const roles = getUserRoles(user);
  const multiRole = canSwitchRole(user);

  const handleSwitch = (role: string) => {
    if (role === activeRole) return;
    switchRole(role);
    toast.success(`Switched to ${role}`);
  };

  if (!multiRole) {
    return (
      <div className="flex items-center gap-3 rounded-md bg-white/10 px-3 py-2.5 text-white">
        <Shield className="h-5 w-5 shrink-0 text-white/80" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{activeRole}</span>
          <span className="truncate text-xs text-white/70">Active role</span>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md bg-white/10 px-3 py-2.5 text-left text-white transition-colors hover:bg-white/15"
        >
          <Shield className="h-5 w-5 shrink-0 text-white/80" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold">{activeRole}</span>
            <span className="truncate text-xs text-white/70">
              Switch role ({roles.length})
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        side={isMobile ? "bottom" : "right"}
        align="start"
        sideOffset={8}
      >
        <DropdownMenuLabel>Switch role</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

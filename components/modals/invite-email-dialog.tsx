"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface InviteEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  emailSent?: boolean;
  expiresHours?: number;
}

export function InviteEmailDialog({
  isOpen,
  onClose,
  email,
  emailSent = false,
  expiresHours = 48,
}: InviteEmailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {emailSent ? "Invitation email sent" : "Invitation email not sent"}
          </DialogTitle>
          <DialogDescription>
            {emailSent
              ? `A set-password link was emailed to this user. The link expires in ${expiresHours} hours.`
              : "The user was created, but the invitation email could not be sent. Ask them to use Forgot password on the login page, or try creating again after checking email settings."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="text-sm font-medium break-all">{email}</p>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

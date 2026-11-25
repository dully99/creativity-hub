"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Shield } from "lucide-react";
import { sectionService, Section } from "@/lib/api/section.service";
import { userService, User } from "@/lib/api/user.service";
import { departmentService, Department } from "@/lib/api/department.service";
import { toast } from "sonner";

interface ViewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
}

export function ViewSectionModal({
  isOpen,
  onClose,
  sectionId,
}: ViewSectionModalProps) {
  const [section, setSection] = useState<Section | null>(null);
  const [division, setDivision] = useState<Department | null>(null);
  const [head, setHead] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && sectionId) {
      fetchSectionDetails();
    }
  }, [isOpen, sectionId]);

  const fetchSectionDetails = async () => {
    try {
      setIsLoading(true);
      const sectionData = await sectionService.getSection(sectionId);
      setSection(sectionData);

      if (sectionData.division) {
        const divisionData = await departmentService.getDepartment(sectionData.division);
        setDivision(divisionData);
      }

      if (sectionData.head_of_section) {
        const userData = await userService.getUser(sectionData.head_of_section);
        setHead(userData);
      }
    } catch (error) {
      toast.error("Failed to load section details");
      console.error("Error fetching section details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Section Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : section ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-base font-medium">{section.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Code</label>
                  <p className="text-base font-medium">{section.code}</p>
                </div>
              </div>
              {section.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base">{section.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Division</h3>
              {division ? (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-base font-medium">{division.name}</p>
                  <p className="text-sm text-muted-foreground">{division.code}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No division assigned</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Head of Section
              </h3>
              {head ? (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-base font-medium">
                    {head.first_name} {head.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{head.email}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No head assigned</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Section not found</p>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

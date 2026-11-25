"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { projectService, Project, ProjectDivision } from "@/lib/api/project.service";

interface ViewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

function formatDivisions(divisions?: Project["responsible_divisions"]): string {
  if (!divisions?.length) return "—";
  return divisions
    .map((item) => {
      if (typeof item === "number") return String(item);
      const div = item as ProjectDivision;
      const type = div.type ? ` (${div.type})` : "";
      return `${div.name}${type}`;
    })
    .join(", ");
}

export function ViewProjectModal({ isOpen, onClose, projectId }: ViewProjectModalProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProject();
    }
  }, [isOpen, projectId]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getProject(projectId);
      setProject(data);
    } catch (err) {
      setError("Failed to load project details");
      console.error("Error fetching project:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
          <DialogDescription>View project information</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : project ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base font-semibold">{project.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={project.is_active ? "default" : "secondary"}>
                    {project.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reporting Duration</label>
                <p className="text-base">{project.reporting_duration_name || project.reporting_duration}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Plan Budget Type</label>
                <p className="text-base">{project.plan_budget_type_name || project.plan_budget_type}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Division/Unit</label>
              <p className="text-base">{formatDivisions(project.responsible_divisions)}</p>
            </div>
            {project.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-base">{project.description}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Project not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

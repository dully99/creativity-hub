"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { ViewProjectModal } from "@/components/modals/view-project-modal";
import { getProjectTanStackColumns } from "@/components/tables/columns/project-tanstack-columns";
import { projectService, Project } from "@/lib/api/project.service";
import {
  reportingDurationService,
  ReportingDuration,
} from "@/lib/api/reporting-duration.service";
import { planBudgetTypeService, PlanBudgetType, planBudgetTypeLabel } from "@/lib/api/plan-budget-type.service";
import { divisionService, Division } from "@/lib/api/division.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { toast } from "sonner";

function divisionOptionLabel(d: Division): string {
  const typeLabel =
    d.division_type === "unit"
      ? "Unit"
      : d.division_type === "department"
        ? "Division"
        : d.division_type
          ? d.division_type.charAt(0).toUpperCase() + d.division_type.slice(1)
          : "Division";
  return `${d.name} (${typeLabel})`;
}

function reportingDurationLabel(rd: ReportingDuration): string {
  const years =
    rd.start_year && rd.end_year ? `${rd.start_year} - ${rd.end_year}` : rd.start_date;
  return rd.ministry_name ? `${years} (${rd.ministry_name})` : String(years);
}

function getSelectedDivisionId(project: Project | null): string {
  if (!project?.responsible_divisions?.length) return "";
  const first = project.responsible_divisions[0];
  if (typeof first === "number") return first.toString();
  return first.id.toString();
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportingDurations, setReportingDurations] = useState<ReportingDuration[]>([]);
  const [planBudgetTypes, setPlanBudgetTypes] = useState<PlanBudgetType[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Project>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProjectId, setViewingProjectId] = useState<number>(0);

  const columns = getProjectTanStackColumns();

  const divisionUnitOptions = useMemo(
    () =>
      divisions.filter(
        (d) => d.division_type === "department" || d.division_type === "unit"
      ),
    [divisions]
  );

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    const [rdResult, pbtResult, divResult] = await Promise.allSettled([
      reportingDurationService.getReportingDurations(),
      planBudgetTypeService.listPlanBudgetTypes(),
      divisionService.getDivisions(),
    ]);

    if (rdResult.status === "fulfilled") {
      setReportingDurations(rdResult.value.results ?? []);
    } else {
      console.error("Error fetching reporting durations:", rdResult.reason);
      toast.error("Failed to load reporting durations");
    }

    if (pbtResult.status === "fulfilled") {
      setPlanBudgetTypes(pbtResult.value);
    } else {
      console.error("Error fetching plan budget types:", pbtResult.reason);
      toast.error("Failed to load plan budget types");
    }

    if (divResult.status === "fulfilled") {
      setDivisions(divResult.value);
    } else {
      console.error("Error fetching divisions:", divResult.reason);
      toast.error("Failed to load divisions/units");
    }
  };

  const fetchProjects = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await projectService.getProjectsPaginated(page, searchQuery);
      setProjects(response.results);
      setTotalCount(response.count);
    } catch (error) {
      toast.error("Failed to load projects");
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "plan_budget_type",
        label: "Plan Budget Type",
        type: "select" as const,
        options: planBudgetTypes
          .filter((p) => p.type?.toLowerCase() === "development")
          .map((p) => ({
            value: p.id.toString(),
            label: planBudgetTypeLabel(p),
          })),
        required: true,
      },
      {
        name: "reporting_duration",
        label: "Reporting Duration",
        type: "select" as const,
        options: reportingDurations.map((rd) => ({
          value: rd.id.toString(),
          label: reportingDurationLabel(rd),
        })),
        required: true,
      },
      {
        name: "responsible_division",
        label: "Division/Unit",
        type: "select" as const,
        options: divisionUnitOptions.map((d) => ({
          value: d.id.toString(),
          label: divisionOptionLabel(d),
        })),
        required: true,
      },
      {
        name: "name",
        label: "Name",
        type: "text" as const,
        placeholder: "Enter project name",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea" as const,
        placeholder: "Enter description",
        required: false,
      },
      {
        name: "is_active",
        label: "Is Active",
        type: "select" as const,
        options: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
        required: true,
      },
    ],
    [reportingDurations, planBudgetTypes, divisionUnitOptions]
  );

  const handleAdd = () => {
    setEditingProject(null);
    void fetchDropdownData();
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    void fetchDropdownData();
    setIsModalOpen(true);
  };

  const handleDelete = (project: Project) => confirmDelete(project);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await projectService.deleteProject(deleteDialog.item.id);
      toast.success("Project deleted successfully");
      closeDelete();
      fetchProjects(currentPage);
    } catch (error) {
      toast.error("Failed to delete project");
      closeDelete();
      console.error("Error deleting project:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (project: Project) => {
    setViewingProjectId(project.id);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        plan_budget_type: parseInt(data.plan_budget_type, 10),
        reporting_duration: parseInt(data.reporting_duration, 10),
        responsible_divisions: [parseInt(data.responsible_division, 10)],
        name: data.name,
        description: data.description || undefined,
        is_active: data.is_active === "true",
      };

      if (editingProject) {
        await projectService.updateProject(editingProject.id, payload);
        toast.success("Project updated successfully");
      } else {
        await projectService.createProject(payload);
        toast.success("Project created successfully");
      }

      fetchProjects(currentPage);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingProject ? "Failed to update project" : "Failed to create project");
      console.error("Error submitting project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingProject) {
      const developmentBudgetType = planBudgetTypes.find(
        (p) => p.type?.toLowerCase() === "development"
      );
      return {
        is_active: "true",
        plan_budget_type: developmentBudgetType?.id.toString() ?? "",
      };
    }
    return {
      plan_budget_type: editingProject.plan_budget_type?.toString() ?? "",
      reporting_duration: editingProject.reporting_duration?.toString() ?? "",
      responsible_division: getSelectedDivisionId(editingProject),
      name: editingProject.name,
      description: editingProject.description || "",
      is_active: editingProject.is_active ? "true" : "false",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Projects" description="Manage Planning Projects" />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={projects}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              searchPlaceholder="Search projects..."
              totalCount={totalCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onSearchChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
            
              isLoading={isLoading}
            />
        </CardContent>
      </Card>

      <FormModal
        key={`project-form-${planBudgetTypes.length}-${divisions.length}-${editingProject?.id ?? "new"}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project" : "Add Project"}
        description={editingProject ? "Update project information" : "Create a new project"}
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ViewProjectModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        projectId={viewingProjectId}
      />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Project"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}

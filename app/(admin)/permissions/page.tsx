"use client";

import { useState, useEffect } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { getPermissionsTanStackColumns } from "@/components/tables/columns/permissions-tanstack-columns";
import { useLanguageStore } from "@/store/useLanguageStore";
import { permissionService, Permission } from "@/lib/api/permission.service";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const translations = {
  en: {
    title: "Permissions",
    description: "Manage system permissions and access control",
    name: "Permission Name",
    desc: "Description",
    module: "Module",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    addPermission: "Add Permission",
  },
  sw: {
    title: "Ruhusa",
    description: "Simamia ruhusa za mfumo na udhibiti wa ufikiaji",
    name: "Jina la Ruhusa",
    desc: "Maelezo",
    module: "Moduli",
    status: "Hali",
    active: "Hai",
    inactive: "Haifanyi kazi",
    addPermission: "Ongeza Ruhusa",
  },
};

export default function PermissionsPage() {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [appLabelFilter, setAppLabelFilter] = useState("");

  const columns = getPermissionsTanStackColumns(t);

  useEffect(() => {
    fetchPermissions(appLabelFilter || undefined, currentPage);
  }, [currentPage, searchQuery, appLabelFilter]);

  const fetchPermissions = async (appLabel?: string, page = 1) => {
    try {
      setIsLoading(true);
      const data = await permissionService.getPermissionsPaginated(
        { app_label: appLabel, page, search: searchQuery }
      );
      setPermissions(data.results);
      setTotalCount(data.count);
    } catch (error) {
      toast.error("Failed to load permissions");
      console.error("Error fetching permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchPermissions(appLabelFilter || undefined, 1);
  };

  const handleClearFilter = () => {
    setAppLabelFilter("");
    setCurrentPage(1);
    fetchPermissions(undefined, 1);
  };

  const handleEdit = (permission: Permission) => {
    toast.info("Permissions are read-only");
  };

  const handleDelete = (permission: Permission) => {
    toast.info("Permissions are read-only and cannot be deleted");
  };

  return (
    <div className="space-y-6">
      <PageHeading title={t.title} description={t.description} />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={permissions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchKey="name"
              searchPlaceholder={`Search ${t.title.toLowerCase()}...`}
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
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && user) {
      // Check role requirement
      if (requiredRole && user.role !== requiredRole) {
        router.push("/users");
        return;
      }

      // Check permissions requirement
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.every((permission) =>
          user.permissions.includes(permission)
        );

        if (!hasPermission) {
          router.push("/users");
          return;
        }
      }
    }
  }, [isLoading, user, requiredRole, requiredPermissions, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

import { env } from "@/lib/env";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role: string;
  roles: string[];
  permissions: string[];
  is_superuser?: boolean;
  is_staff?: boolean;
  is_verified?: boolean;
  password_reset_required?: boolean;
  profile_picture?: string | null;
  phone_number?: string;
  gender?: "M" | "F" | "O";
  national_id_number?: string;
  date_of_birth?: string;
  nationality?: string;
  job_title?: string;
  ministry?: number | null;
  department?: number | null;
  unit?: number | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

function resolveActiveRole(roles: string[], isSuperuser: boolean): string {
  const membership =
    isSuperuser && !roles.includes("SuperAdmin") ? ["SuperAdmin", ...roles] : [...roles];
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("active_role");
    if (stored && membership.includes(stored)) {
      return stored;
    }
  }
  if (isSuperuser) return "SuperAdmin";
  return membership[0] || "user";
}

function mapBackendUser(data: Record<string, unknown>, fallbackEmail = ""): User {
  const roles = Array.isArray(data.roles) ? (data.roles as string[]) : [];
  const firstName = String(data.first_name ?? "");
  const lastName = String(data.last_name ?? "");
  const email = String(data.email ?? fallbackEmail);
  const isSuperuser = Boolean(data.is_superuser);
  const membership =
    isSuperuser && !roles.includes("SuperAdmin") ? ["SuperAdmin", ...roles] : roles;
  const activeRole = resolveActiveRole(roles, isSuperuser);

  const toOptionalString = (value: unknown) => {
    if (value === undefined || value === null || value === "") return undefined;
    return String(value);
  };

  const toOptionalNumber = (value: unknown) => {
    if (value === undefined || value === null) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  const gender = data.gender;

  return {
    id: String(data.id ?? ""),
    username: String(data.username ?? email.split("@")[0] ?? ""),
    email,
    name: `${firstName} ${lastName}`.trim() || String(data.name ?? email),
    first_name: firstName || undefined,
    last_name: lastName || undefined,
    role: activeRole,
    roles: membership,
    permissions: Array.isArray(data.permissions) ? (data.permissions as string[]) : [],
    is_superuser: isSuperuser,
    is_staff: Boolean(data.is_staff),
    is_verified: Boolean(data.is_verified),
    password_reset_required: Boolean(data.password_reset_required),
    profile_picture: data.profile_picture as string | null | undefined,
    phone_number: toOptionalString(data.phone_number),
    gender: gender === "M" || gender === "F" || gender === "O" ? gender : undefined,
    national_id_number: toOptionalString(data.national_id_number),
    date_of_birth: toOptionalString(data.date_of_birth),
    nationality: toOptionalString(data.nationality),
    job_title: toOptionalString(data.job_title),
    ministry: toOptionalNumber(data.ministry),
    department: toOptionalNumber(data.department ?? data.division),
    unit: toOptionalNumber(data.unit ?? data.position),
  };
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_API_BASE_URL;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1.0/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      const userPayload =
        data.user && typeof data.user === "object"
          ? (data.user as Record<string, unknown>)
          : (data as Record<string, unknown>);

      const authResponse: AuthResponse = {
        token: data.access,
        refreshToken: data.refresh,
        user: mapBackendUser(userPayload, credentials.email),
      };

      this.setToken(authResponse.token);
      if (authResponse.refreshToken) {
        this.setRefreshToken(authResponse.refreshToken);
      }
      this.setUser(authResponse.user);

      return authResponse;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Login with JamiiPass
   */
  async loginWithJamiiPass(): Promise<AuthResponse> {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const jamiiPassUrl = `${this.baseUrl}/auth/jamiipass?redirect_uri=${encodeURIComponent(redirectUri)}`;

      window.location.href = jamiiPassUrl;

      return {} as AuthResponse;
    } catch (error) {
      console.error("JamiiPass login error:", error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "OAuth callback failed");
      }

      const data: AuthResponse = await response.json();

      this.setToken(data.token);
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken);
      }
      this.setUser(data.user);

      return data;
    } catch (error) {
      console.error("OAuth callback error:", error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();

      if (refreshToken) {
        await fetch(`${this.baseUrl}/v1.0/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();

      if (!token) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/v1.0/auth/profile/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.clearAuth();
        }
        return null;
      }

      const data = await response.json();
      const payload =
        data && typeof data === "object" && "data" in data && data.data
          ? (data.data as Record<string, unknown>)
          : (data as Record<string, unknown>);

      const user = mapBackendUser(payload);
      this.setUser(user);

      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/v1.0/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        this.clearAuth();
        return null;
      }

      const data = await response.json();
      this.setToken(data.access);

      if (data.refresh) {
        this.setRefreshToken(data.refresh);
      }

      return data.access;
    } catch (error) {
      console.error("Refresh token error:", error);
      this.clearAuth();
      return null;
    }
  }

  /**
   * Request a password reset email (link).
   */
  async requestPasswordReset(email: string): Promise<{ email: string }> {
    const response = await fetch(`${this.baseUrl}/v1.0/auth/forgot-password/request/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data.message ||
          "No account was found with this email address. Please contact the administration for assistance."
      );
    }
    return { email: data?.data?.email ?? email };
  }

  /**
   * Validate a reset token and return the associated email.
   */
  async validatePasswordResetToken(token: string): Promise<{ email: string; valid: boolean }> {
    const response = await fetch(`${this.baseUrl}/v1.0/auth/forgot-password/validate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data.message ||
          "This password reset link is invalid or has expired. Please request a new one."
      );
    }
    return {
      email: String(data?.data?.email ?? ""),
      valid: Boolean(data?.data?.valid),
    };
  }

  /**
   * Reset password with email + token; stores session tokens on success.
   */
  async resetPasswordWithToken(payload: {
    email: string;
    token: string;
    new_password: string;
    confirm_password: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/v1.0/auth/forgot-password/reset/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Password reset failed");
    }

    const authData = data?.data ?? data;
    const userPayload =
      authData.user && typeof authData.user === "object"
        ? (authData.user as Record<string, unknown>)
        : {};

    const authResponse: AuthResponse = {
      token: authData.access,
      refreshToken: authData.refresh,
      user: mapBackendUser(userPayload, payload.email),
    };

    this.setToken(authResponse.token);
    if (authResponse.refreshToken) {
      this.setRefreshToken(authResponse.refreshToken);
    }
    this.setUser(authResponse.user);

    return authResponse;
  }

  // Token management
  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("refresh_token", token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refresh_token");
    }
    return null;
  }

  setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role) {
        localStorage.setItem("active_role", user.role);
      }
    }
  }

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Switch the active workspace role (must be one of the user's assigned roles).
   */
  switchActiveRole(role: string): User {
    const user = this.getUser();
    if (!user) {
      throw new Error("Not authenticated");
    }
    if (!user.roles.includes(role)) {
      throw new Error("You do not have that role");
    }
    const updated = { ...user, role };
    this.setUser(updated);
    return updated;
  }

  clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("active_role");
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Change user password
   */
  async changePassword(data: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${this.baseUrl}/v1.0/auth/password-reset/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.detail || "Password change failed");
      }
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();

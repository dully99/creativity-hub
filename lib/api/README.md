# Authentication Service Documentation

## Overview
This authentication service provides a complete solution for user authentication, including login, logout, token management, and protected routes.

## Files Structure

```
lib/api/
├── auth.service.ts    # Authentication service with API calls
├── api-client.ts      # Generic API client with auto token refresh
└── README.md          # This file

contexts/
└── auth-context.tsx   # React context for auth state management

components/auth/
└── protected-route.tsx # Component for protecting routes
```

## Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TOKEN=
NEXT_PUBLIC_API_KEY=
```

## Usage

### 1. Authentication Context

The `AuthProvider` is already added to the root layout. It provides:

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithJamiiPass: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

### 2. Using Auth in Components

```typescript
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: "user", password: "pass" });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 3. Protected Routes

Wrap any page that requires authentication:

```typescript
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

With role/permission requirements:

```typescript
<ProtectedRoute 
  requiredRole="admin"
  requiredPermissions={["users.edit", "users.delete"]}
>
  <div>Admin only content</div>
</ProtectedRoute>
```

### 4. Making Authenticated API Calls

Use the `apiClient` for all API requests:

```typescript
import { apiClient } from "@/lib/api/api-client";

// GET request
const users = await apiClient.get<User[]>("/users");

// POST request
const newUser = await apiClient.post<User>("/users", {
  name: "John Doe",
  email: "john@example.com"
});

// PUT request
const updated = await apiClient.put<User>(`/users/${id}`, userData);

// DELETE request
await apiClient.delete(`/users/${id}`);

// Public endpoint (no auth required)
const data = await apiClient.get("/public/data", { requiresAuth: false });
```

### 5. Auth Service Methods

Direct access to auth service (usually not needed):

```typescript
import { authService } from "@/lib/api/auth.service";

// Login
const response = await authService.login({
  username: "user",
  password: "pass",
  rememberMe: true
});

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();

// Refresh token
const newToken = await authService.refreshToken();

// Password reset
await authService.requestPasswordReset("user@example.com");
await authService.resetPassword(token, newPassword);

// Token management
const token = authService.getToken();
const user = authService.getUser();
const isAuth = authService.isAuthenticated();
```

## Backend API Endpoints Expected

Your backend should implement these endpoints:

### Authentication
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### JamiiPass OAuth
- `GET /api/auth/jamiipass` - Redirect to JamiiPass
- `POST /api/auth/callback` - Handle OAuth callback

## Request/Response Formats

### Login Request
```json
{
  "username": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

### Login Response
```json
{
  "user": {
    "id": "123",
    "username": "user",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "permissions": ["users.read", "users.write"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here"
}
```

## Token Storage

Tokens are stored in localStorage:
- `auth_token` - Access token (JWT)
- `refresh_token` - Refresh token
- `user` - User object (JSON)

## Auto Token Refresh

The `apiClient` automatically:
1. Detects 401 Unauthorized responses
2. Attempts to refresh the token
3. Retries the original request
4. Redirects to login if refresh fails

## Security Best Practices

1. **HTTPS Only** - Always use HTTPS in production
2. **Token Expiry** - Set appropriate token expiration times
3. **Refresh Tokens** - Use refresh tokens for long sessions
4. **Logout on Close** - Clear tokens on browser close (don't use rememberMe for sensitive apps)
5. **CORS** - Configure proper CORS on backend
6. **XSS Protection** - Sanitize all user inputs

## Error Handling

All auth methods throw errors that should be caught:

```typescript
try {
  await login(credentials);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

## Testing

For development, you can mock the auth service:

```typescript
// Mock successful login
jest.mock("@/lib/api/auth.service", () => ({
  authService: {
    login: jest.fn().mockResolvedValue({
      user: mockUser,
      token: "mock_token"
    })
  }
}));
```

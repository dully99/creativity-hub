export interface DashboardStats {
  totalItems: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  activeProjects: number;
  totalUsers: number;
}

export type DashboardActivityType =
  | "item_submitted"
  | "item_approved"
  | "item_rejected"
  | "project_created"
  | "user_registered";

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface RecentItem {
  id: string;
  name: string;
  owner: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  updatedAt: string;
}

export const mockDashboardStats: DashboardStats = {
  totalItems: 128,
  pendingReview: 14,
  approved: 98,
  rejected: 16,
  activeProjects: 6,
  totalUsers: 342,
};

export const mockActivities: DashboardActivity[] = [
  {
    id: "1",
    type: "item_submitted",
    title: "New submission received",
    description: "Alpha Project was submitted for review",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user: "Jane Doe",
  },
  {
    id: "2",
    type: "item_approved",
    title: "Submission approved",
    description: "Beta Initiative passed final review",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: "John Smith",
  },
  {
    id: "3",
    type: "project_created",
    title: "Project created",
    description: "Q2 Growth Program was published",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: "Admin",
  },
  {
    id: "4",
    type: "user_registered",
    title: "New user registered",
    description: "A new team member joined the workspace",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "5",
    type: "item_rejected",
    title: "Submission rejected",
    description: "Gamma Corp needs additional documentation",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    user: "Reviewer",
  },
];

export const mockRecentItems: RecentItem[] = [
  {
    id: "1",
    name: "Alpha Project",
    owner: "Jane Doe",
    category: "Technology",
    status: "pending",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    name: "Beta Initiative",
    owner: "John Smith",
    category: "Healthcare",
    status: "approved",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "3",
    name: "Gamma Corp",
    owner: "Alice Johnson",
    category: "Finance",
    status: "rejected",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "4",
    name: "Delta Labs",
    owner: "Bob Wilson",
    category: "Education",
    status: "approved",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "5",
    name: "Epsilon Ventures",
    owner: "Carol Brown",
    category: "Agriculture",
    status: "pending",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

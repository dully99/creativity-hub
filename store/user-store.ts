import { create } from "zustand";

export interface SkeletonUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  preferred_username?: string;
  photo?: string;
}

interface UserStore {
  user: SkeletonUser | null;
  isAuthenticated: boolean;
  setUser: (user: SkeletonUser | null) => void;
}

const defaultUser: SkeletonUser = {
  id: "1",
  first_name: "Demo",
  last_name: "User",
  email: "demo@example.com",
  preferred_username: "demo",
};

export const useUserStore = create<UserStore>((set) => ({
  user: defaultUser,
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

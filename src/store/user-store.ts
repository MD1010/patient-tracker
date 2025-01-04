import { Doc } from "../../convex/_generated/dataModel";
import { create } from "zustand";

export type AppUser = {
  userId: Pick<Doc<"users">, "userId">["userId"];
  googleTokens: Pick<Doc<"users">, "googleAuth">["googleAuth"];
  authToken: string;
};

interface UsersState {
  activeUser: AppUser | null;
  setActiveUser: (user: AppUser) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  activeUser: null,
  setActiveUser: (user) => set({ activeUser: user }),
}));

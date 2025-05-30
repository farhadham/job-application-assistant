import { create } from "zustand";

import { UserType } from "@/types";

interface UserState {
  user: UserType;
  setUser: (userData: UserType) => void;
  isLoaded: boolean;
  setIsLoaded: (isLoaded: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    email: "",
    geminiKey: "",
    name: "",
    resumeContent1: "",
    resumeContent2: "",
    resumeContent3: "",
    coverLetterPrompt: "",
  },
  isLoaded: false,
  setUser: (user) => set({ user }),
  setIsLoaded: (isLoaded) => set({ isLoaded }),
}));

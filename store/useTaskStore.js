import { create } from "zustand";

export const useTaskStore = create((set) => ({
  search: "",
  setSearch: (value) => set({ search: value }),
}));

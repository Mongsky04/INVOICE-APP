import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  user_id: string;
  username: string;
  role: string;
  exp: number;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  role: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      username: null,
      role: null,
      setToken: (token: string) => {
        Cookies.set("token", token, { expires: 1 });
        const decoded = jwtDecode<JWTPayload>(token);
        set({
          token,
          userId: decoded.user_id,
          username: decoded.username,
          role: decoded.role,
        });
      },
      logout: () => {
        Cookies.remove("token");
        set({ token: null, userId: null, username: null, role: null });
      },
      isAuthenticated: () => {
        const { token } = get();
        if (!token) return false;
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          return decoded.exp * 1000 > Date.now();
        } catch {
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

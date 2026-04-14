"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { users, userRoles, personProfiles, mockCredentials } from "@/lib/mock-data";
import type { User, PersonProfile, Role } from "@/lib/types";

interface AuthState {
  currentUser: User | null;
  currentRole: Role | null;
  profile: PersonProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; role: Role | null };
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<PersonProfile | null>(null);

  const login = useCallback((email: string, _password: string) => {
    const cred = mockCredentials[email];
    if (!cred) return { success: false, role: null };

    const user = users.find(u => u.id === cred.userId);
    if (!user) return { success: false, role: null };

    const role = userRoles.find(r => r.userId === user.id && r.isDefault);
    const prof = personProfiles.find(p => p.userId === user.id);

    setCurrentUser(user);
    setCurrentRole(role?.role ?? cred.role);
    setProfile(prof ?? null);

    return { success: true, role: role?.role ?? cred.role };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentRole(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, profile, isAuthenticated: !!currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

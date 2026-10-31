/* Student and teacher accounts (Supabase Auth, email + password).
 * The role comes from the `profiles` table, which the database fills in on sign-up:
 * emails listed in `teacher_emails` become teachers, everyone else is a student.
 * Without Supabase configured, `enabled` is false and the site keeps its old name-only mode. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { clearAccountCaches } from "../domain/tracking";
import { supabase } from "./supabase";

export type Role = "student" | "teacher";
export type Profile = { id: string; name: string; email: string; role: Role };

type Result = { error?: string; notice?: string };

export type Auth = {
  /** False when Supabase is not configured (accounts are unavailable). */
  enabled: boolean;
  /** True until the stored session (if any) has been checked. */
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  /** The user arrived from a password-reset email and should choose a new password. */
  recovering: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (name: string, email: string, password: string) => Promise<Result>;
  sendReset: (email: string) => Promise<Result>;
  setNewPassword: (password: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

const friendly = (message: string) =>
  /invalid login/i.test(message)
    ? "That email and password don't match an account."
    : /email not confirmed/i.test(message)
      ? "Please confirm your email first — check your inbox for the link."
      : /already registered|already exists/i.test(message)
        ? "An account with this email already exists. Sign in instead."
        : message;

const back = () => `${window.location.origin}/signin`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(!!supabase);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Load the profile (name and role) whenever the signed-in user changes.
  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }
    let alive = true;
    void supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        // Fall back to the sign-up details if the profile row is missing (schema not run yet).
        setProfile(
          (data as Profile | null) ?? {
            id: user.id,
            name:
              (user.user_metadata?.full_name as string) ||
              user.email?.split("@")[0] ||
              "Student",
            email: user.email ?? "",
            role: "student",
          },
        );
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<Result> => {
      const { error } = await supabase!.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return error ? { error: friendly(error.message) } : {};
    },
    [],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<Result> => {
      const { data, error } = await supabase!.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: back() },
      });
      if (error) return { error: friendly(error.message) };
      return data.session
        ? {}
        : {
            notice: `We sent a confirmation link to ${email.trim()}. Open it, then sign in.`,
          };
    },
    [],
  );

  const sendReset = useCallback(async (email: string): Promise<Result> => {
    const { error } = await supabase!.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: back(),
    });
    return error
      ? { error: friendly(error.message) }
      : {
          notice: `If an account exists for ${email.trim()}, a reset link is on its way.`,
        };
  }, []);

  const setNewPassword = useCallback(
    async (password: string): Promise<Result> => {
      const { error } = await supabase!.auth.updateUser({ password });
      if (error) return { error: friendly(error.message) };
      setRecovering(false);
      return { notice: "Password updated. You're signed in." };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    clearAccountCaches();
    setRecovering(false);
  }, []);

  const value = useMemo<Auth>(
    () => ({
      enabled: !!supabase,
      loading,
      user,
      profile,
      recovering,
      signIn,
      signUp,
      sendReset,
      setNewPassword,
      signOut,
    }),
    [
      loading,
      user,
      profile,
      recovering,
      signIn,
      signUp,
      sendReset,
      setNewPassword,
      signOut,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const a = useContext(AuthContext);
  if (!a) throw new Error("useAuth must be used inside <AuthProvider>");
  return a;
}

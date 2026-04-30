import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../lib/firebase";
import { checkBlocked, registerOrUpdateUser } from "../lib/auth";
import { getUserProfile } from "../lib/firestore";
import { ADMIN_EMAIL } from "../constants";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isBlocked: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isBlocked: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    isLoading: true,
    isBlocked: false,
    isAdmin: false,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser || !fbUser.email) {
        setState({
          user: null,
          firebaseUser: null,
          isLoading: false,
          isBlocked: false,
          isAdmin: false,
        });
        return;
      }

      try {
        const blocked = await checkBlocked(fbUser.email);
        if (blocked) {
          setState({
            user: null,
            firebaseUser: fbUser,
            isLoading: false,
            isBlocked: true,
            isAdmin: false,
          });
          return;
        }

        await registerOrUpdateUser(fbUser);
        const profile = await getUserProfile(fbUser.uid);

        setState({
          user: profile,
          firebaseUser: fbUser,
          isLoading: false,
          isBlocked: false,
          isAdmin: fbUser.email === ADMIN_EMAIL,
        });
      } catch {
        setState({
          user: null,
          firebaseUser: fbUser,
          isLoading: false,
          isBlocked: false,
          isAdmin: false,
        });
      }
    });
    return unsub;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

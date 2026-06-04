import { deleteToken, getToken } from "@/api/client";
import { getItem, removeItem } from "@/api/storage";
import { AuthContextType } from "@/constants/types";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [name, setName] = useState<string | undefined>();
  const [mail, setMail] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const storedToken = await getToken();
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
        }
        const storedName = await getItem("name");
        const storedEmail = await getItem("email");
        setName(storedName ?? undefined);
        setMail(storedEmail ?? undefined);
      } catch (e: any) {
        console.error("Failed to load user from secure storage", e.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    await deleteToken();
    await removeItem("name");
    await removeItem("email");
    await removeItem("authenticated");

    setName(undefined);
    setMail(undefined);
    setToken(undefined);
    setIsAuthenticated(false);
  };
  return (
    <AuthContext.Provider
      value={{
        name,
        token,
        mail,
        isLoading,
        logout,
        isAuthenticated,
        setIsAuthenticated,
        setName,
        setToken,
        setMail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

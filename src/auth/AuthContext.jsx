import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const applySession = useCallback((token, nextUser) => {
    localStorage.setItem("token", token);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await api.post("/auth/login", { email, password });
      applySession(res.data.token, res.data.user);
      return res.data.user;
    },
    [applySession]
  );

  const registerJobSeeker = useCallback(
    async (payload) => {
      const res = await api.post("/auth/register/jobseeker", payload);
      applySession(res.data.token, res.data.user);
      return res.data.user;
    },
    [applySession]
  );

  const registerEmployer = useCallback(
    async (payload) => {
      const res = await api.post("/auth/register/employer", payload);
      applySession(res.data.token, res.data.user);
      return res.data.user;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, registerJobSeeker, registerEmployer, logout, setUser }),
    [user, loading, login, registerJobSeeker, registerEmployer, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

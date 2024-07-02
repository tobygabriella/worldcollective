import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_KEY}/protected`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Not authenticated", error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    document.cookie = "token=; Max-Age=0; path=/; domain=localhost";
    navigate("/");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

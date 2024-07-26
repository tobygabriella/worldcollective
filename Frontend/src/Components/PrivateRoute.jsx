import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Contexts/AuthContext";

const PrivateRoute = ({ element: Element, ...rest }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return isAuthenticated ? (
    <Element {...rest} />
  ) : (
    <Navigate to="/login" state={{ from: location }} />
  );
};

export default PrivateRoute;

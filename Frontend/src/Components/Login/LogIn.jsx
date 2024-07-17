import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import "./Login.css";
import AuthHeader from "../Headers/AuthHeader";

const backendApi = import.meta.env.VITE_BACKEND_ADDRESS;

const LogIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendApi}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token, user } = await response.json();
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);
        login(user);
        navigate("/");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="loginContainer">
      <header className="loginHeader">
        <AuthHeader />
      </header>
      <div className="loginBody">
        <div className="loginCircle"></div>
        <div className="signupPrompt">
          Don’t have an account?{" "}
          <Link to={"/register"} className="signupLink">
            Sign up
          </Link>
        </div>
        <form className="loginForm" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="inputField"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="inputField"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="loginButton">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;

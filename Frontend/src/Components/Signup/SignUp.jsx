import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import "./SignUp.css";
import AuthHeader from "../Headers/AuthHeader";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_KEY}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        login(user);

        navigate("/");
      } else {
        setError("User already exists. Please try another username or log in");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signupContainer">
      <header className="signupHeader">
        <AuthHeader />
      </header>
      <div className="signupBody">
        <div className="circle"></div>
        <div className="loginPrompt">
          Already have an account?{" "}
          <Link to={"/login"} className="viewButton">
            Log in
          </Link>
        </div>
        <form className="signupForm" onSubmit={handleSignup}>
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
          <button type="submit" className="signupButton">
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;

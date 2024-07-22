import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./SignUp.css";
import AuthHeader from "../Headers/AuthHeader";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [lastname, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        body: JSON.stringify({
          username,
          password,
          email,
          firstname,
          lastname,
        }),
      });

      if (response.ok) {
        setSuccess(
          "Registration successful! Please check your email to verify your account."
        );
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
        <div className="signupCircle"></div>
        <div className="loginPrompt">
          Already have an account?{" "}
          <Link to={"/login"} className="viewButton">
            Log in
          </Link>
        </div>
        <form className="signupForm" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="First Name"
            className="inputField"
            value={firstname}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            className="inputField"
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="inputField"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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
          {success && <p className="success">{success}</p>}
          <button type="submit" className="signupButton">
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;

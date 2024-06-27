import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import './Login.css';

const backendApi = import.meta.env.VITE_BACKEND_ADDRESS;

const LogIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendApi}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token, user } = await response.json();
        login(user);
        navigate('/');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.log(err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="loginContainer">
      <header className="loginHeader">
        <div className="appName">World Collection</div>
        <div className="authLinks">
          <a href="/login">Log in</a>
          <a href="/register">Sign up</a>
        </div>
      </header>
      <div className="loginBody">
        <div className="circle"></div>
        <div className="signupPrompt">
          Don’t have an account? <a href="/register" className="signupLink">Sign up</a>
        </div>
        <form className="loginForm" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="inputField"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="inputField"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="loginButton">Log in</button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;

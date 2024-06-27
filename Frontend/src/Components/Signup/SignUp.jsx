import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './SignUp.css';

const backendApi = import.meta.env.VITE_BACKEND_ADDRESS

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendApi}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        navigate('/'); 
      } else {
        setError('User already exists. Please try another username or log in');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="signupContainer">
      <header className="signupHeader">
        <div className="appName">World Collection</div>
        <div className="authLinks">
          <a href="/login">Log in</a>
          <a href="/register">Sign up</a>
        </div>
      </header>
      <div className="signupBody">
        <div className="circle"></div>
        <div className="loginPrompt">
          Already have an account? <Link to={"/login"} className="viewButton" >Log in</Link>
        </div>
        <form className="signupForm" onSubmit={handleSignup}>
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
          <button type="submit" className="signupButton">Sign up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;

import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "/Users/tobygabriella/Desktop/MetaU Projects/world-collective/Frontend/src/Components/Contexts/AuthContext.jsx";

import "./App.css";

const Home = lazy(() => import("./Components/Home/Home.jsx"));
const LogIn = lazy(() => import("./Components/Login/LogIn.jsx"));
const SignUp = lazy(() => import("./Components/Signup/SignUp.jsx"));
const UserProfile = lazy(() =>
  import("./Components/UserProfile/UserProfile.jsx")
);
const CreateListing = lazy(() =>
  import("./Components/CreateListing/CreateListing.jsx")
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<LogIn />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/" element={<Home />} />
            <Route path="/userProfile" element={<UserProfile />} />
            <Route path="/createListing" element={<CreateListing />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;

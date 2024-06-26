import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '/Users/tobygabriella/Desktop/MetaU Projects/world-collective/Frontend/src/Components/AuthContext.jsx';
import Home from './Components/Home';
import LogIn from './Components/LogIn';
import SignUp from './Components/SignUp';


function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login"element={<LogIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/" element={<Home />} /> 
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App

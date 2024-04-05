import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login'
import EmployeePage from './pages/employees/Employee';
import { Navigate } from 'react-router-dom';

function App() {
  // const [count, setCount] = useState(0)
  const isLoggedIn = !!localStorage.getItem('accessToken');
  console.log("loggin on app.tsx ",isLoggedIn)

  return (
    <>
     <Router>
      <Routes>
        {isLoggedIn ? (
          <Route path="/" element={<Navigate to="/employee" />} />
        ) : (
          // Render Login page if not logged in
          <Route path="/" element={<Login />} />
        )}
        {/* Route to EmployeePage */}
        <Route path="/employee" element={<EmployeePage />} />
        {isLoggedIn && <Route path="/login" element={<Navigate to="/employee" />} />}
      </Routes>
    </Router>
    </>
  )
}

export default App

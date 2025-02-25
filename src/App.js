import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));


    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedToken && !token) {
            console.log('Restoring token from localStorage:', storedToken); // Debug
            setToken(storedToken);
            setUser(storedUser);
        }
    }, []);

    const handleLogin = (newToken, newUser) => {
        console.log('Login - New token:', newToken); // Debug
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const handleLogout = () => {
        console.log('Logging out...'); // Debug
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
                />
                <Route
                    path="/dashboard"
                    element={token ? <Dashboard token={token} user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/"
                    element={<Navigate to={token ? "/dashboard" : "/login"} />}
                />
            </Routes>
        </Router>
    );
}

export default App;
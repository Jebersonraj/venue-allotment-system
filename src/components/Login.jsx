import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../styles.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', { email, password });
            const token = response.data.token;
            const decoded = jwtDecode(token);
            const user = { faculty_id: decoded.faculty_id, is_admin: decoded.is_admin };
            onLogin(token, user);
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="login-page">
            <div className="card">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Mobile Number"
                        required
                    />
                    <button type="submit" className="primary-btn">Login</button>
                </form>
                {error && <p className="error-text">{error}</p>}
            </div>
        </div>
    );
};

export default Login;
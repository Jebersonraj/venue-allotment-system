import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles.css';

const Dashboard = ({ token, user, onLogout }) => {
    const [assignment, setAssignment] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [facultyFile, setFacultyFile] = useState(null);
    const [venueFile, setVenueFile] = useState(null);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const response = await axios.get('http://localhost:5000/assignment', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignment(response.data.venue_id);
            } catch (err) {
                console.error('Error fetching assignment:', err);
            }
        };
        if (token) fetchAssignment();
    }, [token]);

    const handleAllocate = async () => {
        setLoading(true);
        setMessage('');
        try {
            await axios.post('http://localhost:5000/allocate', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Allocation completed successfully');
            if (!user.is_admin) {
                const response = await axios.get('http://localhost:5000/assignment', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignment(response.data.venue_id);
            }
        } catch (err) {
            setMessage(err.response?.data.error || 'Error during allocation');
            if (err.response?.data.error === 'Invalid token') {
                setTimeout(() => onLogout(), 2000);
            }
        }
        setLoading(false);
    };

    const handleFileUpload = async (endpoint, file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(`http://localhost:5000${endpoint}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage(response.data);
        } catch (err) {
            setMessage(err.response?.data.error || 'Error uploading file');
        }
    };

    const handleDownload = async () => {
        try {
            const response = await axios.get('http://localhost:5000/download-allocation', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'allocation.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setMessage('Allocation list downloaded successfully');
        } catch (err) {
            setMessage('Error downloading allocation list');
        }
    };

    return (
        <div className="dashboard-page">
            <div className="card">
                <h2>Dashboard</h2>
                <button onClick={onLogout} className="secondary-btn">Logout</button>
                {user.is_admin ? (
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={(e) => setFacultyFile(e.target.files[0])}
                            />
                            <button
                                onClick={() => handleFileUpload('/add-faculty', facultyFile)}
                                disabled={!facultyFile || loading}
                                className={loading ? 'disabled-btn' : 'primary-btn'}
                            >
                                {loading ? 'Uploading...' : 'Add Faculty'}
                            </button>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={(e) => setVenueFile(e.target.files[0])}
                            />
                            <button
                                onClick={() => handleFileUpload('/add-venues', venueFile)}
                                disabled={!venueFile || loading}
                                className={loading ? 'disabled-btn' : 'primary-btn'}
                            >
                                {loading ? 'Uploading...' : 'Add Venues'}
                            </button>
                        </div>
                        <button
                            onClick={handleAllocate}
                            disabled={loading}
                            className={loading ? 'disabled-btn' : 'primary-btn'}
                        >
                            {loading ? 'Allocating...' : 'Allocate Venues'}
                        </button>
                        <button onClick={handleDownload} className="success-btn">
                            Download Allocation List
                        </button>
                        {message && (
                            <p className={message.includes('Error') ? 'error-text' : 'success-text'}>
                                {message}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="message">
                        {assignment
                            ? `You are assigned to venue ${assignment}`
                            : 'You are not assigned to any venue'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
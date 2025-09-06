import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles.css';

const Dashboard = ({ token, user, onLogout }) => {
    const [assignment, setAssignment] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [facultyFile, setFacultyFile] = useState(null);
    const [venueFile, setVenueFile] = useState(null);
    const [lastAttendance, setLastAttendance] = useState(null);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const response = await axios.get('http://localhost:5000/assignment', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignment(response.data.venue_id);
                setLastAttendance(response.data.last_attendance);
            } catch (err) {
                console.error('Error fetching assignment:', err);
                setMessage('Error fetching assignment');
            }
        };

        if (token) {
            fetchAssignment();
        }
    }, [token]);

    const handleRecordAttendance = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post('http://localhost:5000/record-attendance', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(response.data.message);
            setLastAttendance(response.data.timestamp);
        } catch (err) {
            setMessage(err.response?.data.error || 'Error recording attendance');
        }
        setLoading(false);
    };

    const handleFileUpload = async (endpoint, file) => {
        if (!file) {
            setMessage('Please select a file');
            return;
        }
        setLoading(true);
        setMessage('');
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
            setMessage(err.response?.data.error || 'Error in uploading file');
        }
        setLoading(false);
    };

    // Add Allocate Venue function
    const handleAllocate = async () => {
        setLoading(true);
        setMessage('');
        try {
            await axios.post('http://localhost:5000/allocate', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Allocation completed successfully');
        } catch (err) {
            setMessage(err.response?.data.error || 'Error during allocation');
        }
        setLoading(false);
    };

    // Add Download Allocation function
    const handleDownload = async () => {
        setLoading(true);
        setMessage('');
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
        setLoading(false);
    };

    return (
        <div className="dashboard-page">
            <div className="card">
                <h2>Dashboard</h2>
                <button onClick={onLogout} className="secondary-btn">Logout</button>

                {!user.is_admin && (
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={handleRecordAttendance}
                            disabled={loading}
                            className={loading ? 'disabled-btn' : 'primary-btn'}
                        >
                            {loading ? 'Recording...' : 'Record Biometric Attendance'}
                        </button>
                        {assignment && (
                            <p className="message">
                                Assigned to venue: {assignment}
                            </p>
                        )}
                        {lastAttendance && (
                            <p className="success-text">
                                Last attendance: {new Date(lastAttendance).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}

                {user.is_admin && (
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
                        <button
                            onClick={handleDownload}
                            disabled={loading}
                            className={loading ? 'disabled-btn' : 'success-btn'}
                        >
                            {loading ? 'Downloading...' : 'Download Allocation List'}
                        </button>
                    </div>
                )}

                {message && (
                    <p className={message.includes('Error') ? 'error-text' : 'success-text'}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
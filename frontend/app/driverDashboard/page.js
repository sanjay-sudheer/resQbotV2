"use client";
import React, { useState, useEffect } from "react";


const DriverDashboard = () => {
    const [ambulanceId, setAmbulanceId] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [status, setStatus] = useState("offline");
    const [emergency, setEmergency] = useState(null);

    const handleLogin = () => {
        if (ambulanceId.trim()) {
            setIsAuthenticated(true);
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);

        try {
            const response = await fetch("/api/updateAmbulanceStatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: ambulanceId, status: newStatus }),
            });

            const data = await response.json();
            if (!data.success) {
                console.error("Failed to update status:", data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const fetchEmergency = async () => {
        try {
            const response = await fetch(`/api/getAssignedEmergency/${ambulanceId}`);
            const data = await response.json();

            if (data.success) {
                setEmergency(data.data);
            } else {
                setEmergency(null);
            }
        } catch (error) {
            console.error("Error fetching emergency:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated && status === "available") {
            const interval = setInterval(fetchEmergency, 3000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, status]);

    if (!isAuthenticated) {
        return (
            <div className="login-container">
                <h1>Ambulance Driver Dashboard</h1>
                <input
                    type="text"
                    placeholder="Enter Ambulance ID"
                    value={ambulanceId}
                    onChange={(e) => setAmbulanceId(e.target.value)}
                />
                <button onClick={handleLogin}>Login</button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <h1>Ambulance Driver Dashboard</h1>
            <div className="status-selector">
                <label htmlFor="status">Ambulance Status:</label>
                <select id="status" value={status} onChange={handleStatusChange}>
                    <option value="available">Available</option>
                    <option value="offline">Offline</option>
                </select>
            </div>
            <div className="emergency-inbox">
                <h2>Incoming Emergency</h2>
                {emergency ? (
                    <div className="emergency-details">
                        <p><strong>Emergency ID:</strong> {emergency._id}</p>
                        <p><strong>Location:</strong> {emergency.location}</p>
                        <p><strong>Description:</strong> {emergency.description}</p>
                    </div>
                ) : (
                    <p>No emergencies assigned.</p>
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
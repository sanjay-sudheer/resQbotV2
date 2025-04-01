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
            const response = await fetch("http://localhost:5000/ambulance/updateStatus", {
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
            const response = await fetch(`http://localhost:5000/ambulance/getAssigned/${ambulanceId}`);
            const data = await response.json();

            if (data.success) {
                setEmergency({
                    id: data.data._id,
                    location: `${data.data.latitude}, ${data.data.longitude}`,
                    description: data.data.problem,
                    priority: data.data.priority,
                    department: data.data.department,
                    timestamp: new Date(data.data.timestamp).toLocaleString(),
                });
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
                        <p><strong>Location:</strong> {emergency.location}</p>
                        <p><strong>Description:</strong> {emergency.description}</p>
                        <button
                            onClick={() =>
                                window.open(
                                    `https://www.google.com/maps?q=${emergency.location}`,
                                    "_blank"
                                )
                            }
                        >
                            View on Map
                        </button>
                        <br />
                        <button
                            onClick={async () => {
                                try {
                                    const response = await fetch("http://localhost:5000/ambulance/complete", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ id: ambulanceId }),
                                    });

                                    const data = await response.json();
                                    if (data.success) {
                                        setEmergency(null);
                                        alert("Emergency completed successfully.");
                                    } else {
                                        console.error("Failed to complete emergency:", data.message);
                                    }
                                } catch (error) {
                                    console.error("Error completing emergency:", error);
                                }
                            }}
                        >
                            Complete Emergency
                        </button>
                    </div>
                ) : (
                    <p>No emergencies assigned.</p>
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
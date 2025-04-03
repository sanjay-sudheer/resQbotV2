"use client";

import React, { useState, useEffect } from "react";
import { Ambulance, MapPin, Power, AlertCircle, CheckCircle2, Siren, AlertTriangle } from "lucide-react";
import axios from "axios";

const DriverDashboard = () => {
  const [ambulanceId, setAmbulanceId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [status, setStatus] = useState("busy");
  const [emergency, setEmergency] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!ambulanceId.trim()) {
        setError("Please enter a valid Ambulance ID");
        return;
    }

    try {
        console.log("🔹 Sending request to /amblogin with ID:", ambulanceId);

        const response = await axios.post("https://resqbotv2.onrender.com/api/auth/amblogin", {
            id: Number(ambulanceId), // Ensure ID is sent as a Number
        });

        console.log("🔹 Server Response:", response.data);

        if (response.data.success) {
            setIsAuthenticated(true);
            setError("");
            console.log("✅ Login Successful:", response.data);
        } else {
            setError(response.data.message);
        }
    } catch (err) {
        console.error("❌ Login Error:", err);
        
        if (err.response) {
            // Server responded with an error status
            setError(err.response.data.message || "Login failed. Please check the ID and try again.");
        } else if (err.request) {
            // No response from server
            setError("No response from server. Please try again later.");
        } else {
            // Other unknown error
            setError("An unexpected error occurred. Please try again.");
        }
    }
};



  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setError(null);

    try {
      const response = await fetch("https://resqbotv2.onrender.com/ambulance/updateStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: ambulanceId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setError("Unable to connect to dispatch server. Please ensure the server is running at https://resqbotv2.onrender.com");
      } else {
        setError(`Unable to update status: ${error.message}. Status updates will resume when connection is restored.`);
      }
    }
  };

const fetchEmergency = async () => {
    try {
        const response = await fetch(`https://resqbotv2.onrender.com/ambulance/getAssigned/${ambulanceId}`);
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
            setEmergency({
                id: data.data._id,
                location: `${data.data.latitude}, ${data.data.longitude}`,
                description: data.data.problem,
                priority: data.data.priority,
                department: data.data.department,
                timestamp: new Date(data.data.timestamp).toLocaleString(),
            });
            setError(null);
        } else {
            setEmergency(null);
            setError(null); // Clear any previous errors if no emergencies are assigned
        }
    } catch (error) {
        console.error("Error fetching emergency:", error);
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            setError("Unable to connect to dispatch server. Please ensure the server is running at https://resqbotv2.onrender.com");
        }
    }
};

  useEffect(() => {
    if (isAuthenticated && status === "available") {
      const interval = setInterval(fetchEmergency, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, status, ambulanceId]);

  if (!isAuthenticated) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a192f] bg-[radial-gradient(#1a365d_1px,transparent_1px)] bg-[size:20px_20px]">
          <div className="w-full max-w-md rounded-lg bg-[#0f2847] p-8 shadow-[0_0_15px_rgba(66,153,225,0.3)] border border-blue-500/20">
            <div className="mb-6 flex items-center justify-center">
              <Ambulance className="h-16 w-16 text-blue-400 animate-pulse" />
            </div>
            <h1 className="mb-6 text-center text-3xl font-bold text-white">
              Ambulance Driver Dashboard
            </h1>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter Ambulance ID"
                value={ambulanceId}
                onChange={(e) => setAmbulanceId(e.target.value)}
                className="w-full rounded-lg border border-blue-500/30 bg-[#1a365d] px-4 py-3 text-white placeholder-blue-300/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {error && <p className="text-red-400 text-center">{error}</p>}
              <button
                onClick={handleLogin}
                className="w-full rounded-lg bg-blue-600 py-3 text-white transition-all hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(66,153,225,0.4)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a192f]"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {error && (
          <div className="rounded-lg bg-red-900/30 p-4 border border-red-500/30">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
          <h1 className="mb-6 flex items-center text-2xl font-bold text-white">
            <Ambulance className="mr-2 h-8 w-8 text-blue-400" />
            Ambulance Driver Dashboard
          </h1>
          
          <div className="mb-6 flex items-center space-x-4">
            <label htmlFor="status" className="font-medium text-gray-300">
              Ambulance Status:
            </label>
            <select
              id="status"
              value={status}
              onChange={handleStatusChange}
              className="rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
            <div className={`flex items-center ${
              status === 'available' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              <Power className="h-5 w-5" />
              <span className="ml-2 text-sm font-medium">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow-lg border border-gray-700">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-white">
            <AlertCircle className={`mr-2 h-6 w-6 text-red-500 ${emergency ? 'blink' : ''}`} />
            Incoming Emergency
          </h2>
          
          {emergency ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-900/30 p-6 border border-red-500/30 animate-[pulse_2s_ease-in-out_infinite]">
                <div className="absolute top-2 right-2">
                  <Siren className="h-6 w-6 text-red-500 animate-[pulse_1s_ease-in-out_infinite]" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="flex items-center text-gray-300">
                      <MapPin className="mr-2 h-5 w-5 text-red-400" />
                      <strong>Location:</strong>
                      <span className="ml-2">{emergency.location}</span>
                    </p>
                  </div>
                  <p className="text-gray-300">
                    <strong>Description:</strong>
                    <span className="ml-2">{emergency.description}</span>
                  </p>
                  <p className="text-gray-300">
                    <strong>Priority:</strong>
                    <span className="ml-2 text-red-400 font-bold">{emergency.priority}</span>
                  </p>
                  <p className="text-gray-300">
                    <strong>Time:</strong>
                    <span className="ml-2">{emergency.timestamp}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => window.open(
                    `https://www.google.com/maps?q=${emergency.location}`,
                    "_blank"
                  )}
                  className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(66,153,225,0.4)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  View on Map
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch("https://resqbotv2.onrender.com/ambulance/complete", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ id: ambulanceId }),
                      });

                      if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                      }

                      const data = await response.json();
                      if (data.success) {
                        setEmergency(null);
                        setError(null);
                        alert("Emergency completed successfully.");
                      } else {
                        throw new Error(data.message || "Failed to complete emergency");
                      }
                    } catch (error) {
                      console.error("Error completing emergency:", error);
                      if (error instanceof TypeError && error.message === "Failed to fetch") {
                        setError("Unable to connect to dispatch server. Please ensure the server is running at https://resqbotv2.onrender.com");
                      } else {
                        setError(`Unable to complete emergency: ${error.message}. Please try again when connection is restored.`);
                      }
                    }
                  }}
                  className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition-all hover:bg-green-700 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Complete Emergency
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-gray-700/50 p-8 text-center border border-gray-600">
              <p className="text-gray-400">No emergencies assigned.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
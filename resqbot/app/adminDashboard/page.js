"use client";
import React, { useState, useEffect } from "react";
import { LayoutGrid, Clock, Search, Menu, X, Filter } from "lucide-react";

const mockIssues = [
  { id: 1, type: "Pothole", location: "123 Main St", priority: "High", status: "Pending", timestamp: "2024-03-15T10:30:00", description: "Large pothole causing traffic hazard" },
  { id: 2, type: "Street Light", location: "456 Oak Ave", priority: "Medium", status: "In Progress", timestamp: "2024-03-14T15:45:00", description: "Street light not working for 3 days" },
  { id: 3, type: "Graffiti", location: "789 Pine Rd", priority: "Low", status: "Resolved", timestamp: "2024-03-13T09:15:00", description: "Graffiti on public building wall" }
];

function AdminDashboard() {
  const [hydrated, setHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => { setHydrated(true); }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPriority("All");
    setSelectedStatus("All");
  };

  const filteredIssues = mockIssues.filter(issue =>
    (selectedPriority === "All" || issue.priority === selectedPriority) &&
    (selectedStatus === "All" || issue.status === selectedStatus) &&
    (issue.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!hydrated) return null;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}>
          <aside className="fixed top-0 left-0 h-full w-64 bg-gray-800 p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold text-white flex items-center">
                <LayoutGrid className="h-6 w-6 text-indigo-400 mr-2" />
                resQbot Admin
              </h1>
              <button className="text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Filters Section */}
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-3">Filters</h3>
              <label className="block mb-2 text-gray-400">Priority</label>
              <select className="w-full bg-gray-700 text-white p-2 rounded mb-4" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                <option>All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <label className="block mb-2 text-gray-400">Status</label>
              <select className="w-full bg-gray-700 text-white p-2 rounded mb-4" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option>All</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>

              {/* Clear Filters Button */}
              <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-500 transition" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          {/* Hamburger Menu & Heading on Same Line */}
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="bg-gray-800 p-2 rounded-lg text-white hover:bg-gray-700">
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-white">City Issues Dashboard</h2>
          </div>
        </div>

        {/* Search Bar & Filter Button on Next Line */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center bg-gray-800 p-2 rounded-md flex-1">
            <Search className="text-gray-400" />
            <input type="text" placeholder="Search issues..." className="bg-transparent outline-none text-white ml-2 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="ml-4 bg-gray-800 p-2 rounded-lg text-white hover:bg-gray-700">
            <Filter className="h-6 w-6" />
          </button>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map(issue => (
            <div key={issue.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{issue.type}</h3>
                  <p className="text-gray-400 text-sm">{issue.location}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${{
                    high: "bg-red-500", medium: "bg-yellow-500", low: "bg-green-500"
                  }[issue.priority.toLowerCase()] || "bg-gray-500"}`}>
                    {issue.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${{
                    pending: "bg-orange-500", "in progress": "bg-blue-500", resolved: "bg-green-500"
                  }[issue.status.toLowerCase()] || "bg-gray-500"}`}>
                    {issue.status}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">{issue.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span><Clock className="inline h-4 w-4 mr-1" /> {new Date(issue.timestamp).toLocaleString()}</span>
                <button className="text-indigo-400 hover:text-indigo-300 transition-colors">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

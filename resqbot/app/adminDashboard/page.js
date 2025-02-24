"use client";
import React, { useState, useEffect } from "react";
import { LayoutGrid, Clock, Search, Menu, X, Filter, MapPin, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), { ssr: false });

// Moving mock data to state to allow updates
const initialIssues = [
  { id: 1, type: "Pothole", location: "123 Main St", priority: "High", status: "Pending", timestamp: "2024-03-15T10:30:00", description: "Large pothole causing traffic hazard", lat: 37.7749, lng: -122.4194 },
  { id: 2, type: "Street Light", location: "456 Oak Ave", priority: "Medium", status: "In Progress", timestamp: "2024-03-14T15:45:00", description: "Street light not working for 3 days", lat: 37.7796, lng: -122.4183 },
  { id: 3, type: "Graffiti", location: "789 Pine Rd", priority: "Low", status: "Resolved", timestamp: "2024-03-13T09:15:00", description: "Graffiti on public building wall", lat: 37.7802, lng: -122.4124 }
];

const IssueCard = ({ issue, onClick }) => {
  const statusColors = {
    Pending: "bg-red-500/10 text-red-500",
    "In Progress": "bg-yellow-500/10 text-yellow-500",
    Resolved: "bg-green-500/10 text-green-500"
  };

  const priorityColors = {
    High: "bg-red-500/10 text-red-500",
    Medium: "bg-yellow-500/10 text-yellow-500",
    Low: "bg-green-500/10 text-green-500"
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition duration-200 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">{issue.type}</h3>
            <div className="flex items-center text-gray-400 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {issue.location}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${statusColors[issue.status]}`}>
            {issue.status}
          </span>
        </div>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{issue.description}</p>
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm ${priorityColors[issue.priority]}`}>
            {issue.priority} Priority
          </span>
          <button 
            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 px-4 py-2 rounded-md transition-colors"
            onClick={() => onClick(issue)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const IssueModal = ({ issue, onClose, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(issue.status);
  
  const statusOptions = ["Pending", "In Progress", "Resolved"];
  const statusColors = {
    Pending: "bg-red-500 hover:bg-red-600",
    "In Progress": "bg-yellow-500 hover:bg-yellow-600",
    Resolved: "bg-green-500 hover:bg-green-600"
  };

  const handleUpdate = () => {
    onUpdateStatus(issue.id, newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-white">{issue.type} Details</h2>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Location</h3>
              <p className="text-gray-300">{issue.location}</p>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Description</h3>
              <p className="text-gray-300">{issue.description}</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Status Update</h3>
              <div className="flex gap-2">
                {statusOptions.map(status => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-md text-white transition-colors ${
                      status === newStatus 
                        ? statusColors[status]
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    onClick={() => setNewStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 bg-gray-700/50 rounded-lg overflow-hidden">
              <Map lat={issue.lat} lng={issue.lng} />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                className={`${
                  newStatus === issue.status
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                } text-white px-4 py-2 rounded-md transition-colors`}
                onClick={handleUpdate}
                disabled={newStatus === issue.status}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, searchQuery, onSearchChange, selectedPriority, onPriorityChange, selectedStatus, onStatusChange, onClearFilters }) => (
  <div className={`fixed inset-y-0 left-0 w-72 bg-gray-800/95 backdrop-blur-sm p-6 shadow-xl transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 md:translate-x-0 md:relative z-50`}>
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-xl font-bold text-white flex items-center">
        <LayoutGrid className="h-6 w-6 text-indigo-400 mr-2" />
        resQbot Admin
      </h1>
      <button 
        className="md:hidden text-gray-400 hover:text-white transition-colors"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>
    </div>

    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          className="w-full bg-gray-700/50 text-white pl-10 pr-3 py-2 rounded-md border border-gray-600 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-indigo-400" />
          Filters
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm text-gray-400">Priority</label>
            <select
              className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-md p-2 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
              value={selectedPriority}
              onChange={onPriorityChange}
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-400">Status</label>
            <select
              className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-md p-2 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
              value={selectedStatus}
              onChange={onStatusChange}
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>

          <button 
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors mt-4"
            onClick={onClearFilters}
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  </div>
);

function AdminDashboard() {
  const [hydrated, setHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issues, setIssues] = useState(initialIssues);
  const router = useRouter();

  useEffect(() => { setHydrated(true); }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPriority("All");
    setSelectedStatus("All");
  };

  const handleUpdateStatus = (issueId, newStatus) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === issueId 
          ? { ...issue, status: newStatus }
          : issue
      )
    );
    setSelectedIssue(null);
  };

  const filteredIssues = issues.filter(issue =>
    (selectedPriority === "All" || issue.priority === selectedPriority) &&
    (selectedStatus === "All" || issue.status === selectedStatus) &&
    (issue.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        selectedPriority={selectedPriority}
        onPriorityChange={(e) => setSelectedPriority(e.target.value)}
        selectedStatus={selectedStatus}
        onStatusChange={(e) => setSelectedStatus(e.target.value)}
        onClearFilters={clearFilters}
      />

      <main className="flex-1 p-8 transition-all">
        <div className="md:hidden mb-6">
          <button 
            className="text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <AlertCircle className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Issues Found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map(issue => (
              <IssueCard 
                key={issue.id} 
                issue={issue} 
                onClick={setSelectedIssue}
              />
            ))}
          </div>
        )}

        {selectedIssue && (
          <IssueModal
            issue={selectedIssue}
            onClose={() => setSelectedIssue(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
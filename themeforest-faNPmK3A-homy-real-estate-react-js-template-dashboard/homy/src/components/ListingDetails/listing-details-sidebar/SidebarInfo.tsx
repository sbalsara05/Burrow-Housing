// frontend/components/ListingDetails/listing-details-sidebar/SidebarInfo.tsx
import React, { useEffect, useState } from 'react'; // Import React and hooks if fetching agent
import { Link } from "react-router-dom";
import { BadgeCheck } from 'lucide-react';
// import axios from 'axios'; // If fetching agent data

// Interface for the props
interface SidebarInfoProps {
    agentId?: string | null; // Optional: ID of the agent (property.userId)
}

// Placeholder interface for fetched agent data
interface StudentData {
    name: string;
    majors?: string; // e.g., 'Computer Science'
    school?: string;
    expectedGrad: string;
    responseTime: string;
    avatarUrl?: string; // URL for the agent's image
    verified?: boolean; // Add verification status
    // Add social links if available
}

const SidebarInfo: React.FC<SidebarInfoProps> = ({ agentId }) => {
    // --- State for fetched agent data (optional, if fetching) ---
    // const [agentData, setAgentData] = useState<AgentData | null>(null);
    // const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);

    // --- Effect to fetch agent data based on agentId (optional) ---
    // useEffect(() => {
    //     if (agentId) {
    //         const fetchAgent = async () => {
    //             setIsLoading(true);
    //             setError(null);
    //             try {
    //                 // TODO: Replace with your actual API endpoint for fetching student details
    //                 // const response = await axios.get(`/api/agents/${studentID}`);
    //                 // setAgentData(response.data);
    //
    //                 // --- Placeholder Fetch ---
    //                  console.warn("SidebarInfo: Fetching agent data is not implemented. Using static data.");
    //                  // Simulate fetch delay and set static data
    //                  await new Promise(resolve => setTimeout(resolve, 500));
    //                  setAgentData({
    //                      name: "Rashed Kabir (Fetched)", // Indicate data source
    //                      title: "Property Agent & Broker",
    //                      email: "fetched.agent@example.com",
    //                      phone: "+19876543210",
    //                      location: "Fetched Location",
    //                      avatarUrl: "/assets/images/agent/img_06.jpg" // Use actual path if available
    //                  });
    //                 // --- End Placeholder Fetch ---
    //
    //             } catch (err) {
    //                 console.error("Failed to fetch agent data:", err);
    //                 setError("Could not load agent information.");
    //                 setAgentData(null); // Clear data on error
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         };
    //         fetchAgent();
    //     } else {
    //          // Reset if agentId is not provided
    //          setAgentData(null);
    //     }
    // }, [agentId]); // Refetch if agentId changes

    // --- Render Logic ---
    // if (isLoading) return <div>Loading agent info...</div>;
    // if (error) return <div className="alert alert-warning">{error}</div>;

    // Use fetched agentData if available, otherwise fallback to static/default
    // const displayData = agentData || { // Fallback to static data for now
    const displayData = { // Using static data directly until fetch is implemented
        name: "Sarah Johnson",
        majors: "Biochemistry Student",
        school: "Northeastern University",
        expectedGrad: "Spring 2026",
        responseTime: "< 1 hour",
        avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
        verified: true, // Set verification status
    };

    return (
        <>
            <img
                src={displayData.avatarUrl || "/assets/images/dashboard/no-profile-pic.png"} // Use fetched or default avatar
                alt={`${displayData.name || 'Agent'} Avatar`}
                className="lazy-img rounded-circle ms-auto me-auto mt-3 avatar"
                style={{width: '100px', height: '100px', objectFit: 'cover'}} // Ensure consistent size
            />

            <div className="text-center mt-25">
                <div className="d-flex align-items-center justify-content-center">
                    <h6 className="name mb-0">{displayData.name || 'Student Name Unavailable'}</h6>
                    {displayData.verified && (
                        <BadgeCheck className="ms-1 text-primary" size={20} color="#1E88E5" />
                    )}
                </div>
                <p className="fs-16">{displayData.majors || 'Student'}</p> {/* Use fetched title */}
            </div>

            <div className="divider-line mt-40 mb-45 pt-20">
                <ul className="style-none">
                    {displayData.school && <li>School: <span>{displayData.school}</span></li>}
                    <li>Response Time: <span>{displayData.responseTime || "N/A"}</span></li>
                </ul>
            </div>

            <div className="d-flex justify-content-between gap-2 mt-3">
                <Link to="/contact" className="btn flex-grow-1 text-center py-3 text-white"
                      style={{backgroundColor: '#f16040'}}>Contact</Link>
                <Link to="/request" className="btn flex-grow-1 text-center py-3 text-white"
                      style={{backgroundColor: '#f16040'}}>Request Ambassador</Link>
                <Link to="#" className="btn flex-grow-1 text-center py-3 text-white"
                      style={{backgroundColor: '#f16040'}}>Save</Link>
            </div>
        </>
    );
};

export default SidebarInfo;
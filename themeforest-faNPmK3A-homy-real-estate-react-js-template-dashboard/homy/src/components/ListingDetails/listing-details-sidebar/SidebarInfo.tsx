// frontend/components/ListingDetails/listing-details-sidebar/SidebarInfo.tsx
import React, { useEffect, useState } from 'react'; // Import React and hooks if fetching agent
import { Link } from "react-router-dom";
// import axios from 'axios'; // If fetching agent data

// Interface for the props
interface SidebarInfoProps {
    agentId?: string | null; // Optional: ID of the agent (property.userId)
}

// Placeholder interface for fetched agent data
interface AgentData {
    name: string;
    title?: string; // e.g., 'Property Agent & Broker'
    email: string;
    phone: string;
    location?: string;
    avatarUrl?: string; // URL for the agent's image
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
    //                 // TODO: Replace with your actual API endpoint for fetching agent details
    //                 // const response = await axios.get(`/api/agents/${agentId}`);
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
        name: "Rashed Kabir",
        title: "Property Agent & Broker",
        email: "akabirr770@gmail.com",
        phone: "+12347687565",
        location: "Spain, Barcelona",
        avatarUrl: "/assets/images/agent/img_06.jpg"
    };


    return (
        <>
            <img
                src={displayData.avatarUrl || "/assets/images/dashboard/no-profile-pic.png"} // Use fetched or default avatar
                alt={`${displayData.name || 'Agent'} Avatar`}
                className="lazy-img rounded-circle ms-auto me-auto mt-3 avatar"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }} // Ensure consistent size
            />
            <div className="text-center mt-25">
                <h6 className="name">{displayData.name || 'Agent Name Unavailable'}</h6>
                <p className="fs-16">{displayData.title || 'Real Estate Agent'}</p> {/* Use fetched title */}
                {/* Keep static social icons for now */}
                <ul className="style-none d-flex align-items-center justify-content-center social-icon">
                    <li><Link to="#"><i className="fa-brands fa-facebook-f"></i></Link></li>
                    <li><Link to="#"><i className="fa-brands fa-twitter"></i></Link></li>
                    <li><Link to="#"><i className="fa-brands fa-instagram"></i></Link></li>
                    <li><Link to="#"><i className="fa-brands fa-linkedin"></i></Link></li>
                </ul>
            </div>
            <div className="divider-line mt-40 mb-45 pt-20">
                <ul className="style-none">
                    {displayData.location && <li>Location: <span>{displayData.location}</span></li>}
                    <li>Email: <span><Link to={`mailto:${displayData.email || '#'}`}>{displayData.email || 'N/A'}</Link></span></li>
                    <li>Phone: <span><Link to={`tel:${displayData.phone || '#'}`}>{displayData.phone || 'N/A'}</Link></span></li>
                </ul>
            </div>
            <Link to="/contact" className="btn-nine text-uppercase rounded-3 w-100 mb-10">CONTACT AGENT</Link>
        </>
    );
};

export default SidebarInfo;
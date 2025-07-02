// frontend/components/ListingDetails/listing-details-common/CommonProPertyScore.tsx
import React from 'react';
import { Property } from '../../../redux/slices/propertySlice'; // Adjust path

// Interface for static data structure
interface ScoreData { id: number; icon: string; title: string; desc: JSX.Element; }
// Example of how scores might look if stored on the Property object
interface PropertyScores { transit?: number; school?: number; medical?: number; shopping?: number; }

// Define props interface
interface CommonProPertyScoreProps {
    property?: Property | null; // Accept property object
    // Or accept scores directly if calculated elsewhere
    // scores?: PropertyScores | null;
}

// Static data as fallback
const static_score_data: ScoreData[] = [
    { id: 1, icon: "/assets/images/icon/icon_52.svg", title: "Transit Score", desc: (<><span className="color-dark">63</span>/100 (Moderate Distance)</>) },
    { id: 2, icon: "/assets/images/icon/icon_53.svg", title: "School Score", desc: (<><span className="color-dark">70</span>/100 (Short Distance)</>) },
    { id: 3, icon: "/assets/images/icon/icon_54.svg", title: "Medical Score", desc: (<><span className="color-dark">77</span>/100 (Short Distance)</>) },
    { id: 4, icon: "/assets/images/icon/icon_55.svg", title: "Shopping Mall Score", desc: (<><span className="color-dark">42</span>/100 (Long Distance)</>) },
];

const CommonProPertyScore: React.FC<CommonProPertyScoreProps> = ({ property }) => {

    // --- Determine Scores to Display ---
    let scoresToDisplay = static_score_data; // Default to static

    // TODO: If property object contains score data, map it here
    // Example: assumes property.scores exists and matches PropertyScores interface
    // if (property?.scores) {
    //     scoresToDisplay = [
    //         { id: 1, icon: "/assets/images/icon/icon_52.svg", title: "Transit Score", desc: (<><span className="color-dark">{property.scores.transit ?? 'N/A'}</span>/100</>) },
    //         { id: 2, icon: "/assets/images/icon/icon_53.svg", title: "School Score", desc: (<><span className="color-dark">{property.scores.school ?? 'N/A'}</span>/100</>) },
    //         // ... map others
    //     ];
    //      console.warn("CommonProPertyScore: Displaying scores from property data (if available).");
    // } else {
    //     console.warn("CommonProPertyScore: Property score data not found. Using static placeholders.");
    // }


    return (
        <>
            <h4 className="mb-20">Walk Score</h4>
            <p className="fs-20 lh-lg pb-30">Walkability scores based on nearby amenities.</p>
            <div className="row">
                {scoresToDisplay.map((item) => (
                    <div key={item.id} className="col-md-6">
                        <div className="block d-flex align-items-center mb-50 sm-mb-30">
                            <img src={item.icon} alt="" className="lazy-img icon" />
                            <div className="text">
                                <h6>{item.title}</h6>
                                <p className="fs-16 m0">{item.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default CommonProPertyScore;
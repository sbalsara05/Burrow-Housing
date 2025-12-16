import React from 'react';
import NiceSelect from "../../../ui/NiceSelect";

interface NeighborhoodSelectProps {
    value: string;
    onChange: (value: string) => void;
}

const NeighborhoodSelect: React.FC<NeighborhoodSelectProps> = ({ value, onChange }) => {
    const neighborhoodOptions = [
        { value: "Any", text: "Any" },
        { value: "Allston", text: "Allston" },
        { value: "Back Bay", text: "Back Bay" },
        { value: "Beacon Hill", text: "Beacon Hill" },
        { value: "Brighton", text: "Brighton" },
        { value: "Charlestown", text: "Charlestown" },
        { value: "Chinatown", text: "Chinatown" },
        { value: "Dorchester", text: "Dorchester" },
        { value: "Fenway", text: "Fenway" },
        { value: "Hyde Park", text: "Hyde Park" },
        { value: "Jamaica Plain", text: "Jamaica Plain" },
        { value: "Mattapan", text: "Mattapan" },
        { value: "Mission Hill", text: "Mission Hill" },
        { value: "North End", text: "North End" },
        { value: "Roslindale", text: "Roslindale" },
        { value: "Roxbury", text: "Roxbury" },
        { value: "South Boston", text: "South Boston" },
        { value: "South End", text: "South End" },
        { value: "West End", text: "West End" },
        { value: "West Roxbury", text: "West Roxbury" },
        { value: "Wharf District", text: "Wharf District" }
    ];

    const neighborhoodIndex = neighborhoodOptions.findIndex(o => o.value === value);

    return (
        <NiceSelect
            className="nice-select"
            options={neighborhoodOptions}
            key={`neigh-${value}`}
            defaultCurrent={neighborhoodIndex >= 0 ? neighborhoodIndex : 0}
            onChange={(e) => onChange(e.target.value)}
            name="neighborhood"
        />
    );
};

export default NeighborhoodSelect;

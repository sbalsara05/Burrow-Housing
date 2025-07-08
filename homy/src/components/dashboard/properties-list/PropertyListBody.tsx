import React, { useEffect, useMemo } from 'react'; // Import useMemo
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/slices/store.ts";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import NiceSelect from "../../../ui/NiceSelect";
import PropertyTableBody from "./PropertyTableBody";
import {
    fetchUserProperties,
    selectUserProperties,
    selectUserPropertiesLoading,
    selectPropertyError,
    clearPropertyError,
    setUserPropertiesSort, // NEW: Import the sort action
    selectUserPropertiesSort, // NEW: Import the sort selector
    Property // Import Property type
} from "../../../redux/slices/propertySlice";

const PropertyListBody = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Select state from Redux
    const properties = useSelector(selectUserProperties);
    const isLoading = useSelector(selectUserPropertiesLoading);
    const error = useSelector(selectPropertyError);
    const sortOption = useSelector(selectUserPropertiesSort); // NEW: Get sort option from state

    // Handler for the dropdown change
    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortValue = event.target.value;
        dispatch(setUserPropertiesSort(newSortValue));
    };

    // Memoized sorting logic
    const sortedProperties = useMemo(() => {
        const sorted = [...properties]; // Create a mutable copy
        switch (sortOption) {
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'inactive':
                // Note: Assumes a 'status' field exists. We'll need to add this to the model.
                return sorted.filter(p => p.status === 'Inactive'); // Placeholder logic
            case 'newest':
            default:
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }, [properties, sortOption]); // Re-run only when properties or sortOption changes

    // Fetch data when the component mounts
    useEffect(() => {
        dispatch(fetchUserProperties());
        return () => {
            dispatch(clearPropertyError());
        };
    }, [dispatch]);

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="My Properties" />
                <h2 className="main-title d-block d-lg-none">My Properties</h2>
                <div className="d-sm-flex align-items-center justify-content-between mb-25">
                    <div className="fs-16">Showing <span className="color-dark fw-500">{sortedProperties.length}</span> properties</div>
                    <div className="d-flex ms-auto xs-mt-30">
                        <div className="short-filter d-flex align-items-center ms-sm-auto">
                            <div className="fs-16 me-2">Sort by:</div>
                            <NiceSelect
                                className="nice-select"
                                options={[
                                    { value: "newest", text: "Newest" },
                                    { value: "oldest", text: "Oldest" },
                                    { value: "inactive", text: "Inactive" },
                                ]}
                                defaultCurrent={["newest", "oldest", "inactive"].indexOf(sortOption)}
                                onChange={handleSortChange} // Use the new handler
                                name="property-sort"
                                placeholder="Select Sort"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white card-box p0 border-20">
                    <div className="table-responsive pt-25 pb-25 pe-4 ps-4">
                        {/* ... (keep loading, error, and empty state logic) ... */}
                        {isLoading && (
                            <div className="text-center p-5">
                                <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                            </div>
                        )}
                        {error && <div className="alert alert-danger">{error}</div>}
                        {!isLoading && !error && sortedProperties.length === 0 && (
                            <div className="text-center p-5">
                                <h4>
                                    {sortOption === 'inactive'
                                        ? "You have no inactive properties."
                                        : "You haven't added any properties yet."
                                    }
                                </h4>
                                <p className="mt-2">
                                    {sortOption !== 'inactive' && "Get started by adding your first listing!"}
                                </p>
                                {sortOption !== 'inactive' &&
                                    <Link to="/dashboard/add-property" className="btn-two mt-3">Add New Property</Link>
                                }
                            </div>
                        )}
                        {!isLoading && !error && sortedProperties.length > 0 && (
                            <table className="table property-list-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Title</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">View</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                {/* Pass the memoized sorted properties to the table body */}
                                <PropertyTableBody properties={sortedProperties} />
                            </table>
                        )}
                    </div>
                </div>
                {properties.length > 0 && (
                    <ul className="pagination-one d-flex align-items-center justify-content-center style-none pt-40">
                        <li className="selected"><Link to="#">1</Link></li>
                    </ul>
                )}
            </div>
        </div>
    );
}

export default PropertyListBody;
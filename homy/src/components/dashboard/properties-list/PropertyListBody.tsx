import React, { useEffect, useMemo, useState } from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/slices/store.ts";
import DashboardHeaderTwo from "../../../layouts/headers/dashboard/DashboardHeaderTwo";
import NiceSelect from "../../../ui/NiceSelect";
import PropertyTableBody from "./PropertyTableBody";
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../../../modals/DeleteConfirmationModal';
import {
    fetchUserProperties,
    selectUserProperties,
    selectUserPropertiesLoading,
    selectPropertyError,
    clearPropertyError,
    setUserPropertiesSort,
    selectUserPropertiesSort,
    deleteUserProperty
} from "../../../redux/slices/propertySlice";

const PropertyListBody = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { userProperties, isLoading, error, userPropertiesSort } = useSelector((state: RootState) => state.properties);

    // State for the modal now lives in this parent component
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setUserPropertiesSort(event.target.value));
    };

    const sortedProperties = useMemo(() => {
        const sorted = [...userProperties];
        switch (userPropertiesSort) {
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            case 'inactive':
                // This assumes a 'status' field exists. Update your model if needed.
                return sorted.filter(p => p.status === 'Inactive');
            case 'newest':
            default:
                return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }, [userProperties, userPropertiesSort]);

    useEffect(() => {
        dispatch(fetchUserProperties());
        return () => {
            dispatch(clearPropertyError());
        };
    }, [dispatch]);

    // Modal handling functions live here
    const openDeleteModal = (id: string) => {
        setPropertyToDelete(id);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setPropertyToDelete(null);
        setIsModalOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (propertyToDelete) {
            const resultAction = await dispatch(deleteUserProperty(propertyToDelete));
            if (deleteUserProperty.fulfilled.match(resultAction)) {
                toast.success("Property deleted successfully!");
            } else {
                toast.error((resultAction.payload as string) || "Failed to delete property.");
            }
            closeDeleteModal();
        }
    };

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
                                defaultCurrent={["newest", "oldest", "inactive"].indexOf(userPropertiesSort)}
                                onChange={handleSortChange}
                                name="property-sort"
                                placeholder="Select Sort"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white card-box p0 border-20">
                    <div className="table-responsive pt-25 pb-25 pe-4 ps-4">
                        {isLoading && !isModalOpen && ( // Don't show main loading if modal is open for delete
                            <div className="text-center p-5">
                                <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                            </div>
                        )}
                        {error && <div className="alert alert-danger">{error}</div>}
                        {!isLoading && !error && sortedProperties.length === 0 && (
                            <div className="text-center p-5">
                                <h4>
                                    {userPropertiesSort === 'inactive'
                                        ? "You have no inactive properties."
                                        : "You haven't added any properties yet."
                                    }
                                </h4>
                                <p className="mt-2">
                                    {userPropertiesSort !== 'inactive' && "Get started by adding your first listing!"}
                                </p>
                                {userPropertiesSort !== 'inactive' &&
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
                                <PropertyTableBody
                                    properties={sortedProperties}
                                    onDeleteClick={openDeleteModal}
                                />
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this property? This action cannot be undone."
                isLoading={isLoading}
            />
        </div>
    );
}

export default PropertyListBody;
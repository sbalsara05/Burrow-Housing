import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/slices/store';
import { fetchPropertyById, selectCurrentProperty, selectPropertyLoading } from '../redux/slices/propertySlice';
import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import DashboardHeaderOne from '../layouts/headers/dashboard/DashboardHeaderOne';
import AddPropertyBody from '../components/dashboard/add-property/AddPropertyBody';

const DashboardEditProperty = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();

    const propertyToEdit = useSelector(selectCurrentProperty);
    const isLoading = useSelector(selectPropertyLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchPropertyById(id));
        }
    }, [id, dispatch]);

    // Show a loading state while fetching the property data
    if (isLoading && !propertyToEdit) {
        return (
            <Wrapper>
                <SEO pageTitle="Edit Property | Burrow Housing" noIndex />
                <DashboardHeaderOne />
                <div className="dashboard-body"><p>Loading property details...</p></div>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <SEO pageTitle="Edit Property | Burrow Housing" noIndex />
            <DashboardHeaderOne />
            {/* Pass the isEditMode and propertyToEdit props to the shared form body */}
            <AddPropertyBody isEditMode={true} propertyToEdit={propertyToEdit} />
        </Wrapper>
    );
};

export default DashboardEditProperty;
import React, { useEffect } from 'react';
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch } from '../../../redux/slices/store';
import { toast } from 'react-toastify';
import {
    fetchFavorites,
    removeFromFavorites,
    selectFavorites,
    selectFavoritesLoading,
    selectFavoritesError
} from '../../../redux/slices/favoritesSlice';

const FavouriteArea = () => {
    const dispatch = useDispatch<AppDispatch>();
    const favorites = useSelector(selectFavorites);
    const isLoading = useSelector(selectFavoritesLoading);
    const error = useSelector(selectFavoritesError);

    // Fetch favorites when component mounts
    useEffect(() => {
        dispatch(fetchFavorites());
    }, [dispatch]);

    // Handle removing from favorites
    const handleRemoveFromFavorites = async (propertyId: string) => {
        try {
            await dispatch(removeFromFavorites(propertyId)).unwrap();
            toast.success('Removed from favorites');
        } catch (error) {
            toast.error('Failed to remove from favorites');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
                <button
                    onClick={() => dispatch(fetchFavorites())}
                    className="btn btn-sm btn-outline-danger ms-2"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Empty state
    if (favorites.length === 0) {
        return (
            <div className="text-center py-5">
                <div className="mb-4">
                    <i className="fa-regular fa-heart fs-1 text-muted"></i>
                </div>
                <h3 className="h5 text-gray-600 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-3">
                    Start browsing properties and click the heart icon to add them to your favorites.
                </p>
                <Link to="/listing_14" className="btn btn-primary">
                    Browse Properties
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="row gx-xxl-5">
                {favorites.map((item) => (
                    <div key={item._id} className="col-lg-4 col-md-6 d-flex mb-50">
                        <div className="listing-card-one border-25 h-100 w-100">
                            <div className="img-gallery p-15">
                                <div className="position-relative border-25 overflow-hidden">
                                    <div className="tag bg-white text-dark fw-500 border-25 position-absolute top-3 left-3 z-10">
                                        {item.overview.category}
                                    </div>

                                    {/* Property Image */}
                                    <div className="property-image">
                                        <img
                                            src={item.images?.[0] || "/assets/images/listing/img_43.jpg"}
                                            alt={item.overview.category}
                                            className="w-100 h-100 object-fit-cover"
                                            style={{ height: '200px' }}
                                        />
                                    </div>

                                    {/* Remove from favorites button */}
                                    <button
                                        onClick={() => handleRemoveFromFavorites(item._id)}
                                        className="fav-btn tran3s position-absolute top-3 right-3 bg-white border-0 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '40px', height: '40px' }}
                                        title="Remove from favorites"
                                    >
                                        <i className="fa-solid fa-heart text-danger"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="property-info p-25">
                                <Link
                                    to={`/listing_details_01/${item._id}`}
                                    className="title tran3s text-decoration-none"
                                >
                                    {`${item.listingDetails.bedrooms} Bed ${item.overview.category}`}
                                </Link>
                                <div className="address text-muted mb-3">
                                    <i className="fa-light fa-location-dot me-1"></i>
                                    {item.addressAndLocation.address}
                                </div>

                                <ul className="style-none feature d-flex flex-wrap align-items-center justify-content-between mb-3">
                                    <li className="d-flex align-items-center">
                                        <img src="/assets/images/icon/icon_04.svg" alt=""
                                            className="lazy-img icon me-2" />
                                        <span className="fs-16">{item.listingDetails.size} sqft</span>
                                    </li>
                                    <li className="d-flex align-items-center">
                                        <img src="/assets/images/icon/icon_05.svg" alt=""
                                            className="lazy-img icon me-2" />
                                        <span className="fs-16">{item.listingDetails.bedrooms} bed</span>
                                    </li>
                                    <li className="d-flex align-items-center">
                                        <img src="/assets/images/icon/icon_06.svg" alt=""
                                            className="lazy-img icon me-2" />
                                        <span className="fs-16">{item.listingDetails.bathrooms} bath</span>
                                    </li>
                                </ul>

                                <div className="pl-footer top-border d-flex align-items-center justify-content-between">
                                    <strong className="price fw-500 color-dark">
                                        ${item.overview.rent.toLocaleString()}
                                        <span className="fs-6 fw-normal text-muted">/month</span>
                                    </strong>
                                    <Link
                                        to={`/listing_details_01/${item._id}`}
                                        className="btn-four rounded-circle"
                                    >
                                        <i className="bi bi-arrow-up-right"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination can be added here if needed for large number of favorites */}
            {favorites.length > 9 && (
                <ReactPaginate
                    breakLabel="..."
                    nextLabel={<img src="/assets/images/icon/icon_46.svg" alt="" className="ms-2" />}
                    onPageChange={() => {}} // Implement pagination logic if needed
                    pageRangeDisplayed={5}
                    pageCount={Math.ceil(favorites.length / 9)}
                    previousLabel={<img src="/assets/images/icon/icon_46.svg" alt="" className="ms-2" />}
                    renderOnZeroPageCount={null}
                    className="pagination-one d-flex align-items-center style-none pt-20"
                />
            )}
        </>
    );
};

export default FavouriteArea;
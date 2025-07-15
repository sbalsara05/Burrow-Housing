import {Route, BrowserRouter as Router, Routes, Navigate} from 'react-router-dom';
import ScrollToTop from '../components/common/ScrollToTop';
import {ToastContainer} from 'react-toastify';
import ProtectedRoute from "./ProtectedRoutes";

//import routes
import Home from '../pages/Home';
import AboutUs from '../pages/AboutUs';
import ListingOne from '../pages/ListingOne';
import ListingFourteen from '../pages/ListingFourteen';
import ListingDetailsOne from '../pages/ListingDetailsOne';
import Contact from '../pages/Contact';
import Faq from '../pages/Faq';
import NotFound from '../pages/NotFound';
import DashboardIndex from '../pages/DashboardIndex';
import DashboardProfile from '../pages/DashboardProfile';
import DashboardChatConversationMain from '../pages/DashboardChatConversation';
import DashboardAccountSettings from '../pages/DashboardAccountSettings';
import DashboardPropertiesList from '../pages/DashboardPropertiesList';
import DashboardAddProperty from '../pages/DashboardAddProperty';
import DashboardFavourites from '../pages/DashboardFavourites';
import DashboardSavedSearch from '../pages/DashboardSavedSearch';
import DashboardReview from '../pages/DashboardReview';
import PasswordChange from '../components/dashboard/account-settings/password-change';
import DashboardChatMain from '../components/dashboard/chat/index';
import DashboardEditProperty from '../pages/DashboardEditProperty';

const AppNavigation = () => {
    return (
        <Router>
            <ScrollToTop/>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{zIndex: 9999}} // Ensure proper z-index
            />


            <Routes>
                {/* --- PUBLIC ROUTES --- */}
                {/* These routes are accessible to everyone, logged in or not. */}

                <Route path="/" element={<Navigate to="/home" replace/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/about_us" element={<AboutUs/>}/>
                <Route path="/contact" element={<Contact/>}/>
                <Route path="/faq" element={<Faq/>}/>
                <Route path="/listing_01" element={<ListingOne/>}/>
                <Route path="/listing_14" element={<ListingFourteen/>}/>
                <Route path="/listing_details_01/:id" element={<ListingDetailsOne/>}/>


                {/* --- PROTECTED ROUTES --- */}
                {/* These routes are only accessible to authenticated users.
            If a non-authenticated user tries to access them, they will be
            redirected to the login page ("/home"). */}

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard/dashboard-index" element={<DashboardIndex />} />
                    <Route path="/dashboard/profile" element={<DashboardProfile />} />
                    <Route path="/dashboard/chat/conversation/:id" element={<DashboardChatConversationMain />} />
                    <Route path="/dashboard/chat" element={<DashboardChatMain />} />

                    <Route path="/dashboard/account-settings" element={<DashboardAccountSettings />} />
                    <Route path="/dashboard/account-settings/password-change" element={<PasswordChange />} />
                    <Route path="/dashboard/properties-list" element={<DashboardPropertiesList />} />
                    <Route path="/dashboard/add-property" element={<DashboardAddProperty />} />
                    <Route path="/dashboard/favourites" element={<DashboardFavourites />} />
                    <Route path="/dashboard/saved-search" element={<DashboardSavedSearch />} />
                    <Route path="/dashboard/review" element={<DashboardReview />} />
                    <Route path="/dashboard/edit-property/:id" element={<DashboardEditProperty />} />
                    {/* Add any other future protected routes inside this wrapper */}
                </Route>

                {/* --- CATCH-ALL / NOT FOUND ROUTE --- */}
                {/* This route will match any URL that hasn't been matched above. */}
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </Router>
    );
};

export default AppNavigation;
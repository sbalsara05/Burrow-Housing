import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import ScrollToTop from '../components/common/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from "./ProtectedRoutes";

//import routes
import HomeThree from '../pages/HomeThree';
import AboutUsOne from '../pages/AboutUsOne';
import Agent from '../pages/Agent';
import ListingOne from '../pages/ListingOne';
import ListingFourteen from '../pages/ListingFourteen';
import ListingDetailsOne from '../pages/ListingDetailsOne';
import Contact from '../pages/Contact';
import Faq from '../pages/Faq';
import NotFound from '../pages/NotFound';
import DashboardIndex from '../pages/DashboardIndex';
import DashboardMessage from '../pages/DashboardMessage';
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

const AppNavigation = () => {
    return (
        <Router>
            <ScrollToTop />
            <ToastContainer position="top-center" />
            <Routes>
                {/* --- PUBLIC ROUTES --- */}
                {/* These routes are accessible to everyone, logged in or not. */}

                <Route path="/" element={<Navigate to="/home-three" replace />} />
                <Route path="/home-three" element={<HomeThree />} />
                <Route path="/about_us_01" element={<AboutUsOne />} />                
                <Route path="/agent" element={<Agent />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/listing_01" element={<ListingOne />} />
                <Route path="/listing_14" element={<ListingFourteen />} />
                <Route path="/listing_details_01/:id" element={<ListingDetailsOne />} />


                {/* --- PROTECTED ROUTES --- */}
                {/* These routes are only accessible to authenticated users.
            If a non-authenticated user tries to access them, they will be
            redirected to the login page ("/home-three"). */}

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard/dashboard-index" element={<DashboardIndex />} />
                    <Route path="/dashboard/message" element={<DashboardMessage />} />
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

                    {/* Add any other future protected routes inside this wrapper */}
                </Route>

                {/* --- CATCH-ALL / NOT FOUND ROUTE --- */}
                {/* This route will match any URL that hasn't been matched above. */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppNavigation;
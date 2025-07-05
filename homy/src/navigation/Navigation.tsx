import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import ScrollToTop from '../components/common/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from "./ProtectedRoutes";

//import routes
import Home from '../pages/Home';
import HomeThree from '../pages/HomeThree';
import AboutUsOne from '../pages/AboutUsOne';
import AboutUsTwo from '../pages/AboutUsTwo';
import Agency from '../pages/Agency';
import AgencyDetails from '../pages/AgencyDetails';
import Agent from '../pages/Agent';
import AgentDetails from '../pages/AgentDetails';
import ProjectOne from '../pages/ProjectOne';
import ProjectTwo from '../pages/ProjectTwo';
import ProjectThree from '../pages/ProjectThree';
import ProjectFour from '../pages/ProjectFour';
import ProjectDetails from '../pages/ProjectDetails';
import ServiceOne from '../pages/ServiceOne';
import ServiceTwo from '../pages/ServiceTwo';
import ServiceDetails from '../pages/ServiceDetails';
import ListingOne from '../pages/ListingOne';
import ListingFourteen from '../pages/ListingFourteen';
import ListingDetailsOne from '../pages/ListingDetailsOne';
import Compare from '../pages/Compare';
import PricingOne from '../pages/PricingOne';
import PricingTwo from '../pages/PricingTwo';
import Contact from '../pages/Contact';
import Faq from '../pages/Faq';
import NotFound from '../pages/NotFound';
import BlogOne from '../pages/BlogOne';
import BlogTwo from '../pages/BlogTwo';
import BlogThree from '../pages/BlogThree';
import BlogDetails from '../pages/BlogDetails';
import DynamicBlogDeatils from '../pages/DynamicBlogDeatils';
import DashboardIndex from '../pages/DashboardIndex';
import DashboardMessage from '../pages/DashboardMessage';
import DashboardProfile from '../pages/DashboardProfile';
import DashboardAccountSettings from '../pages/DashboardAccountSettings';
import DashboardMembership from '../pages/DashboardMembership';
import DashboardPropertiesList from '../pages/DashboardPropertiesList';
import DashboardAddProperty from '../pages/DashboardAddProperty';
import DashboardFavourites from '../pages/DashboardFavourites';
import DashboardSavedSearch from '../pages/DashboardSavedSearch';
import DashboardReview from '../pages/DashboardReview';
import PasswordChange from '../components/dashboard/account-settings/password-change';

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
                <Route path="/about_us_02" element={<AboutUsTwo />} />
                <Route path="/agency" element={<Agency />} />
                <Route path="/agency_details" element={<AgencyDetails />} />
                <Route path="/agent" element={<Agent />} />
                <Route path="/agent_details" element={<AgentDetails />} />
                <Route path="/project_01" element={<ProjectOne />} />
                <Route path="/project_02" element={<ProjectTwo />} />
                <Route path="/project_03" element={<ProjectThree />} />
                <Route path="/project_04" element={<ProjectFour />} />
                <Route path="/project_details_01" element={<ProjectDetails />} />
                <Route path="/service_01" element={<ServiceOne />} />
                <Route path="/service_02" element={<ServiceTwo />} />
                <Route path="/service_details" element={<ServiceDetails />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/pricing_01" element={<PricingOne />} />
                <Route path="/pricing_02" element={<PricingTwo />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/listing_01" element={<ListingOne />} />
                <Route path="/listing_14" element={<ListingFourteen />} />
                <Route path="/listing_details_01/:id" element={<ListingDetailsOne />} />
                <Route path="/blog_01" element={<BlogOne />} />
                <Route path="/blog_02" element={<BlogTwo />} />
                <Route path="/blog_03" element={<BlogThree />} />
                <Route path="/blog_details" element={<BlogDetails />} />
                <Route path="/blog_details/:id" element={<DynamicBlogDeatils />} />

                {/* --- PROTECTED ROUTES --- */}
                {/* These routes are only accessible to authenticated users.
            If a non-authenticated user tries to access them, they will be
            redirected to the login page ("/home-three"). */}

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard/dashboard-index" element={<DashboardIndex />} />
                    <Route path="/dashboard/message" element={<DashboardMessage />} />
                    <Route path="/dashboard/profile" element={<DashboardProfile />} />
                    <Route path="/dashboard/account-settings" element={<DashboardAccountSettings />} />
                    <Route path="/dashboard/account-settings/password-change" element={<PasswordChange />} />
                    <Route path="/dashboard/membership" element={<DashboardMembership />} />
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
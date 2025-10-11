import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/slices/store';
import { verifyResetToken, submitPasswordReset, selectAuthLoading, selectAuthError, clearAuthError } from '../redux/slices/authSlice';
import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import Footer from '../layouts/footers/Footer';
import ResetPasswordForm from '../components/forms/ResetPasswordForm';

type PageStatus = 'verifying' | 'valid' | 'invalid' | 'success';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [status, setStatus] = useState<PageStatus>('verifying');
    const isLoading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);

    useEffect(() => {
        dispatch(clearAuthError());
        if (!token) {
            setStatus('invalid');
            return;
        }
        const verify = async () => {
            const resultAction = await dispatch(verifyResetToken(token));
            if (verifyResetToken.fulfilled.match(resultAction)) {
                setStatus('valid');
            } else {
                setStatus('invalid');
            }
        };
        verify();
    }, [token, dispatch]);

    const handleResetSubmit = async (data: { newPassword: string }) => {
        if (!token) return;
        const resultAction = await dispatch(submitPasswordReset({ token, newPassword: data.newPassword }));
        if (submitPasswordReset.fulfilled.match(resultAction)) {
            setStatus('success');
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return <div className="text-center"><h4>Verifying link...</h4></div>;
            case 'invalid':
                return (
                    <div className="text-center">
                        <h3>Invalid or Expired Link</h3>
                        <p className="fs-20 color-dark mt-20">This password reset link is no longer valid. Please request a new one.</p>
                        <Link to="/home" className="btn-two w-100 text-uppercase d-block mt-20">BACK TO HOME</Link>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center">
                        <h3>Password Updated!</h3>
                        <p className="fs-20 color-dark mt-20">Your password has been changed successfully.</p>
                        <Link to="/home" className="btn-two w-100 text-uppercase d-block mt-20">PROCEED TO LOGIN</Link>
                    </div>
                );
            case 'valid':
                return (
                    <>
                        <div className="text-center mb-20">
                            <h2>Create New Password</h2>
                            <p className="fs-20 color-dark">Please enter and confirm your new password below.</p>
                        </div>
                        <ResetPasswordForm onSubmit={handleResetSubmit} isLoading={isLoading} error={error} />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Wrapper>
            <SEO pageTitle={'Reset Password'} />
            <HeaderOne style={true} />
            <div className="user-data-page pt-150 pb-150 xl-pt-120 md-pt-100 xl-pb-120 md-pb-80">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-8 col-lg-10 m-auto">
                            <div className="user-data-form">
                                <div className="form-wrapper m-auto">
                                    {renderContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Wrapper>
    );
};

export default ResetPasswordPage;
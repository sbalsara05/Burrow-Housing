import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from '../../../../redux/slices/store';
import {
    changePassword,
    logoutUser,
    selectAuthLoading,
    selectAuthError,
    clearAuthError,
} from '../../../../redux/slices/authSlice';
import DashboardHeaderTwo from '../../../../layouts/headers/dashboard/DashboardHeaderTwo';
import { Link } from 'react-router-dom';

// form data and validation schema
interface FormData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const schema = yup.object({
    oldPassword: yup.string().required('Old password is required.'),
    newPassword: yup
        .string()
        .required('New password is required.')
        .min(8, 'Password must be at least 8 characters long.')
        .matches(/[A-Za-z]/, "Password must include a letter.")
        .matches(/\d/, 'Password must include a number.')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must include a special character.')
        .notOneOf([yup.ref('oldPassword')], 'New password cannot be the same as the old password.'),
    confirmPassword: yup
        .string()
        .required('Please confirm your new password.')
        .oneOf([yup.ref('newPassword')], 'Passwords must match.'),
}).required();

const PasswordChangeBody: React.FC = () => {
    // Setup hooks
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    // State for UI control
    const [isOldPasswordVisible, setOldPasswordVisibility] = useState(false);
    const [isNewPasswordVisible, setNewPasswordVisibility] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisibility] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess) {
            const initialCountdown = 5;
            setCountdown(initialCountdown);
            toast.info(`For your security, you will be logged out in ${initialCountdown} seconds.`, { autoClose: 4000 });
            const intervalId = setInterval(() => {
                setCountdown((prevCount) => prevCount - 1);
            }, 1000);
            const logoutTimeoutId = setTimeout(() => {
                dispatch(logoutUser());
            }, initialCountdown * 1000);
            return () => {
                clearInterval(intervalId);
                clearTimeout(logoutTimeoutId);
            };
        }
    }, [isSuccess, dispatch]);

    // Form submission
    const onSubmit = async (data: FormData) => {
        dispatch(clearAuthError());
        const { oldPassword, newPassword } = data;
        try {
            await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
            toast.success("Password changed successfully!");
            setIsSuccess(true);
            reset();
        } catch (err: any) {
            toast.error(err || 'An unknown error occurred.');
        }
    };

    return (
        <div className="dashboard-body">
            <div className="position-relative">
                <DashboardHeaderTwo title="Change Password" />
                <h2 className="main-title d-block d-lg-none">Change Password</h2>

                <div className="user-data-form" style={{ maxWidth: "none"}}>
                    <div className="bg-white card-box border-20">
                        {isSuccess ? (
                            // SUCCESS VIEW
                            <div className="text-center p-4">
                                <img src="/assets/images/icon/icon_74.svg" alt="Success" className="lazy-img m-auto mb-3" style={{ width: "80px" }} />
                                <h3 className="tx-dark">Password Updated</h3>
                                <p className="fs-20 tx-dark mt-20">Your password has been changed successfully.</p>
                                <p className="fs-18 tx-dark mt-30">You will be logged out in <strong className="color-dark">{countdown}</strong> seconds.</p>
                                <button onClick={() => dispatch(logoutUser())} className="dash-btn-two tran3s mt-30">
                                    Logout Now
                                </button>
                            </div>
                        ) : (
                            <div className="form-wrapper" style={{ maxWidth: "none"}}>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="input-group-meta position-relative mb-25">
                                                <label>Old Password*</label>
                                                <input
                                                    type={isOldPasswordVisible ? "text" : "password"}
                                                    {...register("oldPassword")}
                                                    placeholder="Enter your current password"
                                                    className="pass_log_id"
                                                />
                                                <span className="placeholder_icon">
                                                    <span onClick={() => setOldPasswordVisibility(!isOldPasswordVisible)} className={`passVicon ${isOldPasswordVisible ? "eye-slash" : ""}`} style={{ cursor: 'pointer' }}>
                                                        <img src="/assets/images/icon/icon_68.svg" alt="Toggle" />
                                                    </span>
                                                </span>
                                                {errors.oldPassword && <p className="form_error">{errors.oldPassword.message}</p>}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="input-group-meta position-relative mb-25">
                                                <label>New Password*</label>
                                                <input
                                                    type={isNewPasswordVisible ? "text" : "password"}
                                                    {...register("newPassword")}
                                                    placeholder="Enter a new password"
                                                    className="pass_log_id"
                                                />
                                                <span className="placeholder_icon">
                                                    <span onClick={() => setNewPasswordVisibility(!isNewPasswordVisible)} className={`passVicon ${isNewPasswordVisible ? "eye-slash" : ""}`} style={{ cursor: 'pointer' }}>
                                                        <img src="/assets/images/icon/icon_68.svg" alt="Toggle" />
                                                    </span>
                                                </span>
                                                {errors.newPassword && <p className="form_error">{errors.newPassword.message}</p>}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="input-group-meta position-relative mb-25">
                                                <label>Confirm Password*</label>
                                                <input
                                                    type={isConfirmPasswordVisible ? "text" : "password"}
                                                    {...register("confirmPassword")}
                                                    placeholder="Confirm your new password"
                                                    className="pass_log_id"
                                                />
                                                <span className="placeholder_icon">
                                                    <span onClick={() => setConfirmPasswordVisibility(!isConfirmPasswordVisible)} className={`passVicon ${isConfirmPasswordVisible ? "eye-slash" : ""}`} style={{ cursor: 'pointer' }}>
                                                        <img src="/assets/images/icon/icon_68.svg" alt="Toggle" />
                                                    </span>
                                                </span>
                                                {errors.confirmPassword && <p className="form_error">{errors.confirmPassword.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="button-group d-inline-flex align-items-center mt-10">
                                        <button type="submit" className="dash-btn-two tran3s" disabled={isLoading}>
                                            {isLoading ? 'Saving...' : 'Save & Update'}
                                        </button>
                                        <Link to="/dashboard/account-settings" className="dash-cancel-btn tran3s ms-3">
                                            Cancel
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PasswordChangeBody;
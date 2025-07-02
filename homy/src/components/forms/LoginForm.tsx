// frontend/components/forms/LoginForm.tsx
import React, { useState, useEffect } from "react"; // Import React
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError, selectAuthLoading, selectAuthError, selectIsVerificationRequired, resetVerificationFlag, selectOtpEmail } from '../../redux/slices/authSlice'; // Corrected import path
import { AppDispatch, RootState } from '../../redux/slices/store.ts'; // Corrected import path

// Define FormData interface locally or import if shared
interface FormData {
    email: string;
    password: string;
}

interface LoginFormProps {
    onOtpRequired?: (email: string) => void;
}

// Define your validation schema
const schema = yup
    .object({
        email: yup
            .string()
            .required("Email is required")
            .email("Must be a valid email")
            .test(
                "is-edu",
                "Email must end with .edu domain",
                (value) => value?.toLowerCase().endsWith(".edu") || false
            )
            .label("Email"),
        password: yup.string().required().label("Password"),
    })
    .required();


const LoginForm: React.FC<LoginFormProps> = ({ onOtpRequired }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);
    const isVerificationRequired = useSelector(selectIsVerificationRequired);
    const otpEmail = useSelector(selectOtpEmail); // Get email from state for OTP transition
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        getValues // Added getValues
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });
    const [isPasswordVisible, setPasswordVisibility] = useState(false);

    // Clear error when component mounts or tab changes
    useEffect(() => {
        dispatch(clearAuthError());
        // If navigating away from OTP, reset the flag
        // return () => {
        //     dispatch(resetVerificationFlag()); // Reset flag on unmount/tab switch away
        // };
    }, [dispatch]);

    // Handle transition to OTP screen when flag is set
    useEffect(() => {
        // Ensure otpEmail is also available before triggering
        if (isVerificationRequired && onOtpRequired && otpEmail) {
            onOtpRequired(otpEmail);
            // Reset flag after triggering OTP screen to prevent re-triggering on re-renders
            dispatch(resetVerificationFlag());
        }
    }, [isVerificationRequired, onOtpRequired, otpEmail, dispatch]);


    const togglePasswordVisibility = () => setPasswordVisibility(!isPasswordVisible);

    const onSubmit = async (data: FormData) => {
        dispatch(clearAuthError()); // Clear previous errors
        const resultAction = await dispatch(loginUser(data));

        if (loginUser.fulfilled.match(resultAction)) {
            toast.success("Login successful!", { position: "top-center" });
            navigate(`/dashboard/profile`); // Redirect on success
            reset();
        } else if (loginUser.rejected.match(resultAction)) {
            // Error message (non-OTP) will be shown via selector
            // OTP requirement handled by useEffect
            if (!resultAction.payload?.requiresVerification) {
                // Only show toast for non-OTP errors, as OTP error is handled by state change
                toast.error(resultAction.payload as string || "Login failed!", { position: "top-center" });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Display Redux error only if it's not related to OTP verification */}
            {error && !isVerificationRequired && <p className="form_error api_error">{error}</p>}
            <div className="row">
                <div className="col-12">
                    <div className="input-group-meta position-relative mb-25">
                        <label>Email*</label>
                        <input type="email" {...register("email")} placeholder="youremail@university.edu" />
                        <p className="form_error">{errors.email?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <div className="input-group-meta position-relative mb-20">
                        <label>Password*</label>
                        <input
                            type={isPasswordVisible ? "text" : "password"}
                            {...register("password")}
                            placeholder="Enter Password"
                            className="pass_log_id"
                        />
                        <span className="placeholder_icon">
                            <span className={`passVicon ${isPasswordVisible ? "eye-slash" : ""}`}>
                                <img onClick={togglePasswordVisibility} src="/assets/images/icon/icon_68.svg" alt="Toggle Password Visibility" />
                            </span>
                        </span>
                        <p className="form_error">{errors.password?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <div className="agreement-checkbox d-flex justify-content-between align-items-center">
                        <div>
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Keep me logged in</label>
                        </div>
                        <Link to="#">Forget Password?</Link> {/* Implement forgot password flow separately */}
                    </div>
                </div>
                <div className="col-12">
                    <button
                        type="submit"
                        className="btn-two w-100 text-uppercase d-block mt-20"
                        disabled={isLoading}
                    >
                        {isLoading ? "PROCESSING..." : "LOGIN"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default LoginForm;
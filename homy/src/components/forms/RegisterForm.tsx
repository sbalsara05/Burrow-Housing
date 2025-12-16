// frontend/components/forms/RegisterForm.tsx
import React, { useState, useEffect } from "react"; // Import React
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError, selectAuthLoading, selectAuthError, selectIsVerificationRequired, selectOtpEmail, resetVerificationFlag } from '../../redux/slices/authSlice'; // Corrected import path
import { AppDispatch } from '../../redux/slices/store.ts'; // Corrected import path

// Define FormData interface
interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    whatsappNumber: string;
    terms: boolean;
}

interface RegisterFormProps {
    onOtpRequired?: (email: string) => void;
}

// Define your validation schema
const schema = yup
    .object({
        name: yup.string().required("Name is required."),
        email: yup
            .string()
            .required("Email is required.")
            .email("Enter a valid email.")
            .test(
                "is-edu",
                "Email must end with .edu domain",
                (value) => value?.toLowerCase().endsWith(".edu") || false
            ),
        password: yup
            .string()
            .required("Password is required.")
            .min(8, "Password must be at least 8 characters.")
            .matches(/[A-Z]/, "Password must include an uppercase letter.")
            .matches(/\d/, "Password must include a number.")
            .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must include a special character."),
        confirmPassword: yup
            .string()
            .required("Please confirm your password.")
            .oneOf([yup.ref("password")], "Passwords must match."),
        whatsappNumber: yup
            .string()
            .required("Phone number is required.")
            .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,10}[-\s.]?[0-9]{1,10}$/, {
                message: "Please enter a valid number."
            }),
        terms: yup
            .boolean()
            .required("Terms acceptance is required.")
            .oneOf([true], "You must accept the terms and conditions."),
    })
    .required();


const RegisterForm: React.FC<RegisterFormProps> = ({ onOtpRequired }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);
    const isVerificationRequired = useSelector(selectIsVerificationRequired);
    const otpEmail = useSelector(selectOtpEmail); // Get email from state

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const [isPasswordVisible, setPasswordVisibility] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisibility] = useState(false);

    // Clear error on mount/tab change
    useEffect(() => {
        dispatch(clearAuthError());
        // Reset flag on unmount/tab switch away
        // return () => {
        //     dispatch(resetVerificationFlag());
        // };
    }, [dispatch]);

    // Handle OTP transition after successful registration
    useEffect(() => {
        if (isVerificationRequired && onOtpRequired && otpEmail) {
            onOtpRequired(otpEmail);
            // Reset flag after triggering OTP screen
            dispatch(resetVerificationFlag());
        }
    }, [isVerificationRequired, onOtpRequired, otpEmail, dispatch]);

    const togglePasswordVisibility = () => setPasswordVisibility(!isPasswordVisible);
    const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisibility(!isConfirmPasswordVisible);

    const onSubmit = async (data: FormData) => {
        dispatch(clearAuthError());
        // Prepare data for the API (exclude confirmPassword, terms)
        const { confirmPassword, terms, ...submitData } = data;

        const resultAction = await dispatch(registerUser(submitData));

        if (registerUser.fulfilled.match(resultAction)) {
            toast.success("Registration initiated! Please verify your email.", { position: "top-center" });
            reset(); // Clear form on successful initiation
            // OTP transition is handled by the useEffect above
        } else if (registerUser.rejected.match(resultAction)) {
            toast.error(resultAction.payload as string || "Registration failed!", { position: "top-center" });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Display Redux error */}
            {error && <p className="form_error api_error">{error}</p>}
            <div className="row">
                <div className="col-12">
                    <div className="input-group-meta position-relative mb-25">
                        <label>Name*</label>
                        <input type="text" {...register("name")} placeholder="Your Full Name" />
                        <p className="form_error">{errors.name?.message}</p>
                    </div>
                </div>
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
                                <img onClick={togglePasswordVisibility} src="/assets/images/icon/icon_68.svg" alt="Toggle Password" />
                            </span>
                        </span>
                        <p className="form_error">{errors.password?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <div className="input-group-meta position-relative mb-20">
                        <label>Confirm Password*</label>
                        <input
                            type={isConfirmPasswordVisible ? "text" : "password"}
                            {...register("confirmPassword")}
                            placeholder="Confirm Your Password"
                            className="pass_log_id"
                        />
                        <span className="placeholder_icon">
                            <span className={`passVicon ${isConfirmPasswordVisible ? "eye-slash" : ""}`}>
                                <img onClick={toggleConfirmPasswordVisibility} src="/assets/images/icon/icon_68.svg" alt="Toggle Password" />
                            </span>
                        </span>
                        <p className="form_error">{errors.confirmPassword?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <div className="input-group-meta position-relative mb-25">
                        <label>Phone Number*</label>
                        <input type="tel" {...register("whatsappNumber")} placeholder="+1 (123) 456-7890" />
                        <p className="form_error">{errors.whatsappNumber?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <div className="agreement-checkbox d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-start">
                            <input
                                type="checkbox"
                                id="terms"
                                {...register("terms")}
                                style={{ cursor: "pointer", marginTop: "4px" }}
                            />
                            <div className="ms-2">
                                <label htmlFor="terms" style={{ cursor: "pointer" }}>
                                    By hitting the "Register" button, you agree to the
                                </label>{" "}
                                <span>
                                    <Link to="#">Terms and Conditions</Link> &{" "}
                                    <Link to="#">Privacy Policy</Link>
                                </span>
                                <p className="form_error">{errors.terms?.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <button
                        type="submit"
                        className="btn-two w-100 text-uppercase d-block mt-20"
                        disabled={isLoading} // Disable button while loading
                    >
                        {isLoading ? "PROCESSING..." : "SIGN UP"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default RegisterForm;
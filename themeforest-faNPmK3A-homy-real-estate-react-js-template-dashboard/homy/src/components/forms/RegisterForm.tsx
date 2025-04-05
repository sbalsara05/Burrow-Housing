import { useState } from "react";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

const RegisterForm = ({ onOtpRequired }: RegisterFormProps) => {
    // Validation Schema
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
                .required("WhatsApp number is required.")
                .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,10}[-\s.]?[0-9]{1,10}$/, {
                    message: "Please enter a valid number."
                }),
            terms: yup
                .boolean()
                .required("Terms acceptance is required.")
                .oneOf([true], "You must accept the terms and conditions."),
        })
        .required();

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
const [isSubmitting, setIsSubmitting] = useState(false);

const navigate = useNavigate();

const togglePasswordVisibility = () => {
    setPasswordVisibility(!isPasswordVisible);
};

const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisibility(!isConfirmPasswordVisible);
};

const onSubmit = async (data: FormData) => {
    try {
        setIsSubmitting(true);
        // Remove confirmPassword and terms before sending to backend
        const { confirmPassword, terms, ...submitData } = data;

        // Send data to the backend API
        const response = await axios.post("http://localhost:3000/api/register", submitData);

        if (response.status === 201) {
            toast.success("Registration initiated! Please verify your email.", { position: "top-center" });

            // Use the parent component's OTP handler if provided
            if (onOtpRequired) {
                onOtpRequired(data.email);
            }
        }
    } catch (error: any) {
        // If there's an error, show the error message
        if (error.response && error.response.data) {
            toast.error(error.response.data.message || "Registration Failed", { position: "top-center" });
        } else {
            toast.error("Something went wrong. Please try again.", { position: "top-center" });
        }
    } finally {
        setIsSubmitting(false);
    }
};

return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                    <label>WhatsApp Number</label>
                    <input type="tel" {...register("whatsappNumber")} placeholder="+1 (123) 456-7890" />
                    <p className="form_error">{errors.whatsappNumber?.message}</p>
                </div>
            </div>
            <div className="col-12">
                <div className="agreement-checkbox d-flex justify-content-between align-items-center">
                    <div>
                        <input type="checkbox" id="terms" {...register("terms")} />
                        <label htmlFor="terms">
                            By hitting the &quot;Register&quot; button, you agree to the{" "}
                            <Link to="#">Terms and Conditions</Link> & <Link to="#">Privacy Policy</Link>
                        </label>
                        <p className="form_error">{errors.terms?.message}</p>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <button
                    type="submit"
                    className="btn-two w-100 text-uppercase d-block mt-20"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "PROCESSING..." : "SIGN UP"}
                </button>
            </div>
        </div>
    </form>
);
};

export default RegisterForm;
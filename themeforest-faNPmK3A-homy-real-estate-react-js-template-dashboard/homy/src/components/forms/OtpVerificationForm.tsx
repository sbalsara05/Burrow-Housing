// frontend/components/forms/OtpVerificationForm.tsx
import React, { useState, useEffect } from "react"; // Import React
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, resendOtp, clearAuthError, selectAuthLoading, selectAuthError, resetVerificationFlag } from '../../redux/slices/authSlice'; // Corrected import path
import { AppDispatch } from '../../redux/store'; // Corrected import path

interface OtpFormData {
    otp: string;
}

interface OtpVerificationFormProps {
    email: string; // Email is passed as a prop now
    goBack: () => void;
    onSuccess: () => void; // Callback on successful verification
}

const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({ email, goBack, onSuccess }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector(selectAuthLoading); // Use main loading indicator
    const error = useSelector(selectAuthError);
    const [isResending, setIsResending] = useState(false); // Specific loading for resend button

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        trigger, // To manually trigger validation
    } = useForm<OtpFormData>({
        defaultValues: { otp: "" },
    });

    // Clear error on mount
    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    // Cleanup the verification flag when navigating back or unmounting
    // This prevents the modal from reopening in OTP mode accidentally
    useEffect(() => {
        return () => {
            dispatch(resetVerificationFlag());
        };
    }, [dispatch]);


    // --- OTP Input Logic (Compile, HandleChange, KeyDown, Paste) ---
    // (Keep the existing logic for these handlers as provided in previous examples)
    const compileOtp = () => {
        let otpValue = "";
        for (let i = 0; i < 6; i++) {
            const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
            if (input && input.value) otpValue += input.value;
        }
        return otpValue;
    };

    const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (value && value.length > 1) e.target.value = value.charAt(0); // Ensure single digit

        if (value && value.length === 1 && /^\d+$/.test(value)) {
            const compiledOtp = compileOtp();
            setValue("otp", compiledOtp); // Update hidden field
            if (compiledOtp.length === 6) { // Trigger validation only when full
                trigger("otp");
            }
            if (index < 5) {
                (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
            }
        } else if (!value) {
            // Also update hidden field on deletion
            setValue("otp", compileOtp());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && index > 0 && (e.target as HTMLInputElement).value === "") {
            (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
            setValue("otp", compileOtp()); // Update hidden field on backspace
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        if (/^\d{1,6}$/.test(pastedData)) {
            const digits = pastedData.slice(0, 6).split("");
            digits.forEach((digit, index) => {
                const input = document.getElementById(`otp-${index}`) as HTMLInputElement;
                if (input) input.value = digit;
            });
            const otpValue = digits.join("");
            setValue("otp", otpValue);
            if (otpValue.length === 6) {
                trigger("otp"); // Trigger validation
            }
            const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
            (document.getElementById(`otp-${nextEmptyIndex}`) as HTMLInputElement)?.focus();
        }
    };
    // --- End OTP Input Logic ---


    const onResendOtp = async () => {
        setIsResending(true);
        dispatch(clearAuthError()); // Clear previous errors
        const resultAction = await dispatch(resendOtp({ email }));
        setIsResending(false);

        if (resendOtp.fulfilled.match(resultAction)) {
            toast.success("OTP has been resent to your email", { position: "top-center" });
        } else if (resendOtp.rejected.match(resultAction)) {
            // Display specific resend error from Redux state (if needed) or just a toast
            toast.error(resultAction.payload as string || "Failed to resend OTP", { position: "top-center" });
        }
    };

    const onSubmit = async () => { // Renamed from internalSubmit for clarity
        // Explicitly compile and set value before submitting
        const otpValue = compileOtp();
        setValue("otp", otpValue);

        // Manually trigger validation before dispatching
        const isValid = await trigger("otp");
        if (!isValid) {
            // Errors will be shown by the form state
            return;
        }

        dispatch(clearAuthError()); // Clear previous errors
        const resultAction = await dispatch(verifyOtp({ email, otp: otpValue }));

        if (verifyOtp.fulfilled.match(resultAction)) {
            toast.success("Email verified successfully!", { position: "top-center" });
            onSuccess(); // Call the success callback (e.g., close modal, navigate)
        } else if (verifyOtp.rejected.match(resultAction)) {
            // Error message is now handled by the useSelector below
            // No need for specific toast here unless you want redundancy
        }
    };

    return (
        <div className="otp-verification-form">
            <div className="text-center mb-20">
                <h2>Email Verification</h2>
                <p className="fs-20 color-dark otp-info">
                    We've sent a verification code to your email: <br />
                    <strong className="email-highlight">{email}</strong>
                </p>
            </div>

            {/* Display Redux error */}
            {error && <p className="form_error api_error text-center">{error}</p>}

            {/* Use handleSubmit from react-hook-form to trigger internal validation first */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                    <div className="col-12">
                        <div className="input-group-meta position-relative mb-25">
                            <label>Enter 6-Digit OTP</label>
                            <div className="otp-inputs-container" onPaste={handlePaste}>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text" // Use text for better control over single digit and backspace
                                        className="otp-input"
                                        maxLength={1}
                                        onChange={(e) => handleDigitChange(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        autoFocus={index === 0}
                                        inputMode="numeric" // Hint for mobile keyboards
                                        pattern="[0-9]*" // Basic pattern validation
                                    />
                                ))}
                                {/* Hidden input registered with react-hook-form for validation */}
                                <input
                                    type="hidden"
                                    {...register("otp", {
                                        required: "OTP is required",
                                        pattern: {
                                            value: /^\d{6}$/,
                                            message: "Please enter a valid 6-digit OTP"
                                        }
                                    })}
                                />
                            </div>
                            {/* Display react-hook-form validation error */}
                            {errors.otp && <p className="form_error">{errors.otp.message}</p>}
                        </div>
                    </div>

                    <div className="col-12 text-center mb-20">
                        <p className="fs-15">
                            Didn't receive the code?{" "}
                            <button
                                type="button"
                                className="resend-button" // Style this button appropriately
                                onClick={onResendOtp}
                                disabled={isResending || isLoading} // Disable while resending or verifying
                            >
                                {isResending ? "Resending..." : "Resend OTP"}
                            </button>
                        </p>
                    </div>

                    <div className="col-12 form-actions d-flex justify-content-between"> {/* Use flex for layout */}
                        <button
                            type="button"
                            className="btn-outline-dark" // Style as needed
                            onClick={goBack}
                            disabled={isLoading} // Disable while verifying
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="btn-two" // Your primary button style
                            disabled={isLoading} // Disable while verifying
                        >
                            {isLoading ? "Verifying..." : "Verify & Continue"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default OtpVerificationForm;
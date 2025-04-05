import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface OtpFormData {
  otp: string;
}

interface OtpVerificationFormProps {
  email: string;
  goBack: () => void;
  onSuccess: () => void;
}

const OtpVerificationForm = ({ email, goBack, onSuccess }: OtpVerificationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<OtpFormData>({
    defaultValues: {
      otp: "",
    },
  });

  // Function to compile OTP from individual inputs
  const compileOtp = () => {
    let otpValue = "";
    for (let i = 0; i < 6; i++) {
      const input = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (input && input.value) {
        otpValue += input.value;
      }
    }
    return otpValue;
  };

  // Handle individual digit input and auto-focus next input
  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow one digit
    if (value && value.length > 1) {
      e.target.value = value.charAt(0);
    }
    
    if (value && value.length === 1 && /^\d+$/.test(value)) {
      // After each input change, compile the OTP and update the hidden field
      const compiledOtp = compileOtp();
      setValue("otp", compiledOtp, { shouldValidate: true });
      
      // Auto focus next input
      if (index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };
  
  // Handle backspace key to focus previous input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && index > 0 && (e.target as HTMLInputElement).value === "") {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const onResendOtp = async () => {
    try {
      setIsSubmitting(true);
      // Call your API to resend OTP
      const response = await axios.post("http://localhost:3000/api/resend-otp", { email });
      
      if (response.status === 200) {
        toast.success("OTP has been resent to your email", { position: "top-center" });
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Failed to resend OTP", { position: "top-center" });
      } else {
        toast.error("Something went wrong. Please try again.", { position: "top-center" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: OtpFormData) => {
    try {
      setIsSubmitting(true);
      
      // Ensure we have the most up-to-date OTP value
      const otpValue = compileOtp();
      setValue("otp", otpValue);
      
      // Validate OTP length
      if (otpValue.length !== 6) {
        toast.error("Please enter a complete 6-digit OTP", { position: "top-center" });
        setIsSubmitting(false);
        return;
      }
      
      // Send verification request to API
      const response = await axios.post("http://localhost:3000/api/verify-otp", {
        email,
        otp: otpValue
      });

      if (response.status === 200) {
        toast.success("Email verified successfully!", { position: "top-center" });
        
        // Store token if returned by API
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        
        // Call success callback (may redirect to dashboard)
        onSuccess();
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "OTP verification failed", { position: "top-center" });
      } else {
        toast.error("Something went wrong. Please try again.", { position: "top-center" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paste functionality for OTP
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    
    // Check if pasted content is numeric and of appropriate length
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, 6).split("");
      
      // Fill in the inputs with the pasted digits
      digits.forEach((digit, index) => {
        const input = document.getElementById(`otp-${index}`) as HTMLInputElement;
        if (input) {
          input.value = digit;
        }
      });
      
      // Update the hidden input with the full OTP
      setValue("otp", digits.join(""), { shouldValidate: true });
      
      // Focus the next empty input or the last input if all are filled
      const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
      const nextInput = document.getElementById(`otp-${nextEmptyIndex}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
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
                    type="text"
                    className="otp-input"
                    maxLength={1}
                    onChange={(e) => handleDigitChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    autoFocus={index === 0}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
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
              {errors.otp && <p className="form_error">{errors.otp.message}</p>}
            </div>
          </div>
          
          <div className="col-12 text-center mb-20">
            <p className="fs-15">
              Didn't receive the code?{" "}
              <button 
                type="button" 
                className="resend-button" 
                onClick={onResendOtp}
                disabled={isSubmitting}
              >
                Resend OTP
              </button>
            </p>
          </div>
          
          <div className="col-12 form-actions">
            <button 
              type="button" 
              className="btn-outline-dark"
              onClick={goBack}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="btn-two"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify & Continue"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OtpVerificationForm;
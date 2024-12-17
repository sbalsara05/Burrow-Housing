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
   terms: boolean;
}

const RegisterForm = () => {
   // Validation Schema
   const schema = yup
      .object({
         name: yup.string().required("Name is required."),
         email: yup.string().required("Email is required.").email("Enter a valid email."),
         password: yup
            .string()
            .required("Password is required.")
            .min(8, "Password must be at least 8 characters.")
            .matches(/[A-Z]/, "Password must include an uppercase letter.")
            .matches(/\d/, "Password must include a number.")
            .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must include a special character."),
         terms: yup.boolean().oneOf([true], "You must accept the terms and conditions."),
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
   const navigate = useNavigate();  // Initialize the navigate function

   const togglePasswordVisibility = () => {
      setPasswordVisibility(!isPasswordVisible);
   };

   const onSubmit = async (data: FormData) => {
      try {
         // Send data to the backend API (replace the URL with your actual endpoint)
         const response = await axios.post("http://localhost:3000/api/register", data);

         if (response.status === 201) {
            toast.success("Registration successful!", { position: "top-center" });
            // Redirect to /dashboard/profile after successful register
            navigate("/dashboard/profile"); // Use navigate to redirect
            reset();
         }
      } catch (error: any) {
         // If there's an error, show the error message
         if (error.response && error.response.data) {
            toast.error(error.response.data.message || "Registration Failed", { position: "top-center" });
         } else {
            toast.error("Something went wrong. Please try again.", { position: "top-center" });
         }
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
                  <input type="email" {...register("email")} placeholder="youremail@example.com" />
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
                  disabled={!!Object.keys(errors).length}
               >
                  SIGN UP
               </button>
            </div>
         </div>
      </form>
   );
};

export default RegisterForm;

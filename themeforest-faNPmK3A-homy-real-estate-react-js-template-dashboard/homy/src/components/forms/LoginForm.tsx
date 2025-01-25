import { useState } from "react";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface FormData {
   email: string;
   password: string;
}

const LoginForm = () => {
   // Validation Schema
   const schema = yup
      .object({
         email: yup.string().required().email().label("Email"),
         password: yup.string().required().label("Password"),
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
         // Send login request to API
         const response = await axios.post("http://localhost:3000/api/login", data);

         if (response.status === 200) {
            toast.success("Login successful!", { position: "top-center" });
            // Store token and user data in local storage
            localStorage.setItem("token", response.data.token);

            // Redirect to /dashboard/profile after successful login
            navigate(`/dashboard/profile`); // Use navigate to redirect
            reset();
         }
      } catch (error: any) {
         if (error.response && error.response.data) {
            toast.error(error.response.data.message || "Login failed!", { position: "top-center" });
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
                  <label>Email*</label>
                  <input type="email" {...register("email")} placeholder="Youremail@gmail.com" />
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
                        <img onClick={togglePasswordVisibility} src="/assets/images/icon/icon_68.svg" alt="" />
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
                  <Link to="#">Forget Password?</Link>
               </div>
            </div>
            <div className="col-12">
               <button type="submit" className="btn-two w-100 text-uppercase d-block mt-20">
                  Login
               </button>
            </div>
         </div>
      </form>
   );
};

export default LoginForm;

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, selectAuthLoading, selectAuthError, clearAuthError } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/slices/store';

interface FormData {
    email: string;
}

const schema = yup.object({
    email: yup.string().required("Email is required.").email("Please enter a valid email."),
}).required();

interface ForgotPasswordFormProps {
    onSuccess: () => void;
    goBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, goBack }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isLoading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        dispatch(clearAuthError());
        const resultAction = await dispatch(requestPasswordReset(data));
        if (requestPasswordReset.fulfilled.match(resultAction)) {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {error && <p className="form_error api_error text-center">{error}</p>}
            <div className="row">
                <div className="col-12">
                    <div className="input-group-meta position-relative mb-25">
                        <label>Email Address*</label>
                        <input type="email" {...register("email")} placeholder="Enter your registered email" />
                        <p className="form_error">{errors.email?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <button type="submit" className="btn-two w-100 text-uppercase d-block mt-10" disabled={isLoading}>
                        {isLoading ? "SENDING..." : "SEND RESET LINK"}
                    </button>
                </div>
                <div className="col-12 text-center mt-20">
                    <a onClick={goBack} style={{ cursor: "pointer", textDecoration: "underline" }} className="fs-18">Back to Login</a>
                </div>
            </div>
        </form>
    );
};

export default ForgotPasswordForm;
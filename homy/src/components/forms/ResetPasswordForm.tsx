import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface FormData {
    newPassword: string;
    confirmPassword: string;
}

const schema = yup.object({
    newPassword: yup.string().required('New password is required.').min(8, 'Password must be at least 8 characters.').matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must include a special character.'),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match.').required('Please confirm your password.'),
}).required();

interface ResetPasswordFormProps {
    onSubmit: (data: FormData) => void;
    isLoading: boolean;
    error: string | null;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit, isLoading, error }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: yupResolver(schema) });
    const [isPassVisible, setPassVisible] = useState(false);
    const [isConfirmPassVisible, setConfirmPassVisible] = useState(false);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {error && <p className="form_error api_error text-center">{error}</p>}
            <div className="row">
                <div className="col-12">
                    <div className="input-group-meta position-relative mb-25">
                        <label>New Password*</label>
                        <input type={isPassVisible ? "text" : "password"} {...register("newPassword")} placeholder="Enter New Password" />
                        <span className="placeholder_icon" onClick={() => setPassVisible(!isPassVisible)} style={{ cursor: 'pointer' }}><img src="/assets/images/icon/icon_68.svg" alt="" /></span>
                        <p className="form_error">{errors.newPassword?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <div className="input-group-meta position-relative mb-25">
                        <label>Confirm Password*</label>
                        <input type={isConfirmPassVisible ? "text" : "password"} {...register("confirmPassword")} placeholder="Confirm New Password" />
                        <span className="placeholder_icon" onClick={() => setConfirmPassVisible(!isConfirmPassVisible)} style={{ cursor: 'pointer' }}><img src="/assets/images/icon/icon_68.svg" alt="" /></span>
                        <p className="form_error">{errors.confirmPassword?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <button type="submit" className="btn-two w-100 text-uppercase d-block mt-10" disabled={isLoading}>
                        {isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ResetPasswordForm;
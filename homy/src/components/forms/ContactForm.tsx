import {useRef, useState} from 'react';
import emailjs from '@emailjs/browser';
import {toast} from 'react-toastify';
import * as yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from '@hookform/resolvers/yup';

interface FormData {
    user_name: string;
    user_email: string;
    message: string;
}

const schema = yup
    .object({
        user_name: yup.string().required().label("Name"),
        user_email: yup.string().required().email().label("Email"),
        message: yup.string().required().label("Message"),
    })
    .required();

const ContactForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useRef<HTMLFormElement>(null);

    const {register, handleSubmit, reset, formState: {errors}} = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    const sendEmail = async (data: FormData) => {
        if (!form.current) return;

        setIsSubmitting(true);

        try {
            await emailjs.sendForm(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                form.current,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            toast.success('Message sent successfully!', {
                position: 'top-center'
            });
            reset();
        } catch (error) {
            console.error('EmailJS error:', error);
            toast.error('Failed to send message. Please try again.', {
                position: 'top-center'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form ref={form} onSubmit={handleSubmit(sendEmail)}>
            <h3>Send Message</h3>
            <div className="messages"></div>
            <div className="row controls">
                <div className="col-12">
                    <div className="input-group-meta form-group mb-30">
                        <label htmlFor="">Name*</label>
                        <input
                            type="text"
                            {...register("user_name")}
                            name="user_name"
                            placeholder="Your Name*"
                            disabled={isSubmitting}
                        />
                        <p className="form_error">{errors.user_name?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <div className="input-group-meta form-group mb-40">
                        <label htmlFor="">Email*</label>
                        <input
                            type="email"
                            {...register("user_email")}
                            placeholder="Email Address*"
                            name="user_email"
                            disabled={isSubmitting}
                        />
                        <p className="form_error">{errors.user_email?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <div className="input-group-meta form-group mb-35">
                        <textarea
                            {...register("message")}
                            name="message"
                            placeholder="Your message*"
                            disabled={isSubmitting}
                        />
                        <p className="form_error">{errors.message?.message}</p>
                    </div>
                </div>
                <div className="col-12">
                    <button
                        type='submit'
                        className="btn-nine text-uppercase rounded-3 fw-normal w-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </div>
        </form>
    );
};
export default ContactForm
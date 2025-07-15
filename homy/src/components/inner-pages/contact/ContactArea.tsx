import {Link} from "react-router-dom";
import ContactForm from "../../forms/ContactForm";

interface DataType {
    id: number;
    class_name?: string;
    title: string;
    address_1: string;
    address_2?: string;
}

const address_data: DataType[] = [
    {
        id: 1,
        title: "We’r always happy to help.",
        address_1: "burrowhousingsublets@gmail.com"
    },
    {
        id: 2,
        class_name: "skew-line",
        title: "Our hotline number",
        address_1: "+757 699 4478,",
        address_2: "+991 377 9731",
    },
    {
        id: 3,
        title: "Live chat",
        address_1: "www.Burrowlivechat.com"
    },
]

const ContactArea = () => {
    return (
        <div className="contact-us border-top mt-130 xl-mt-100 pt-80 lg-pt-60 tw-mb-0">
            <div className="container">
                <div className="row">
                    <div className="col-xxl-9 col-xl-8 col-lg-10 m-auto">
                        <div className="title-one text-center mb-4">
                            <h3>Your Feedback Helps Us Build a Better <span className="tw-text-primary">Burrow</span></h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-pink mt-4 xl-mt-120 md-mt-80">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-7 col-lg-6">
                            <div className="form-style-one text-left">
                                <ContactForm/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ContactArea

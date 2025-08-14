import {Link} from "react-router-dom";

interface ContentType {
    title_1: string;
    title_2: string;
    desc_2: JSX.Element;
    desc_3: JSX.Element;
}

const feature_content: ContentType = {
    title_1: "Who are we?",
    title_2: "Our Mission",
    desc_2: (<>Founded by Northeastern University students, we recognized how frustrating and overwhelming it had become
        for students to find reliable housing and sublet opportunities. Navigating scattered listings, outdated
        information, and unverified sources wastes time and creates unnecessary stress, and we knew there had to be a
        better way.</>),
    desc_3: (<>Our mission is to bring every student-friendly housing and subletting option into one easy-to-use,
        trustworthy platform. We empower students to search by their exact needs and help subletters connect with a
        targeted audience, streamlining the entire process from listing to lease.
    </>),
}

const {title_1, title_2, desc_2, desc_3} = feature_content;

const BLockFeature = () => {
    return (
        <div className="block-feature-two mt-150 xl-mt-100">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div>
                            <Link to="/contact" className="btn-two tw-mb-4 tw-w-full">Contact Us</Link>
                        </div>
                        <div className="block-two">
                            <div className="bg-wrapper tw-text-left mb-20">
                                <h5>{title_1}</h5>
                                <p className="fs-22 lh-lg mt-20">{desc_2}</p>
                            </div>
                            <div className="bg-wrapper tw-text-left">
                                <h5 className="">{title_2}</h5>
                                <p className="fs-22 lh-lg mt-20">{desc_3}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BLockFeature

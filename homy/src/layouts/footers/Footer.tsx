import { Link } from "react-router-dom";
import footer_data from "../../data/home-data/FooterData";

interface ContentType {
    title: string;
    desc_1: string;
    email: string;
    number: string;
    icon: string[];
}

const footer_content: ContentType = {
    title: "Our Newsletter",
    desc_1: "Northeastern University",
    email: "burrowhousingsublets@gmail.com",
    number: "1‑800‑555‑1212",
    icon: ["facebook-f", "twitter", "instagram"],
};

const { desc_1, email } = footer_content;

const Footer = () => {
    return (
        <footer className="footer-two bg-white">
            <div className="container">
                <div className="footer-content tw-m-0">
                    {/* Main Footer Section */}
                    <div className="row gx-4 gy-4 py-5 border-bottom">
                        {/* Brand Section */}
                        <div className="col-lg-4 col-md-6">
                            <div className="footer-brand">
                                <div className="logo mb-3">
                                    <Link to="/" className="d-inline-block">
                                        <img
                                            src="/assets/images/logo/textlogo.png"
                                            alt="Burrow Housing"
                                            className="img-fluid"
                                            style={{ maxWidth: "180px", height: "auto" }}
                                        />
                                    </Link>
                                </div>
                                <p className="text-muted mb-4 pe-lg-4">{desc_1}</p>

                                {/* Contact Information */}
                                <div className="contact-info mb-4">
                                    <div className="contact-item d-flex align-items-center mb-3">
                                        <div className="icon-wrapper me-3">
                                            <img 
                                                src="/assets/images/icon/icon_30.svg" 
                                                alt="Email" 
                                                width="18"
                                                height="18"
                                            />
                                        </div>
                                        <Link 
                                            to={`mailto:${email}`}
                                            className="text-decoration-none text-dark fw-medium"
                                        >
                                            {email}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Navigation Links */}
                        <div className="col-lg-8">
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="row gx-4 gy-4 flex-grow-1">
                                    {footer_data
                                        .filter((items) => items.page === "home_3")
                                        .map((item) => (
                                            <div key={item.id} className="col-lg-4 col-md-6">
                                                <div className="footer-nav">
                                                    <h5 className="footer-title fw-semibold mb-3 text-dark">
                                                        {item.widget_title}
                                                    </h5>
                                                    <ul className="list-unstyled footer-nav-links">
                                                        {item.footer_link.map((li, i) => (
                                                            <li key={i} className="mb-2">
                                                                <Link
                                                                    to={li.link}
                                                                    className="text-decoration-none text-muted d-block py-1 footer-link"
                                                                    style={{
                                                                        transition: "color 0.3s ease",
                                                                        fontSize: "1.15rem"
                                                                    }}
                                                                >
                                                                    {li.link_title}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {/* Decorative Icons */}
                                <div className="d-flex align-items-center tw-size-1/12 tw-mr-72">
                                    {[...Array(4)].map((_, index) => (
                                        <img
                                            key={index}
                                            src="/assets/images/shape/shape_47.svg"
                                            alt=""
                                            className={`lazy-img tw-ring-4 tw-ring-gray-900 tw-ring-offset-2 ${
                                                index < 3 ? 'me-3' : ''
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="bottom-footer py-4">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <p className="copyright mb-0 text-muted">
                                    Copyright ©2026 Burrow Housing.
                                </p>
                            </div>
                            <div className="col-md-6">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="footer-decorations">
                <img
                    src="/assets/images/shape/shape_46.svg"
                    alt=""
                    className="footer-shape d-none d-lg-block position-absolute"
                    style={{
                        bottom: "80px",
                        left: "100px",
                        opacity: "0.05",
                        width: "80px",
                        height: "80px",
                        pointerEvents: "none"
                    }}
                />
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .footer-two {
                    position: relative;
                    overflow: hidden;
                    background: #ffffff;
                    border-top: 1px solid #e9ecef;
                }

                .footer-content {
                    position: relative;
                    z-index: 2;
                }

                .footer-link:hover {
                    color: #FF6B47 !important;
                }

                .footer-title {
                    color: #2c3e50;
                    font-size: 1.1rem;
                    position: relative;
                    font-weight: 600;
                }

                .footer-title::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 30px;
                    height: 2px;
                    background: #FF6B47;
                }

                .contact-item:hover .icon-wrapper {
                    transform: scale(1.1);
                    transition: transform 0.3s ease;
                }

                .footer-nav-links li {
                    position: relative;
                }

                .footer-nav-links .footer-link {
                    font-size: 1rem;
                    line-height: 1.6;
                    font-weight: 400;
                }

                .copyright {
                    font-size: 0.9rem;
                }

                @media (max-width: 768px) {
                    .footer-two .row {
                        text-align: center;
                    }

                    .footer-brand {
                        text-align: center;
                    }

                    .contact-info {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .footer-nav {
                        text-align: center;
                    }

                    .footer-title::after {
                        left: 50%;
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
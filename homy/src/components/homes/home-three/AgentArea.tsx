import Slider from "react-slick";
import agent_data from "../../../data/home-data/AboutUsData";

const AgentArea = ({style}: any) => {

    const settings = {
        dots: false,
        arrows: false,
        centerPadding: '0px',
        slidesToShow: 4,
        slidesToScroll: 4,
        autoplay: false,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 4
                }
            }
        ]
    }

    return (
        <div className={` position-relative z-1 xl-mt-120 ${style ? "mt-170" : "mt-150"}`}
             style={{backgroundImage: '/assets/images/shape/shape_05.svg', background: 'transparent'}}>
            <div className={`container ${style ? "container-large" : ""}`}>
                <div className="position-relative">
                    <div className="title-one mb-85 lg-mb-50">
                        <h3>Meet Our <span>Team{style ? "" :
                            <img src="/assets/images/shape/title_shape_05.svg" alt="" className="lazy-img"/>}</span>
                        </h3>
                    </div>

                    <div className="wrapper position-relative z-1"
                         style={{backgroundImage: 'none', background: 'transparent'}}>
                        <Slider   {...settings}
                                  className="agent-slider-one"

                        >
                            {agent_data.filter((items) => items.page === "home_1").map((item) => (
                                <div key={item.id} className="item">
                                    <div className="agent-card-one position-relative">
                                        <div className="img border-20 tw-flex tw-justify-center tw-mb-4">
                                            <div
                                                className="tw-w-52 tw-h-52 tw-rounded-full tw-overflow-hidden tw-border-4 tw-border-gray-200 tw-shadow-lg">
                                                <img
                                                    src={item.thumb}
                                                    alt=""
                                                    className="tw-w-full tw-h-full tw-object-cover tw-object-center"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h6>{item.title}</h6>
                                            <p className="stretched-link">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AgentArea;
import Slider from "react-slick";
import DropdownOne from "../../search-dropdown/home-dropdown/DropdownOne";

const setting = {
   dots: false,
   arrows: false,
   centerPadding: '0px',
   slidesToShow: 1,
   slidesToScroll: 1,
   autoplay: true,
   fade: true,
   autoplaySpeed: 7000,
}

const HeroBanner = () => {
   return (
      <div className="hero-banner-three position-relative z-1 pt-130 lg-pt-100 pb-170 xl-pb-130 lg-pb-100">
         <Slider {...setting} className="hero-slider-one m0">
            <div className="item m0"><div className="hero-img" style={{ backgroundImage: `url(/assets/images/media/NEU-ISEC.jpg)` }}></div></div>
            <div className="item m0"><div className="hero-img" style={{ backgroundImage: `url(/assets/images/media/NEU-QUAD-2.png)` }}></div></div>
            <div className="item m0"><div className="hero-img" style={{ backgroundImage: `url(/assets/images/media/NEU-WIDE-SHOT.jpg)` }}></div></div>
         </Slider>

         <div className="container position-relative z-2">
            <div className="row">
               <div className="col-lg-10 m-auto">
                  <h1 className="hero-heading text-center text-white font-garamond fw-500"><span><img src="/assets/images/shape/shape_34.svg" alt="" className="lazy-img" /> Find your Perfect</span> <br /> Sublease</h1>
                  <p className="fs-24 text-white text-center pt-35 md-pt-20 pb-55 lg-pb-40">Search With Us Today</p>
               </div>
            </div>
				<div className="row">
					<div className="col-xxl-10 m-auto">
						<div className="search-wrapper-one layout-one position-relative">
							<div className="bg-wrapper">
                        <DropdownOne style={true} />
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <img src="/assets/images/shape/shape_35.svg" alt="" className="lazy-img shapes shape_01" />
         <img src="/assets/images/shape/shape_36.svg" alt="" className="lazy-img shapes shape_02" />
      </div>
   )
}

export default HeroBanner

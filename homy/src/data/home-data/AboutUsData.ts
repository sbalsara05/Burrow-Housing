interface DataType {
   id: number;
   page: string;
   thumb: string;
   title: string;
   desc: string;
}

const about_us_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      thumb: "/assets/images/about_us/sohum_01.jpg",
      title: "Sohum Balsara",
      desc: "CEO & Founder",
   },
   {
      id: 2,
      page: "home_1",
      thumb: "/assets/images/about_us/hardi_03.jpg",
      title: "Hardi Shah",
      desc: "CTO & Co-Founder",
   },
   {
      id: 3,
      page: "home_1",
      thumb: "/assets/images/about_us/aarnav_02.png",
      title: "Arnav Sawant",
      desc: "CBO & Co-founder",
   },
   {
      id: 4,
      page: "home_1",
      thumb: "/assets/images/about_us/sujay_04.jpeg",
      title: "Sujay Sanakka Nagarajappa",
      desc: "Director of Engineering",
   },
]

export default about_us_data;
interface DataType {
   id: number;
   page: string;
   thumb: string;
   title: string;
   desc: string;
}

const agent_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      thumb: "/assets/images/agent/sohum_01.jpg",
      title: "Sohum Balsara",
      desc: "CEO & Founder",
   },
   {
      id: 2,
      page: "home_1",
      thumb: "/assets/images/agent/hardi_03.jpg",
      title: "Hardi Shah",
      desc: "CTO & Co-Founder",
   },
   {
      id: 3,
      page: "home_1",
      thumb: "/assets/images/agent/aarnav_02.png",
      title: "Arnav Sawant",
      desc: "CBO & Co-founder",
   },
   {
      id: 4,
      page: "home_1",
      thumb: "/assets/images/agent/sujay_04.jpeg",
      title: "Sujay Sanakka Nagarajappa",
      desc: "Director of Engineering",
   },
]

export default agent_data;
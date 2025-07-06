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
        thumb: "/assets/images/agent/img_01.jpg",
        title: "Sohum Balsara",
        desc: "CEO & Co-Founder",
    },
    {
        id: 2,
        page: "home_1",
        thumb: "/assets/images/agent/img_02.jpg",
        title: "Hardi Manish Shah",
        desc: "CTO & Co-Founder",
    },
    {
        id: 3,
        page: "home_1",
        thumb: "/assets/images/agent/img_03.jpg",
        title: "Arnav Sawant",
        desc: "COO",
    },
    {
        id: 4,
        page: "home_1",
        thumb: "/assets/images/agent/img_04.jpg",
        title: "Sujay Sanakka Nagarajappa",
        desc: "Founding Engineer",
    },

]

export default agent_data;
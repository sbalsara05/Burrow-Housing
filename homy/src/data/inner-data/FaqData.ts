interface DataType {
    id: number;
    id_name: string;
    title: string;
    md_pt?: boolean;
    faq: {
        id: number;
        question: string;
        answer: string;
    }[];
}

const inner_faq_data: DataType[] = [
    {
        id: 1,
        id_name: "Selling",
        title: "SELLING",
        md_pt: true,
        faq: [
            {
                id: 1,
                question: "Who are we, and what do we do",
                answer: "Burrow provides a marketplace that connects students who are looking to sublease short-term\n" +
                    "housing with those who have space to offer. Burrow does not own, manage, inspect, or endorse\n" +
                    "any property listed on the Platform.",
            },
            {
                id: 2,
                question: "What we aren't responsible for",
                answer: "We do not:" +
                    "\n" +
                    "Verify the physical condition or legality of listings, " +
                    "guarantee the accuracy of any listing content, " +
                    "act as a broker, real estate agent, or landlord",
            },
            // {
            //     id: 3,
            //     question: "What’s the process of selling property?",
            //     answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            // },
            // {
            //     id: 4,
            //     question: "Refund & Frauds",
            //     answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            // },
        ]
    },
    {
        id: 2,
        id_name: "User Responsibilities",
        title: "USER RESPONSIBILITIES",
        faq: [
            {
                id: 5,
                question: "What is the user responsible for?",
                answer: "You agree that you will:\n\n• Only post truthful, accurate information\n\n• Comply with all local laws and university policies\n\n• Use the Platform for lawful purposes only\n\n• Not engage in any activity that misrepresents, defrauds, or harms other users",
            },
        ]
    },
    {
        id: 3,
        id_name: "No Liability for Transactions",
        title: "NO LIABILITY FOR TRANSACTIONS",
        faq: [
            {
                id: 9,
                question: "Burrow's Responsibility for transactions",
                answer: "Burrow is not a party to any rental agreement between users. We are a communication tool, not\n" +
                    "a real estate agent or legal representative.",
            },
            {
                id: 10,
                question: "Burrows Liability for transactions",
                answer: "We are not responsible for:\n" +
                    "\n" +
                    "• Disputes between users\n" +
                    "\n" +
                    "• Payments or refunds\n" +
                    "\n" +
                    "• Property damage or theft\n" +
                    "\n" +
                    "• Lease violations or legal action",
            },
            {
                id: 11,
                question: "User's Liability and Responsibility for Transactions",
                answer: "Users are solely responsible for conducting due diligence before entering into any rental\n" +
                    "agreement.",
            },
        ]
    },
    {
        id: 4,
        id_name: "Ambassador Program",
        title: "AMBASSADOR PROGRAM",
        faq: [
            {
                id: 12,
                question: "Ambassador Program Rules",
                answer: "Ambassadors are independent contractors or student volunteers who may assist with property\n" +
                    "tours or verification. They do not represent Burrow legally or professionally, and their actions or\n" +
                    "opinions do not constitute endorsements or legal guarantees.",
            },
        ]
    },
    {
        id: 5,
        id_name: "User Verification and Reviews",
        title: "USER VERIFICATION AND REVIEWS",
        faq: [
            {
                id: 15,
                question: "User Verification and Reviews",
                answer: "Burrow may offer user reviews or verification features. These are user-submitted and not\n" +
                    "guaranteed. While we aim to reduce scams and promote safety, we do not guarantee the\n" +
                    "reliability or identity of any user.",
            },
        ]
    },
    {
        id: 6,
        id_name: "Fees and Payments",
        title: "FEES AND PAYMENTS",
        faq: [
            {
                id: 17,
                question: "Fees and Payments",
                answer: "If you list a sublet, you may be charged a 4% service fee and optional premium listing fees\n" +
                    "($25/week). All payments are processed via third-party services (e.g., Stripe), and Burrow does\n" +
                    "not store or manage payment details.",
            },
        ]
    },

    {
        id: 7,
        id_name: "Prohibited Use",
        title: "PROHIBITED USE",
        faq: [
            {
                id: 18,
                question: "Prohibited Use",
                answer: "You may not:\n\n • Post misleading, fraudulent, or illegal content\n\n • Use the platform to solicit commercial services unrelated to subleasing\n\n • Attempt to harm or hack the Platform or its users",
            },
        ]
    },
    {
        id: 8,
        id_name: "Termination",
        title: "TERMINATION",
        faq: [
            {
                id: 19,
                question: "Termination",
                answer: "We reserve the right to suspend or terminate your access to Burrow at any time for violating\n" +
                    "these Terms or engaging in harmful conduct.",
            },
        ]
    },
    {
        id: 9,
        id_name: "Termination",
        title: "TERMINATION",
        faq: [
            {
                id: 20,
                question: "Termination",
                answer: "We reserve the right to suspend or terminate your access to Burrow at any time for violating\n" +
                    "these Terms or engaging in harmful conduct.",
            },
        ]
    },
    {
        id: 10,
        id_name: "Limitation of Liability",
        title: "LIMITATION OF LIABILITY",
        faq: [
            {
                id: 21,
                question: "Limitation of Liability",
                answer: "To the fullest extent allowed by law, Burrow disclaims all liability for any loss, injury, or damage\n" +
                    "related to use of the Platform or any transactions made through it.",
            },
        ]
    },
    {
        id: 11,
        id_name: "Indemnification",
        title: "INDENMIFICATION",
        faq: [
            {
                id: 22,
                question: "Indemnification",
                answer: "You agree to indemnify and hold harmless Burrow, its founders, affiliates, employees, and\n" +
                    "ambassadors from any claims or legal disputes arising from your use of the Platform.",
            },
        ]
    },
    {
        id: 12,
        id_name: "Changes to These Terms",
        title: "CHANGES TO THESE TERMS",
        faq: [
            {
                id: 22,
                question: "Changes to These Terms",
                answer: "We may update these Terms from time to time. Your continued use of the Platform after\n" +
                    "changes are posted constitutes your acceptance.",
            },
        ]
    },
]

export default inner_faq_data;
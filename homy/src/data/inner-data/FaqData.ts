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
        id_name: "PlatformRole",
        title: "1. PLATFORM ROLE & SCOPE",
        md_pt: true,
        faq: [
            {
                id: 1,
                question: "What is Burrow Housing Limited?",
                answer: "Burrow Housing Limited is a technology platform that enables students to discover, list, and communicate about potential sublease opportunities.",
            },
            {
                id: 2,
                question: "What Burrow is NOT",
                answer: "Burrow is not a landlord, tenant, real estate broker, property manager, escrow service, or legal advisor, and does not own, lease, operate, or manage any property listed on the platform.\n\nBurrow does not guarantee housing availability, pricing, legality, or suitability.",
            },
        ]
    },
    {
        id: 2,
        id_name: "UserResponsibility",
        title: "2. USER RESPONSIBILITY & LEASE COMPLIANCE",
        faq: [
            {
                id: 3,
                question: "What are users responsible for?",
                answer: "Users are solely responsible for:\n\n• Ensuring they are legally permitted to sublease under their existing lease\n\n• Obtaining any required landlord or property manager approvals\n\n• Complying with all applicable laws and regulations\n\nBy posting or entering into a sublease through Burrow, you represent and warrant that you have the legal authority to do so.",
            },
            {
                id: 4,
                question: "Does Burrow handle lease disputes?",
                answer: "Burrow assumes no responsibility for lease violations or landlord disputes.",
            },
        ]
    },
    {
        id: 3,
        id_name: "ListingsContent",
        title: "3. LISTINGS & USER CONTENT",
        faq: [
            {
                id: 5,
                question: "Who is responsible for listing accuracy?",
                answer: "Users are responsible for the accuracy, completeness, and legality of all listings, messages, and content they post.\n\nBurrow does not independently verify all listing details and does not guarantee that listings are current, accurate, or free from misrepresentation.",
            },
            {
                id: 6,
                question: "Can Burrow remove listings?",
                answer: "Burrow reserves the right to remove listings or content that violate these Terms or applicable laws.",
            },
        ]
    },
    {
        id: 4,
        id_name: "PaymentsFees",
        title: "4. PAYMENTS & SERVICE FEES",
        faq: [
            {
                id: 7,
                question: "How does payment processing work?",
                answer: "Burrow facilitates payments through third-party payment processors (including Stripe). Burrow does not hold funds, act as an escrow agent, or guarantee payment between users.",
            },
            {
                id: 8,
                question: "What is the platform service fee?",
                answer: "A platform service fee may be charged for providing access to Burrow's technology, marketplace, and payment processing features. This fee is not a brokerage commission or rent payment.\n\nPayment processing, chargebacks, and disputes are subject to the terms of the applicable third-party payment provider.",
            },
        ]
    },
    {
        id: 5,
        id_name: "SecurityDeposits",
        title: "5. SECURITY DEPOSITS",
        faq: [
            {
                id: 9,
                question: "Does Burrow handle security deposits?",
                answer: "Burrow does not collect, hold, or manage security deposits.\n\nAny security deposit arrangements are handled directly between the subletter and tenant, outside of the Burrow platform. Burrow assumes no responsibility for the handling, return, or dispute of security deposits.",
            },
        ]
    },
    {
        id: 6,
        id_name: "SubleaseTemplates",
        title: "6. SUBLEASE AGREEMENT TEMPLATES",
        faq: [
            {
                id: 10,
                question: "What about sublease agreement templates?",
                answer: "Burrow may provide sample sublease agreement templates for informational purposes only.\n\nThese templates:\n\n• Do not constitute legal advice\n\n• Are optional to use\n\n• Do not make Burrow a party to any agreement\n\nAll sublease agreements are entered into solely between the subletter and tenant. Burrow disclaims all liability arising from the use of any agreement template.",
            },
        ]
    },
    {
        id: 7,
        id_name: "Tours",
        title: "7. TOURS & PROPERTY WALKTHROUGHS",
        faq: [
            {
                id: 11,
                question: "What are 'Eyes on the Ground' tours?",
                answer: "Burrow may offer informational property walkthroughs conducted by members of the Burrow team.\n\nTours are limited to observable, visible conditions at the time of the visit (e.g., layout, natural light, cleanliness).",
            },
            {
                id: 12,
                question: "What do tours NOT include?",
                answer: "Tours do not include:\n\n• Legal or lease compliance verification\n\n• Property quality or safety guarantees\n\n• Representations about landlords or building management\n\nAll observations are provided \"as-is\" and are subjective in nature.",
            },
        ]
    },
    {
        id: 8,
        id_name: "FairHousing",
        title: "8. FAIR HOUSING & PROHIBITED CONDUCT",
        faq: [
            {
                id: 13,
                question: "What is Burrow's fair housing policy?",
                answer: "Burrow prohibits listings or communications that discriminate on the basis of race, color, religion, sex, sexual orientation, gender identity, national origin, disability, familial status, or any other protected characteristic.\n\nViolating content may be removed without notice and may result in account suspension or termination.",
            },
        ]
    },
    {
        id: 9,
        id_name: "Verification",
        title: "9. VERIFICATION & ACCOUNTS",
        faq: [
            {
                id: 14,
                question: "How does verification work?",
                answer: "Burrow may require users to verify their identity or student status (e.g., .edu email or third-party verification services).\n\nBurrow does not guarantee that verification eliminates risk and disclaims liability for user misrepresentation.",
            },
            {
                id: 15,
                question: "Who is responsible for account security?",
                answer: "Users are responsible for maintaining the confidentiality of their account credentials.",
            },
        ]
    },
    {
        id: 10,
        id_name: "LimitationLiability",
        title: "10. LIMITATION OF LIABILITY",
        faq: [
            {
                id: 16,
                question: "What is Burrow NOT liable for?",
                answer: "To the maximum extent permitted by law, Burrow shall not be liable for:\n\n• Housing disputes\n\n• Lease violations\n\n• Payment failures\n\n• Property conditions\n\n• User conduct or misrepresentation\n\nBurrow's total liability, if any, shall not exceed the amount of fees paid to Burrow in connection with the relevant transaction.",
            },
        ]
    },
    {
        id: 11,
        id_name: "DisputeResolution",
        title: "11. DISPUTE RESOLUTION",
        faq: [
            {
                id: 17,
                question: "How are disputes resolved?",
                answer: "Any disputes arising out of or relating to these Terms or use of the platform shall be resolved through binding arbitration, except where prohibited by law.",
            },
        ]
    },
    {
        id: 12,
        id_name: "ModificationsTermination",
        title: "12. MODIFICATIONS & TERMINATION",
        faq: [
            {
                id: 18,
                question: "Can these Terms be modified?",
                answer: "Burrow may modify these Terms at any time. Continued use of the platform constitutes acceptance of updated Terms.",
            },
            {
                id: 19,
                question: "Can my access be terminated?",
                answer: "Burrow may suspend or terminate access for violations of these Terms.",
            },
        ]
    },
    {
        id: 13,
        id_name: "GoverningLaw",
        title: "13. GOVERNING LAW",
        faq: [
            {
                id: 20,
                question: "What law governs these Terms?",
                answer: "These Terms are governed by the laws of the Commonwealth of Massachusetts, without regard to conflict of law principles.",
            },
        ]
    },
]

export default inner_faq_data;

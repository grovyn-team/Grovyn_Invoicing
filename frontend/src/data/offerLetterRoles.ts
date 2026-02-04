export interface RoleTemplate {
    position: string;
    designation: string;
    department: string;
    responsibilities: string[];
    reportingManager?: string;
    internshipDescription?: string;
    incentiveTerms?: string[];
}

export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
    'Business Development Executive': {
        position: 'Business Development Executive',
        designation: 'Business Development Executive',
        department: 'Sales & Growth',
        responsibilities: [
            'Identifying potential partnerships and growth opportunities',
            'Outreach to founders, businesses, and decision-makers',
            'Assisting in onboarding deals, partnerships, or projects',
            'Supporting sales, partnerships, and growth initiatives'
        ],
        internshipDescription: 'This internship is designed to provide hands-on exposure to growth strategy, partnerships, outreach, and business development in a fast-moving remote-first environment, while allowing Grovyn to evaluate your contribution and professional conduct.',
        incentiveTerms: [
            'A percentage-based incentive ranging from 0.5 percent to 2 percent',
            'Applicable only on successfully onboarded deals, partnerships, or projects',
            'The exact percentage per deal shall be decided solely by Grovyn',
            'Incentives are conditional upon successful closure, payment realization, and client onboarding',
            'No incentive is guaranteed unless explicitly approved in writing by Grovyn'
        ]
    },
    'Software Developer': {
        position: 'Software Developer',
        designation: 'Software Developer',
        department: 'Engineering',
        responsibilities: [
            'Developing and maintaining scalable web applications',
            'Writing clean, efficient, and well-documented code',
            'Participating in code reviews and architecture discussions',
            'Collaborating with designers and product managers to implement features',
            'Troubleshooting and debugging production issues'
        ],
        internshipDescription: 'This internship is designed to provide hands-on exposure to software engineering practices, modern tech stacks, and collaborative development in a fast-paced environment.',
        incentiveTerms: [
            'Performance-based bonuses for exceptional project delivery',
            'Skill acquisition milestones and certifications',
            'Incentives for high-quality contributions and innovative solutions'
        ]
    },
    'UI/UX Designer': {
        position: 'UI/UX Designer',
        designation: 'UI/UX Designer',
        department: 'Design',
        responsibilities: [
            'Creating intuitive and aesthetically pleasing user interfaces',
            'Conducting user research and translating findings into design improvements',
            'Developing wireframes, prototypes, and high-fidelity mockups',
            'Collaborating with developers to ensure design integrity during implementation',
            'Maintaining and evolving the company design system'
        ],
        internshipDescription: 'This internship is designed to provide hands-on exposure to product design, user experience research, and modern design tools in a fast-moving remote-first environment.',
        incentiveTerms: [
            'Recognition for outstanding design contributions',
            'Bonuses for successful feature launches and user satisfaction metrics'
        ]
    },
    'Sales Executive': {
        position: 'Sales Executive',
        designation: 'Sales Executive',
        department: 'Sales',
        responsibilities: [
            'Generating and qualifying leads through various channels',
            'Presenting product demonstrations to potential clients',
            'Negotiating and closing sales deals to meet revenue targets',
            'Maintaining strong relationships with existing clients',
            'Collaborating with the marketing team on outreach strategies'
        ],
        internshipDescription: 'This internship is designed to provide hands-on exposure to sales processes, lead generation, and client relationship management.',
        incentiveTerms: [
            'Commission-based incentives on closed deals',
            'Quarterly performance bonuses',
            'Travel and networking allowances for client meetings'
        ]
    },
    'Marketing Associate': {
        position: 'Marketing Associate',
        designation: 'Marketing Associate',
        department: 'Marketing',
        responsibilities: [
            'Executing multi-channel marketing campaigns',
            'Creating engaging content for social media and blogs',
            'Analyzing campaign performance metrics and providing reports',
            'Supporting market research and competitor analysis',
            'Assisting in event planning and coordination'
        ],
        internshipDescription: 'This internship is designed to provide hands-on exposure to digital marketing, content strategy, and brand management.',
        incentiveTerms: [
            'Performance bonuses based on campaign targets',
            'Recognition for creative content performance'
        ]
    },
    'Consultant': {
        position: 'Independent Sales Strategy Consultant',
        designation: 'Independent Sales Strategy Consultant',
        department: 'Sales & Strategy',
        reportingManager: 'Aman K.A',
        responsibilities: [
            'Strategic contribution and client acquisition support',
            'Responsibilities as communicated by your reporting manager, evolving based on business requirements',
            'Contributing to sales strategy and business development initiatives',
            'Maintaining confidentiality and adhering to consulting engagement terms'
        ],
        incentiveTerms: [
            'Commission-only engagement; no salary, stipend, or fixed remuneration',
            'Any commission subject to successful client onboarding, payment realization, and written approval by Grovyn',
            'Continued engagement subject to performance, conduct, and business requirements at Grovyn\'s discretion'
        ]
    }
};

// ============================================================================
// RAG Factory — Typed Content Exports
// All content derived from config.json and domain context.
// ============================================================================
import config from '@/lib/siteConfig'

// ---------------------------------------------------------------------------
// Metrics (Opening Section / Hero)
// ---------------------------------------------------------------------------
export const heroMetrics = [
    { value: '0', suffix: '', label: '[Metric 1]', rawNumber: 0 },
    { value: '0', suffix: '', label: '[Metric 2]', rawNumber: 0 },
    { value: '0', suffix: '', label: '[Metric 3]', rawNumber: 0 },
    { value: '0', suffix: '', label: '[Metric 4]', rawNumber: 0 },
] as const

// ---------------------------------------------------------------------------
// Product/Service Cards (Opportunity Section)
// ---------------------------------------------------------------------------
export const minerals = [
    {
        name: '[Product 1]',
        symbol: '',
        grade: '[Value]',
        gradeNumber: 0,
        image: '',
        lab: '[Source]',
        detail: '[Description of your first product or service offering]',
        color: '#2563EB',
    },
] as const

// ---------------------------------------------------------------------------
// Volume Estimates
// ---------------------------------------------------------------------------
export const volumeEstimates = {
    copperOre: '[Value]',
    ironOre: '[Value]',
    exploredArea: '[Value]',
    exploredPercent: '[Value]',
    totalConcession: '[Value]',
    headline: '[Your key metric headline]',
} as const

// ---------------------------------------------------------------------------
// Partnership Alignment (Section 3)
// ---------------------------------------------------------------------------
export const alignmentData = {
    title: `What ${config.company.short_name} Brings`,
    items: [
        { label: '[Capability 1]', detail: '[Description]' },
        { label: '[Capability 2]', detail: '[Description]' },
    ],
} as const

export const alignmentPartner = {
    title: 'What a Strategic Partner Brings',
    items: [
        { label: '[Capability 1]', detail: '[Description]' },
        { label: '[Capability 2]', detail: '[Description]' },
    ],
} as const

export const alignmentFootnote = '[Partnership framing statement]'

// ---------------------------------------------------------------------------
// Timeline Phases (Section 5 — The Plan)
// ---------------------------------------------------------------------------
export const timelinePhases = [
    {
        phase: 1,
        title: 'Phase 1',
        description: '[Description of first phase]',
        icon: 'Search',
    },
    {
        phase: 2,
        title: 'Phase 2',
        description: '[Description of second phase]',
        icon: 'FileText',
    },
    {
        phase: 3,
        title: 'Phase 3',
        description: '[Description of third phase]',
        icon: 'Shield',
    },
] as const

export const timelineGateLabel = 'EVALUATE → COMMIT'
export const timelineFootnote = 'Phase 1 commitment only. Decision gates at every stage.'

// ---------------------------------------------------------------------------
// Risk Status Items (Section 6 — The Protection)
// ---------------------------------------------------------------------------
export type RiskStatus = 'green' | 'amber'

export interface RiskItem {
    status: RiskStatus
    title: string
    description: string
}

export const riskItems: RiskItem[] = [
    {
        status: 'green',
        title: '[Strength 1]',
        description: '[Description of a verified strength or resolved risk]',
    },
    {
        status: 'amber',
        title: '[Open Item 1]',
        description: '[Description of an acknowledged risk with mitigation plan]',
    },
]

// ---------------------------------------------------------------------------
// Vision (Section 7)
// ---------------------------------------------------------------------------
export const visionContent = {
    headline: '[Your vision statement]',
    subheadline: '[Supporting vision context]',
    backgroundImage: '',
} as const

// ---------------------------------------------------------------------------
// The Ask (Section 8)
// ---------------------------------------------------------------------------
export const askContent = {
    headline: 'The Next Step',
    items: [
        { icon: 'Handshake', label: '[Action item 1]' },
        { icon: 'Users', label: '[Action item 2]' },
        { icon: 'MapPin', label: '[Action item 3]' },
    ],
    buttons: {
        download: { label: 'Download Summary', href: '#' },
        advisor: { label: 'Ask Our AI Advisor', href: '/advisor' },
    },
} as const

// ---------------------------------------------------------------------------
// Opening / Presentation Section 1
// ---------------------------------------------------------------------------
export const openingContent = {
    headline: '[Your opening headline]',
    subtitle: config.company.name,
    backgroundTexture: '',
} as const

// ---------------------------------------------------------------------------
// Homepage Content
// ---------------------------------------------------------------------------
export const homepageContent = {
    hero: {
        headline: '[Your hero headline]',
        subheadline: '[Your hero subheadline]',
        backgroundImage: '',
    },
    overview: {
        title: config.company.name,
        body: config.company.description,
        image: '',
    },
    partnership: {
        title: 'A Strategic Partnership',
        body: '[Describe why a partnership makes sense and what both sides bring to the table]',
    },
} as const

// ---------------------------------------------------------------------------
// Evidence Portfolio (Assets Page)
// ---------------------------------------------------------------------------
export const evidencePortfolio = [
    { lab: '[Source 1]', country: '[Country]', question: '[What was validated?]', result: '[Key finding]' },
] as const

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------
export const teamMembers = [
    {
        name: '[Team Member]',
        title: '[Title]',
        image: null,
    },
] as const

// ---------------------------------------------------------------------------
// Company Info (Footer, Contact)
// ---------------------------------------------------------------------------
export const companyInfo = {
    name: config.company.name,
    shortName: config.company.short_name,
    address: config.company.address,
    email: config.company.email,
    website: `https://${config.company.domain}`,
    license: '',
    founded: parseInt(config.company.founded_year),
    logo: '/images/logo.png',
} as const

// ---------------------------------------------------------------------------
// Presentation Section Titles
// ---------------------------------------------------------------------------
export const presentationSections = [
    { id: 'opening', number: 1, title: 'The Opening', shortTitle: 'Opening' },
    { id: 'opportunity', number: 2, title: 'The Opportunity', shortTitle: 'Opportunity' },
    { id: 'alignment', number: 3, title: 'The Alignment', shortTitle: 'Alignment' },
    { id: 'proof', number: 4, title: 'The Proof', shortTitle: 'Proof' },
    { id: 'plan', number: 5, title: 'The Plan', shortTitle: 'Plan' },
    { id: 'protection', number: 6, title: 'The Protection', shortTitle: 'Protection' },
    { id: 'vision', number: 7, title: 'The Vision', shortTitle: 'Vision' },
    { id: 'ask', number: 8, title: 'The Ask', shortTitle: 'Ask' },
] as const

// ---------------------------------------------------------------------------
// CSR Content
// ---------------------------------------------------------------------------
export const csrContent = {
    headline: 'Community & Sustainability',
    lumadMetric: {
        value: '[Value]',
        label: '[Key community metric]',
        detail: '[Description of community engagement]',
    },
    fpicStatus: '[Community consent or engagement status]',
    environmentalStewardship: '[Environmental programs description]',
    foundation: {
        title: 'Community Programs',
        programs: [
            '[Program 1]',
            '[Program 2]',
        ],
    },
} as const

// ---------------------------------------------------------------------------
// About Content
// ---------------------------------------------------------------------------
export const aboutContent = {
    headline: `About ${config.company.name}`,
    body: config.company.description,
    vision: config.company.tagline,
    milestones: [
        { year: '[Year]', event: '[Milestone event]' },
    ],
    governance: [
        '[Governance credential 1]',
    ],
} as const

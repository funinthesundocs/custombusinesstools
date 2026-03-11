// ============================================================================
// GMC — Typed Content Exports
// All content derived from source documents. NO hardcoded strings in components.
// ============================================================================

// ---------------------------------------------------------------------------
// Metrics (Opening Section / Hero)
// ---------------------------------------------------------------------------
export const heroMetrics = [
    { value: '5,906', suffix: 'ha', label: 'MPSA Concession Area', rawNumber: 5906 },
    { value: '9', suffix: '', label: 'Independent Laboratories', rawNumber: 9 },
    { value: '8', suffix: '', label: 'Completed Core Samples', rawNumber: 8 },
    { value: '493', suffix: 'm', label: 'Aggregate Core Depth', rawNumber: 493 },
] as const

// ---------------------------------------------------------------------------
// Mineral Cards (Opportunity Section)
// ---------------------------------------------------------------------------
export const minerals = [
    {
        name: 'Iron',
        symbol: 'Fe',
        grade: '67.31%',
        gradeNumber: 67.31,
        image: '/images/generated/iron-hero-data.webp',
        lab: 'POSCO CONFIRMED',
        detail: 'Shipping-grade premium iron ore — comparable to top-tier Brazilian and Australian product. Very low phosphorus and sulfur, suitable for direct export to global steelmakers.',
        color: '#5C6370',
    },
    {
        name: 'Copper',
        symbol: 'Cu',
        grade: '39.5%',
        gradeNumber: 39.5,
        image: '/images/generated/copper-hero-data.webp',
        lab: 'NEAR-CONCENTRATE',
        detail: 'Near-concentrate grade at surface — indicating strong supergene enrichment above the primary sulfide system. Four independent laboratories across a decade confirm this as a systematic feature.',
        color: '#B87333',
    },
    {
        name: 'Gold',
        symbol: 'Au',
        grade: '20.35 g/t',
        gradeNumber: 20.35,
        image: '/images/generated/gold-hero-data.webp',
        lab: 'HIGHEST FIRE ASSAY',
        detail: 'Highest gold result ever recorded from this concession. Seven-year grade consistency (2017–2024) from the same laboratory confirms this is a systematic feature, not an anomaly.',
        color: '#C5922E',
    },
] as const

// ---------------------------------------------------------------------------
// Volume Estimates
// ---------------------------------------------------------------------------
export const volumeEstimates = {
    copperOre: '21.6 million metric tons',
    ironOre: '16–18 million metric tons',
    exploredArea: '518 hectares',
    exploredPercent: '< 9%',
    totalConcession: '5,906 hectares',
    headline: '21.6 million metric tons. From less than 9% explored.',
} as const

// ---------------------------------------------------------------------------
// Partnership Alignment (Section 3)
// ---------------------------------------------------------------------------
export const alignmentGMC = {
    title: 'What GMC Brings',
    items: [
        { label: 'MPSA 5,906 ha', detail: 'Active mineral production sharing agreement, Davao Oriental' },
        { label: '9-Lab Validated Deposit', detail: 'Nine independent laboratories across five countries confirm the deposit model' },
        { label: 'Community Trust — 60% Lumad', detail: 'Workforce approximately 60% indigenous Lumad with years of genuine partnership' },
        { label: 'MGB Approved Operator', detail: 'Director ORDER confirming GMC as authorized operator of MPSA 251(A)-2007-XI' },
        { label: '15+ Years Data', detail: 'Over a decade of sampling, assay, and geological work across the concession' },
    ],
} as const

export const alignmentPartner = {
    title: 'What a Strategic Partner Brings',
    items: [
        { label: 'AAAA Construction', detail: 'PCAB Quadruple A — one of only 72 contractors in the Philippines with no project cost ceiling' },
        { label: 'THPAL Precedent — 13 Years', detail: 'Built and maintained the $1.7B Taganito HPAL nickel processing facility continuously since 2012' },
        { label: 'Energy Capacity', detail: '9,200 MW target portfolio — the Philippines\' leading private power producer' },
        { label: 'Data Science & AI', detail: 'EquiMax predictive maintenance deployed at THPAL, delivering 30% improvement in machine control efficiency' },
        { label: 'Financial Capacity', detail: '₱380B deployed in the Great Transformation across six sectors, ₱105B capex in 2025 alone' },
    ],
} as const

export const alignmentFootnote = 'From mining services to mining partnership — the natural next step.'

// ---------------------------------------------------------------------------
// Timeline Phases (Section 5 — The Plan)
// ---------------------------------------------------------------------------
export const timelinePhases = [
    {
        phase: 1,
        title: 'Exploration Partnership',
        description: 'Joint venture formation. 10-hole diamond drilling program (7,190m). Independent feasibility study. Environmental baseline.',
        icon: 'Search',
    },
    {
        phase: 2,
        title: 'Feasibility Study',
        description: 'JORC/NI 43-101 resource estimate. Definitive engineering study. Mercury management plan. Financial modeling.',
        icon: 'FileText',
    },
    {
        phase: 3,
        title: 'Permitting',
        description: 'Mineral Processing Permit. Environmental Compliance Certificate. LGU endorsements. FPIC renewal if required.',
        icon: 'Shield',
    },
    {
        phase: 4,
        title: 'Plant Construction',
        description: 'Purpose-built processing facility. ACI builds. ACI Plus maintains. AboitizPower supplies energy. Full ecosystem deployment.',
        icon: 'Building',
    },
    {
        phase: 5,
        title: 'Production',
        description: 'Commercial operations. Multi-commodity processing. Recurring revenue. Community programs at full scale.',
        icon: 'Factory',
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
        title: 'FPIC Approval',
        description: 'Approved by indigenous communities. 60% Lumad workforce. Years of genuine partnership.',
    },
    {
        status: 'green',
        title: 'MGB Operator',
        description: 'Director ORDER confirming GMC as authorized operator of MPSA 251(A)-2007-XI.',
    },
    {
        status: 'green',
        title: 'Legal Standing',
        description: 'Final court ruling on DMC-GMC dispute. Permanently resolved as a matter of law. Cannot be refiled.',
    },
    {
        status: 'amber',
        title: 'Copper at Depth',
        description: 'Sulfide minerals confirmed at 60–65m. Eight core samples validate the porphyry model. Phase 1 drilling priority.',
    },
    {
        status: 'amber',
        title: 'Mercury Trace',
        description: 'Identified proactively. 1,245–1,429 mg/kg in ore samples. Minamata Convention compliance required. Solvable engineering challenge.',
    },
]

// ---------------------------------------------------------------------------
// Vision (Section 7)
// ---------------------------------------------------------------------------
export const visionContent = {
    headline: 'Building for Business to Prosper and Communities to Thrive',
    subheadline: '32 years remaining. A multi-generational partnership.',
    backgroundImage: '/images/generated/hero-landscape-enhanced.webp',
} as const

// ---------------------------------------------------------------------------
// The Ask (Section 8)
// ---------------------------------------------------------------------------
export const askContent = {
    headline: 'The Next Step',
    items: [
        { icon: 'Handshake', label: 'Phase 1 exploration partnership' },
        { icon: 'Users', label: 'Technical team introduction' },
        { icon: 'MapPin', label: 'Joint site assessment' },
    ],
    buttons: {
        download: { label: 'Download Executive Summary', href: '#' },
        advisor: { label: 'Ask Our AI Advisor', href: '/advisor' },
    },
} as const

// ---------------------------------------------------------------------------
// Opening / Presentation Section 1
// ---------------------------------------------------------------------------
export const openingContent = {
    headline: 'A Partnership Built for This Moment',
    subtitle: 'Genluiching Mining Corporation',
    backgroundTexture: '/images/generated/topo-texture-dark.webp',
} as const

// ---------------------------------------------------------------------------
// Homepage Content
// ---------------------------------------------------------------------------
export const homepageContent = {
    hero: {
        headline: 'A Polymetallic Deposit of Extraordinary Scale',
        subheadline: 'Nine laboratories. Five countries. One convergent geological model.',
        backgroundImage: '/images/generated/hero-landscape-enhanced.webp',
    },
    overview: {
        title: 'Genluiching Mining Corporation',
        body: 'A 5,906-hectare mining concession in Davao Oriental hosts a polymetallic deposit validated by nine independent laboratories across five countries and three geophysical methods — all converging on the same deposit model. POSCO International confirmed production-grade iron ore at 67.31% Fe. Nine laboratories confirmed near-concentrate copper at 39.5% Cu and gold up to 20.35 g/t Au. The Mineral Production Sharing Agreement is secured and active. The regulatory window is the most favorable in fifteen years.',
        image: '/images/site-photos/aerial-concession-view.webp',
    },
    partnership: {
        title: 'A Strategic Partnership',
        body: 'This is not a pitch. It is a recognition that the capabilities, relationships, geographic presence, and strategic direction already exist to make this partnership inevitable. Thirteen years at THPAL. The ₱583M copper plant at Toledo. Nine hundred local jobs in Claver. The question is not whether — it is when, and with whom.',
    },
} as const

// ---------------------------------------------------------------------------
// Evidence Portfolio (Assets Page)
// ---------------------------------------------------------------------------
export const evidencePortfolio = [
    { lab: 'POSCO International', country: 'South Korea', question: 'What grade is the production iron ore?', result: 'Up to 67.31% Fe — shipping-grade premium' },
    { lab: 'Intertek Minerals', country: 'Philippines', question: 'Is this a deposit or an outcrop?', result: '136 samples — deposit-scale confirmed, up to 56.06% Fe' },
    { lab: 'Beijing BGRIMM', country: 'China', question: 'Do copper-gold grades hold under scrutiny?', result: '20.72% Cu, ~15 g/t Au — CNAS-accredited' },
    { lab: 'Davao Analytical', country: 'Philippines', question: 'Are grades consistent across time?', result: 'Up to 39.5% Cu, 53.4% Fe, 4.4 g/t Au — decade of consistency' },
    { lab: 'HK Imperial Processing', country: 'Philippines', question: 'Can this ore be processed commercially?', result: '120,000 WMT → 18.02% Cu concentrate, 11.33 g/t Au' },
    { lab: 'Ostrea Mineral Labs', country: 'Philippines', question: 'Do grades persist in drill core?', result: '36.58% Cu, 13.77 g/t Au, 59.86% Fe — depth confirmed' },
    { lab: 'CCIC Philippines', country: 'Philippines', question: 'Independent inspection confirmation?', result: '59.34% Fe iron, 6.33% Cu copper from drill core' },
    { lab: 'SGS Korea', country: 'South Korea', question: 'Independent Korean lab verification?', result: '59.33% Fe fine iron — independently confirmed' },
    { lab: 'Indonesian Lab', country: 'Indonesia', question: 'Cross-country verification?', result: '57.73% Fe iron ore — 9th lab, 5th country' },
] as const

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------
export const teamMembers = [
    {
        name: 'Jett Tupas',
        title: 'President & CEO',
        image: null,
    },
] as const

// ---------------------------------------------------------------------------
// Company Info (Footer, Contact)
// ---------------------------------------------------------------------------
export const companyInfo = {
    name: 'Genluiching Mining Corporation',
    shortName: 'GMC',
    address: {
        line1: 'Unit 1411 Alaya Tower One',
        line2: '6767 Alaya Avenue, Makati City 1226',
        country: 'Philippines',
    },
    email: 'gmc@genluiching.com',
    website: 'https://genluiching.com',
    mpsa: 'MPSA No. 251(A)-2007-XI',
    founded: 2007,
    logo: '/images/scraped/gmc/GMC_LOGO.png',
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
        value: '60%',
        label: 'Lumad Indigenous Workforce',
        detail: 'Lumad community members serve as mining laborers, road mappers, guides who know the terrain better than any surveyor, stockyard personnel, and property custodians.',
    },
    fpicStatus: 'FPIC has been approved. Free, Prior, and Informed Consent from the indigenous community has been secured through the NCIP process.',
    environmentalStewardship: 'GMC operates a forest tree nursery at the Mati site, tended by the Lumad community. Wild pine, hardwood, and fruit-bearing seedlings are carefully transplanted and propagated in alternative green areas. Progressive reclamation ensures the land is returned to productive use on a rolling basis.',
    foundation: {
        title: 'Planned Community Foundation',
        programs: [
            'Literacy education for underserved communities',
            'Livelihood training in agriculture, trades, and enterprise management',
            'Enterprise creation and marketing support for Lumad-led businesses',
            'Socialized housing for dignified, permanent homes',
            'Primary health care in communities dependent on distant facilities',
        ],
    },
} as const

// ---------------------------------------------------------------------------
// About Content
// ---------------------------------------------------------------------------
export const aboutContent = {
    headline: 'About Genluiching Mining Corporation',
    body: 'Genluiching Mining Corporation holds MPSA No. 251(A)-2007-XI — a 5,906-hectare mineral concession in Tarragona and Mati City, Davao Oriental, Region XI. Approved July 28, 2007, active through July 28, 2032 with a 25-year renewal option. Authorized operator confirmed by MGB Director ORDER, May 2022.',
    vision: 'Bringing Precious Ores to the Light — To Prosper Lives.',
    milestones: [
        { year: '2007', event: 'MPSA No. 251(A)-2007-XI approved' },
        { year: '2012', event: 'SEC-registered corporation. First laboratory validations begin.' },
        { year: '2015–2019', event: 'Beijing BGRIMM CNAS-accredited testing. HK Imperial commercial processing (120,000 WMT).' },
        { year: '2021', event: 'EO 130 lifts moratorium. Open-pit ban reversed. DMPF completed.' },
        { year: '2022', event: 'Compromise Agreement registered. MGB Director ORDER confirms GMC operator status.' },
        { year: '2023', event: 'First diamond drilling campaign — 4 holes, 177.9m aggregate depth.' },
        { year: '2024', event: 'Second drilling campaign — 4 holes, deepest to 160m. Ostrea confirms grades at depth.' },
        { year: '2025', event: 'SGECS geological report filed with MGB. RA 12253 signed. US-PH critical minerals MOU.' },
        { year: '2026', event: 'BOC exporter registration secured. PHILEXPORT membership active. Magnetic separators ordered.' },
    ],
    governance: [
        'SEC-registered corporation (2012)',
        'Active Mati and Makati business permits (2026)',
        'Bureau of Customs exporter registration (February 2026)',
        'PHILEXPORT membership (current through December 2026)',
        'All filings current with MGB Region XI',
    ],
} as const

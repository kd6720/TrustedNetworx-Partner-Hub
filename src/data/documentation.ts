export interface Lesson {
  title: string;
  duration: string;
  content?: string;
  draft?: boolean;
}

export interface DocSection {
  title: string;
  lessons: Lesson[];
}

export const docSections: DocSection[] = [
  {
    title: "Working with TrustedNetworx",
    lessons: [
      {
        title: "Welcome & Partner Overview",
        duration: "5 min",
        content: "TrustedNetworx is a managed connectivity and voice solutions provider specializing in POTS replacement, hosted voice/UCaaS, wireless failover, and compliance-grade communication lines. As a partner, you are the front line for bringing these services to your clients.\n\nIn this lesson you will learn about the partner program structure, revenue tiers, and how to get started with your first deal.",
      },
      {
        title: "Partner Program Structure",
        duration: "10 min",
        content: "Our partner program has three tiers — Authorized, Preferred, and Elite — based on annual revenue and certifications. Each tier unlocks additional benefits including lead sharing, co-marketing funds, and priority support.",
      },
      {
        title: "Support & Escalation",
        duration: "8 min",
        content: "Partners have access to a dedicated Partner Success Manager, a 24/7 technical support desk, and an escalation path for urgent issues. Standard response is within 2 hours for non-critical and 15 minutes for critical outages.",
      },
    ],
  },
  {
    title: "Account & Operations",
    lessons: [
      { title: "Setting Up Your Account", duration: "5 min", draft: true },
      { title: "Billing & Invoicing", duration: "8 min", draft: true },
      { title: "Compliance Requirements", duration: "12 min", draft: true },
    ],
  },
  {
    title: "Product Training",
    lessons: [
      {
        title: "POTS Replacement Overview",
        duration: "10 min",
        content: "Plain Old Telephone Service (POTS) lines are being sunset by carriers nationwide. TrustedNetworx offers LTE/5G-based POTS replacement devices that provide the same functionality — including fax, alarm, elevator, and fire panel connectivity — with better reliability and lower cost.\n\nKey benefits: No copper dependency, remote management, built-in battery backup, and carrier-grade uptime.",
      },
      { title: "Hosted Voice / UCaaS", duration: "15 min", draft: true },
      { title: "Connectivity & Wireless Failover", duration: "12 min", draft: true },
    ],
  },
  {
    title: "Sales Enablement",
    lessons: [
      { title: "Discovery & Qualification", duration: "8 min", draft: true },
      { title: "Pricing & Proposal Builder", duration: "10 min", draft: true },
      { title: "Demo Best Practices", duration: "15 min", draft: true },
    ],
  },
  {
    title: "Marketing",
    lessons: [
      { title: "Co-Branded Assets", duration: "6 min", draft: true },
      { title: "Campaign Templates", duration: "10 min", draft: true },
      { title: "Social Media Toolkit", duration: "8 min", draft: true },
    ],
  },
  {
    title: "Client Onboarding",
    lessons: [
      { title: "Onboarding Checklist", duration: "10 min", draft: true },
      { title: "Installation Coordination", duration: "12 min", draft: true },
      { title: "Post-Install Support", duration: "8 min", draft: true },
    ],
  },
];

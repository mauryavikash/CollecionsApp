import {
  Home,
  Gift,
  DollarSign,
  Users,
  Clock3,
} from "lucide-react";

export const APP_NAME = "ReconFlow";
export const APP_SHORT_NAME = "ReconFlow";

export const ROLE_OPTIONS = [
  "AP Analyst",
  "AP Team Lead",
  "AP Manager",
  "Vendor Management Team",
  "Finance Controller",
  "Internal Auditor",
  "System Administrator",
];

export const NAV_ITEMS = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
  },
  {
    name: "Cases",
    href: "/cases",
    icon: Gift,
  },
  {
    name: "Recoveries",
    href: "/recoveries",
    icon: DollarSign,
  },
  {
    name: "Vendor",
    href: "/vendor",
    icon: Users,
  },
  {
    name: "Audit",
    href: "/audit",
    icon: Clock3,
  },

  // {
  //   name: "Reports & Analytics",
  //   href: "/reports",
  //   icon: BarChart3,
  // },
  // {
  //   name: "Audit & Compliance",
  //   href: "/audit",
  //   icon: ShieldCheck,
  // },
  // {
  //   name: "Configuration",
  //   href: "/settings",
  //   icon: Settings,
  // },
  // {
  //   name: "Users & Roles",
  //   href: "/users-roles",
  //   icon: Users,
  // },
];

export const ROLE_MATRIX = [
  {
    role: "AP Analyst",
    responsibility: "Execute reconciliation activities",
    activities:
      "Review matches, investigate exceptions, validate AI recommendations, communicate with suppliers",
  },
  {
    role: "AP Team Lead",
    responsibility: "Operational oversight and approvals",
    activities:
      "Review escalations, approve reconciliations, monitor team workload and SLA adherence",
  },
  {
    role: "AP Manager",
    responsibility: "Process governance and performance management",
    activities:
      "Monitor KPIs, manage escalations, ensure compliance and operational effectiveness",
  },
  {
    role: "Vendor Management Team",
    responsibility: "Supplier relationship management",
    activities:
      "Coordinate with suppliers, support exception resolution, manage vendor communications",
  },
  {
    role: "Finance Controller",
    responsibility: "Financial control and compliance oversight",
    activities:
      "Review high-risk exceptions, ensure compliance with financial controls and audit requirements",
  },
  {
    role: "Internal Auditor",
    responsibility: "Audit and control validation",
    activities:
      "Review reconciliation evidence, audit trails, approvals, and process compliance",
  },
  {
    role: "System Administrator",
    responsibility: "Platform administration and security",
    activities:
      "Manage users, roles, permissions, configurations, and system integrations",
  },
  {
    role: "AI Agents",
    responsibility: "Process automation and recommendations",
    activities:
      "Perform ingestion, matching, exception analysis, communication support, and reporting",
  },
];

export const TOP_ACTIONS = [
  {
    label: "Notifications",
    icon: BellRing,
  },
];

export const ROLE_LABELS = {
  "AP Analyst": "Operations",
  "AP Team Lead": "Review & Approval",
  "AP Manager": "Oversight",
  "Vendor Management Team": "External Coordination",
  "Finance Controller": "Financial Control",
  "Internal Auditor": "Audit & Compliance",
  "System Administrator": "System Admin",
};

export const STATUS_BADGE_MAP = {
  matched: "success",
  unmatched: "warning",
  exception: "danger",
  pending: "info",
  approved: "success",
  escalated: "danger",
};


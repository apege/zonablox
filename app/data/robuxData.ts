export interface RobuxPackage {
  id: string;
  amount: number;
  priceMYR: number;
  popular?: boolean;
  bestSeller?: boolean;
  vip?: boolean;
  badge?: string;
  stock: "in_stock" | "out_of_stock";
  category: "bestseller" | "vip" | "standard";
}

export interface StepGuide {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}

export interface Testimonial {
  id: string;
  username: string;
  handle: string;
  rating: number;
  avatar: string;
  comment: string;
  adminReply: string;
  robuxAmount: number;
  timeAgo: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

// Packages are fetched dynamically from Neon database via /api/products
export const ROBUX_PACKAGES: RobuxPackage[] = [];

export interface PaymentMethodChannel {
  id: "website" | "whatsapp";
  name: string;
  subtitle: string;
  desc: string;
  badge?: string;
  submethods: string[];
  statusText?: string;
}

export const PAYMENT_METHODS: PaymentMethodChannel[] = [
  {
    id: "website",
    name: "Via Website (Online Checkout)",
    subtitle: "DuitNow QR, TNG, GrabPay, FPX",
    desc: "Pay directly on website & upload payment receipt for instant auto verification.",
    badge: "Recommended ⚡",
    submethods: ["DuitNow QR", "Touch 'n Go eWallet", "GrabPay", "Online Banking FPX"],
  },
  {
    id: "whatsapp",
    name: "Via WhatsApp Manual",
    subtitle: "Direct Chat with Admin",
    desc: "Order manually through our official WhatsApp support channel.",
    statusText: "Currently not servicing WhatsApp",
    submethods: ["Direct WhatsApp Transfer"],
  },
];

// Testimonials are fetched dynamically from Neon database via /api/testimonials
export const TESTIMONIALS: Testimonial[] = [];

export const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Why are Robux rates on ZonaBlox much cheaper?",
    answer:
      "We source directly through licensed regional partner distribution channels and official developer exchanges. This allows us to offer genuine, legal Robux at substantial discounts without any middleman markups.",
  },
  {
    id: "faq-2",
    question: "Do you need my Roblox account password?",
    answer:
      "NO, NEVER! We will NEVER ask for your password or email access. All transactions only require your public Roblox Username. Your account remains 100% safe and under your control.",
  },
  {
    id: "faq-3",
    question: "How long does the top-up process take?",
    answer:
      "Our automated delivery system processes orders within 1 to 5 minutes after payment verification. During peak hours or server maintenance, it might take up to 10 minutes maximum.",
  },
  {
    id: "faq-4",
    question: "What payment methods are supported in Malaysia?",
    answer:
      "We accept all Malaysian payment methods including DuitNow QR, Touch 'n Go (TNG) eWallet, GrabPay, Boost, and Online Banking (FPX / Maybank, CIMB, Public Bank, RHB, etc.).",
  },
  {
    id: "faq-5",
    question: "Is this safe from bans or account warnings?",
    answer:
      "Yes, 100% safe. All Robux transactions comply with Roblox standard transfer protocols and official methods. Over 10,000+ players have trusted us with zero bans.",
  },
];

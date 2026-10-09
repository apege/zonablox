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

export const ROBUX_PACKAGES: RobuxPackage[] = [
  // Best Seller Tier (from official ZonaBlox pricelist)
  {
    id: "pkg-1800",
    amount: 1800,
    priceMYR: 8,
    popular: true,
    bestSeller: true,
    badge: "Most Popular 🔥",
    stock: "in_stock",
    category: "bestseller",
  },
  {
    id: "pkg-2200",
    amount: 2200,
    priceMYR: 10,
    bestSeller: true,
    stock: "in_stock",
    category: "bestseller",
  },
  {
    id: "pkg-2700",
    amount: 2700,
    priceMYR: 12,
    bestSeller: true,
    badge: "Hot Deal ✨",
    stock: "in_stock",
    category: "bestseller",
  },
  {
    id: "pkg-3200",
    amount: 3200,
    priceMYR: 14,
    bestSeller: true,
    stock: "in_stock",
    category: "bestseller",
  },
  {
    id: "pkg-3700",
    amount: 3700,
    priceMYR: 16,
    bestSeller: true,
    stock: "in_stock",
    category: "bestseller",
  },
  {
    id: "pkg-4200",
    amount: 4200,
    priceMYR: 18,
    bestSeller: true,
    stock: "in_stock",
    category: "bestseller",
  },

  // VIP / Whale Tier (High Value Packages)
  {
    id: "pkg-4700",
    amount: 4700,
    priceMYR: 21,
    vip: true,
    badge: "VIP Tier 👑",
    stock: "in_stock",
    category: "vip",
  },
  {
    id: "pkg-5500",
    amount: 5500,
    priceMYR: 23,
    vip: true,
    stock: "in_stock",
    category: "vip",
  },
  {
    id: "pkg-10500",
    amount: 10500,
    priceMYR: 46,
    vip: true,
    badge: "Super Saver 💎",
    stock: "in_stock",
    category: "vip",
  },
  {
    id: "pkg-15500",
    amount: 15500,
    priceMYR: 69,
    vip: true,
    stock: "in_stock",
    category: "vip",
  },
  {
    id: "pkg-20500",
    amount: 20500,
    priceMYR: 92,
    vip: true,
    stock: "in_stock",
    category: "vip",
  },
  {
    id: "pkg-30500",
    amount: 30500,
    priceMYR: 116,
    vip: true,
    badge: "Ultimate Pack 🚀",
    stock: "in_stock",
    category: "vip",
  },
];

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

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "testi-1",
    username: "Farhan Gaming",
    handle: "@farhan_bloxx",
    rating: 5,
    avatar: "/logo.jpg",
    comment: "First time buying Robux here and it took only 3 minutes to arrive! The rates for Malaysia are seriously unbeatable compared to standard prices.",
    adminReply: "Thank you for trusting ZonaBlox! Enjoy your game bro! 🔥",
    robuxAmount: 4200,
    timeAgo: "15 minutes ago",
  },
  {
    id: "testi-2",
    username: "Aisyah N.",
    handle: "@aisyah_rbx",
    rating: 5,
    avatar: "/logo.jpg",
    comment: "Top up 10,500 Robux VIP pack smoothly via DuitNow QR. No password needed, only username! Super clean service.",
    adminReply: "Pleasure serving you! Let us know if you need any rare item top-ups! ✨",
    robuxAmount: 10500,
    timeAgo: "1 hour ago",
  },
  {
    id: "testi-3",
    username: "Danish Haikal",
    handle: "@danish_speed",
    rating: 5,
    avatar: "/logo.jpg",
    comment: "Admin responded in seconds on WhatsApp when I had a question. The 1,800 Robux package for RM8 is absolute value.",
    adminReply: "Our 24/7 team is always ready for Malaysian Robloxian! Enjoy! ⚡",
    robuxAmount: 1800,
    timeAgo: "3 hours ago",
  },
  {
    id: "testi-4",
    username: "Kevin Tan",
    handle: "@kevin_kl",
    rating: 5,
    avatar: "/logo.jpg",
    comment: "Repeat order 30,500 Robux package! Everything clean, legal, and guaranteed safe. ZonaBlox is my go-to store in KL.",
    adminReply: "Solid loyalty! We've granted you VIP priority processing for your next orders! 👑",
    robuxAmount: 30500,
    timeAgo: "6 hours ago",
  },
];

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

export interface Patent {
  id: string;
  title: string;
  patentNumber: string;
  category: string;
  description: string;
  innovatorName: string;
  innovatorCountry: string;
  filingDate: string;
  status: "Active" | "Pending" | "Granted";
  fundingRequired: string;
  investmentStage: string;
  image: string;
  tags: string[];
  views: number;
  interested: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Innovator" | "Investor" | "Manufacturer";
  country: string;
  avatar: string;
  bio: string;
}

export const categories = [
  "All Categories",
  "Biotechnology",
  "Renewable Energy",
  "Software & AI",
  "Hardware & Electronics",
  "Mechanical Engineering",
  "Medical Devices",
  "Agriculture",
  "Environmental Tech",
];

export const mockPatents: Patent[] = [
  {
    id: "1",
    title: "AI-Powered Solar Panel Efficiency Optimizer",
    patentNumber: "LK/P/2024/001234",
    category: "Renewable Energy",
    description: "An innovative system that uses machine learning algorithms to optimize solar panel positioning and energy output in real-time, increasing efficiency by up to 35%.",
    innovatorName: "Dr. Nimal Perera",
    innovatorCountry: "Sri Lanka",
    filingDate: "2024-01-15",
    status: "Granted",
    fundingRequired: "LKR 500,000 - LKR 1,000,000",
    investmentStage: "Series A",
    image: "https://images.unsplash.com/photo-1628206554160-63e8c921e398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW5ld2FibGUlMjBlbmVyZ3klMjBzb2xhciUyMHBhbmVsc3xlbnwxfHx8fDE3NzMzNTM1MzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tags: ["Solar Energy", "AI", "Green Tech", "IoT"],
    views: 1245,
    interested: 34,
  },
  {
    id: "2",
    title: "Biodegradable Packaging from Coconut Waste",
    patentNumber: "LK/P/2024/002156",
    category: "Environmental Tech",
    description: "Revolutionary biodegradable packaging material made from coconut husk waste, providing a sustainable alternative to plastic packaging with superior strength and moisture resistance.",
    innovatorName: "Ayesha Fernando",
    innovatorCountry: "Sri Lanka",
    filingDate: "2024-02-20",
    status: "Active",
    fundingRequired: "LKR 250,000 - LKR 500,000",
    investmentStage: "Seed",
    image: "https://images.unsplash.com/photo-1704969723938-0c310608d6c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbm5vdmF0aW9uJTIwdGVjaG5vbG9neSUyMHBhdGVudHxlbnwxfHx8fDE3NzMzOTE0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tags: ["Sustainability", "Packaging", "Agriculture", "Eco-friendly"],
    views: 892,
    interested: 28,
  },
  {
    id: "3",
    title: "Portable Water Purification System",
    patentNumber: "LK/P/2023/009875",
    category: "Medical Devices",
    description: "Compact, battery-powered water purification device using advanced UV-C and filtration technology, capable of purifying 50 liters per hour for emergency and rural applications.",
    innovatorName: "Rohan Silva",
    innovatorCountry: "Sri Lanka",
    filingDate: "2023-11-10",
    status: "Granted",
    fundingRequired: "LKR 750,000 - LKR 1,500,000",
    investmentStage: "Series A",
    image: "https://images.unsplash.com/photo-1766297246958-b6ca17b56fb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW90ZWNobm9sb2d5JTIwbGFib3JhdG9yeSUyMHJlc2VhcmNofGVufDF8fHx8MTc3MzM3MTE1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tags: ["Healthcare", "Water", "Emergency", "Rural Development"],
    views: 1567,
    interested: 45,
  },
  {
    id: "4",
    title: "Smart Agriculture Monitoring Platform",
    patentNumber: "LK/P/2024/003421",
    category: "Software & AI",
    description: "IoT-based platform with AI analytics for real-time crop monitoring, pest detection, and yield prediction. Reduces water usage by 40% and increases crop yield by 25%.",
    innovatorName: "Dr. Chaminda Wickramasinghe",
    innovatorCountry: "Sri Lanka",
    filingDate: "2024-03-05",
    status: "Active",
    fundingRequired: "LKR 300,000 - LKR 600,000",
    investmentStage: "Seed",
    image: "https://images.unsplash.com/photo-1672385277648-85eddc237a2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGNvZGluZyUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc3MzM4NzM0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tags: ["Agriculture", "IoT", "AI", "Smart Farming"],
    views: 2103,
    interested: 56,
  },
  {
    id: "5",
    title: "Automated Robotic Tea Harvesting System",
    patentNumber: "LK/P/2024/001987",
    category: "Mechanical Engineering",
    description: "Precision robotic system for automated tea leaf harvesting with computer vision to select only the finest two leaves and a bud, maintaining traditional quality standards.",
    innovatorName: "Tharaka Jayasuriya",
    innovatorCountry: "Sri Lanka",
    filingDate: "2024-01-28",
    status: "Pending",
    fundingRequired: "LKR 1,000,000 - LKR 2,000,000",
    investmentStage: "Series B",
    image: "https://images.unsplash.com/photo-1759148413911-5ded7ed2ec06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWNoYW5pY2FsJTIwZW5naW5lZXJpbmclMjBtYWNoaW5lcnl8ZW58MXx8fHwxNzczMzkxNDk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tags: ["Robotics", "Agriculture", "Automation", "Computer Vision"],
    views: 3421,
    interested: 67,
  },
  {
    id: "6",
    title: "Herbal Extract Cancer Treatment Compound",
    patentNumber: "LK/P/2023/008654",
    category: "Biotechnology",
    description: "Novel pharmaceutical compound derived from indigenous Sri Lankan herbs showing promising results in targeting specific cancer cell types with minimal side effects.",
    innovatorName: "Prof. Malini Rajapaksa",
    innovatorCountry: "Sri Lanka",
    filingDate: "2023-09-18",
    status: "Granted",
    fundingRequired: "LKR 2,000,000 - LKR 5,000,000",
    investmentStage: "Series C",
    image: "https://images.unsplash.com/photo-1766297246958-b6ca17b56fb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW90ZWNobm9sb2d5JTIwbGFib3JhdG9yeSUyMHJlc2VhcmNofGVufDF8fHx8MTc3MzM3MTE1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tags: ["Healthcare", "Pharmaceuticals", "Biotechnology", "Research"],
    views: 4532,
    interested: 89,
  },
];

export const mockCurrentUser: User = {
  id: "user-123",
  name: "Kasun Bandara",
  email: "kasun@innovatesl.com",
  role: "Innovator",
  country: "Sri Lanka",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kasun",
  bio: "Passionate innovator focused on renewable energy solutions for developing nations.",
};

export const mockInvestors = [
  {
    id: "inv-1",
    name: "TechVentures Asia",
    type: "Venture Capital",
    focusAreas: ["Software & AI", "Renewable Energy"],
    investmentRange: "LKR 500K - LKR 5M",
    country: "Singapore",
  },
  {
    id: "inv-2",
    name: "Green Future Fund",
    type: "Impact Investment",
    focusAreas: ["Renewable Energy", "Environmental Tech"],
    investmentRange: "LKR 1M - LKR 10M",
    country: "United States",
  },
  {
    id: "inv-3",
    name: "Lanka Innovation Partners",
    type: "Angel Investor Network",
    focusAreas: ["All Categories"],
    investmentRange: "LKR 100K - LKR 1M",
    country: "Sri Lanka",
  },
];

export const mockManufacturers = [
  {
    id: "man-1",
    name: "Advanced Manufacturing Solutions",
    specialty: "Electronics & Hardware",
    capacity: "Mass Production",
    country: "India",
  },
  {
    id: "man-2",
    name: "BioTech Industries Ltd",
    specialty: "Pharmaceutical & Medical Devices",
    capacity: "Commercial Scale",
    country: "Singapore",
  },
  {
    id: "man-3",
    name: "Green Energy Corp",
    specialty: "Renewable Energy Systems",
    capacity: "Industrial Scale",
    country: "Germany",
  },
];

export const mockNotifications = [
  {
    id: "not-1",
    type: "interest",
    message: "TechVentures Asia expressed interest in your patent",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "not-2",
    type: "message",
    message: "New message from Green Future Fund",
    time: "5 hours ago",
    unread: true,
  },
  {
    id: "not-3",
    type: "update",
    message: "Your patent LK/P/2024/001234 status updated to Granted",
    time: "1 day ago",
    unread: false,
  },
];

export const mockChatMessages = [
  {
    id: "msg-1",
    sender: "AI Assistant",
    message: "Hello! I'm your AI innovation assistant. How can I help you today?",
    timestamp: "10:00 AM",
    isBot: true,
  },
  {
    id: "msg-2",
    sender: "You",
    message: "I'm looking for renewable energy investment opportunities",
    timestamp: "10:02 AM",
    isBot: false,
  },
  {
    id: "msg-3",
    sender: "AI Assistant",
    message: "Great! I found 3 promising renewable energy patents that match your interests. The top recommendation is the 'AI-Powered Solar Panel Efficiency Optimizer' by Dr. Nimal Perera, which has shown 35% efficiency improvements and is seeking LKR 500K-LKR 1M in Series A funding. Would you like more details?",
    timestamp: "10:02 AM",
    isBot: true,
  },
];

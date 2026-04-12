import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Eye,
  Heart,
  Loader2,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { chatService, investmentService, patentService, PatentAnalytics } from "../services";
import { toast } from "sonner";

const palette = ["#2563eb", "#7c3aed", "#059669", "#f59e0b", "#ef4444", "#14b8a6"];

const formatLkr = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [innovatorAnalytics, setInnovatorAnalytics] = useState<PatentAnalytics | null>(null);
  const [investmentSummary, setInvestmentSummary] = useState({ totalAmount: 0, active: 0, pending: 0, completed: 0 });
  const [conversationCount, setConversationCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [conversations, investments] = await Promise.all([
          chatService.getConversations(),
          investmentService.getInvestments(),
        ]);

        setConversationCount(conversations.length);
        setInvestmentSummary({
          totalAmount: investments.reduce((sum, item) => sum + (item.amount || 0), 0),
          active: investments.filter((item) => item.status === "active").length,
          pending: investments.filter((item) => item.status === "pending").length,
          completed: investments.filter((item) => item.status === "completed").length,
        });

        if (user.role === "Innovator") {
          const analytics = await patentService.getMyAnalytics();
          setInnovatorAnalytics(analytics);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user?.id, user?.role]);

  const metrics = useMemo(() => {
    if (user?.role === "Innovator" && innovatorAnalytics) {
      return [
        { title: "Total Patents", value: innovatorAnalytics.summary.totalPatents.toString(), icon: BarChart3 },
        { title: "Total Views", value: innovatorAnalytics.summary.totalViews.toLocaleString(), icon: Eye },
        { title: "Interested Parties", value: innovatorAnalytics.summary.totalInterest.toString(), icon: Heart },
        { title: "Conversations", value: conversationCount.toString(), icon: MessageSquare },
      ];
    }

    return [
      { title: "Investment Volume", value: formatLkr(investmentSummary.totalAmount), icon: DollarSign },
      { title: "Active Deals", value: investmentSummary.active.toString(), icon: TrendingUp },
      { title: "Pending Deals", value: investmentSummary.pending.toString(), icon: Calendar },
      { title: "Conversations", value: conversationCount.toString(), icon: MessageSquare },
    ];
  }, [user?.role, innovatorAnalytics, investmentSummary, conversationCount]);

  const performanceData = innovatorAnalytics?.performance.slice(0, 6).map((item) => ({
    name: item.title.length > 18 ? `${item.title.slice(0, 18)}...` : item.title,
    views: item.views,
    interest: item.interested,
  })) || [];

  const categoryData = innovatorAnalytics?.categories || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-8 flex items-center justify-center text-gray-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              {user?.role === "Innovator"
                ? "Track patent performance, interest, and activity around your portfolio"
                : "Track deal flow, investment totals, and active conversations"}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Calendar className="mr-2 h-4 w-4" />
              Current Snapshot
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div key={metric.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold mb-1">{metric.value}</div>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {user?.role === "Innovator" ? (
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Patent Performance</span>
                    <Badge variant="secondary">Views vs Interest</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceData.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">No analytics data available yet.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill="#2563eb" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="interest" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Patent Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">No categories yet.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                          {categoryData.map((entry, index) => (
                            <Cell key={entry.name} fill={palette[index % palette.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{user?.role === "Innovator" ? "Portfolio Summary" : "Deal Summary"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user?.role === "Innovator" && innovatorAnalytics ? (
                <>
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                    <span className="text-gray-700">Average views per patent</span>
                    <span className="font-semibold text-blue-700">{innovatorAnalytics.summary.averageViewsPerPatent}</span>
                  </div>
                  <div className="space-y-3">
                    {innovatorAnalytics.performance.slice(0, 5).map((item) => (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="font-medium">{item.title}</p>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{item.views} views</span>
                          <span>{item.interested} interested</span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
                    <span className="text-gray-700">Total investment volume</span>
                    <span className="font-semibold text-green-700">{formatLkr(investmentSummary.totalAmount)}</span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold">{investmentSummary.active}</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold">{investmentSummary.pending}</p>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold">{investmentSummary.completed}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Highlights</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Conversations</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{conversationCount}</p>
                <p className="text-xs text-gray-600 mt-1">Active threads linked to your account</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Momentum</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {user?.role === "Innovator" ? innovatorAnalytics?.summary.totalInterest || 0 : investmentSummary.active}
                </p>
                <p className="text-xs text-gray-600 mt-1">Most relevant ongoing activity</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Engagement</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {user?.role === "Innovator" ? innovatorAnalytics?.summary.totalViews || 0 : investmentSummary.pending}
                </p>
                <p className="text-xs text-gray-600 mt-1">Views or pending actions tied to your account</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Commercial Impact</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {user?.role === "Innovator" ? innovatorAnalytics?.summary.totalPatents || 0 : formatLkr(investmentSummary.totalAmount)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Patents published or capital under discussion</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Bell, Briefcase, Factory, MessageSquare, Search, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { usePatents } from "../hooks/usePatents";
import { chatService, investmentService, notificationService, type Investment } from "../services";
import { getDashboardPathForRole } from "../utils/roleRouting";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  active: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const formatLkr = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export function ManufacturerDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { patents, loading } = usePatents({ autoLoad: true });
  const [conversationCount, setConversationCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [deals, setDeals] = useState<Investment[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "Manufacturer") {
      navigate(getDashboardPathForRole(user.role));
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    const loadExtras = async () => {
      if (!user) return;
      try {
        setLoadingExtras(true);
        const [conversations, unreadCount, allInvestments] = await Promise.all([
          chatService.getConversations(),
          notificationService.getUnreadCount(),
          investmentService.getInvestments(),
        ]);
        setConversationCount(conversations.length);
        setUnreadNotifications(unreadCount);
        setDeals(allInvestments.filter((item) => item.investor?._id === user.id));
      } catch (error: any) {
        toast.error(error.message || "Failed to load dashboard data");
      } finally {
        setLoadingExtras(false);
      }
    };

    void loadExtras();
  }, [user?.id]);

  const relevantPatents = useMemo(
    () => [...patents].sort((a, b) => (b.views + b.interested) - (a.views + a.interested)).slice(0, 5),
    [patents],
  );

  const dealSummary = useMemo(() => {
    const pending = deals.filter((item) => item.status === "pending");
    const active = deals.filter((item) => item.status === "active");
    const completed = deals.filter((item) => item.status === "completed");

    return {
      pendingCount: pending.length,
      activeCount: active.length,
      completedCount: completed.length,
      totalAmount: deals.reduce((sum, item) => sum + (item.amount || 0), 0),
    };
  }, [deals]);

  const stats = [
    { label: "Open opportunities", value: relevantPatents.length.toString(), icon: Search },
    { label: "Pending proposals", value: dealSummary.pendingCount.toString(), icon: Settings2 },
    { label: "Active partnerships", value: dealSummary.activeCount.toString(), icon: Briefcase },
    { label: "Production budget", value: formatLkr(dealSummary.totalAmount), icon: Factory },
  ];

  if (authLoading || !user || user.role !== "Manufacturer") {
    return authLoading ? <LoadingSpinner /> : null;
  }

  if (loading || loadingExtras) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">Manufacturer Dashboard</h1>
              <p className="text-sm text-purple-100 md:text-base">
                Welcome back, {user.name || "Manufacturer"}. Shortlist technologies, propose partnerships, and track production-ready deals.
              </p>
            </motion.div>
            <Button size="lg" className="w-full bg-white text-purple-700 hover:bg-purple-50 sm:w-auto" asChild>
              <Link to="/browse">
                <Search className="mr-2 h-4 w-4" />
                Find Technologies
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <Icon className="h-7 w-7 text-purple-600" />
                      <ArrowUpRight className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="mb-1 text-2xl font-bold md:text-3xl">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
            <Tabs defaultValue="opportunities">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="deals">My deals</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="opportunities" className="space-y-4">
                {relevantPatents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-600">No manufacturing opportunities are available yet.</CardContent>
                  </Card>
                ) : (
                  relevantPatents.map((patent) => (
                    <Card key={patent._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="h-32 w-full flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 sm:w-40">
                            {patent.image ? (
                              <img src={patent.image} alt={patent.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Factory className="h-10 w-10 text-white/60" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge>{patent.category}</Badge>
                              <Badge variant="outline">{patent.status}</Badge>
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">Manufacturing fit</Badge>
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">{patent.title}</h3>
                            <p className="mb-3 line-clamp-2 text-sm text-gray-600">{patent.description}</p>
                            <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>{patent.views || 0} views</span>
                              <span>{patent.interested || 0} interested</span>
                              <span>{patent.investmentStage}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" asChild>
                                <Link to={`/patent/${patent._id}`}>View patent</Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/investments?patentId=${patent._id}`}>Send partnership proposal</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="deals" className="space-y-4">
                {deals.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-600">
                      No manufacturing proposals yet. Open a patent and send your first partnership proposal.
                    </CardContent>
                  </Card>
                ) : (
                  deals.map((deal) => (
                    <Card key={deal._id}>
                      <CardContent className="pt-6">
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{deal.patent?.title}</h3>
                            <p className="text-sm text-gray-600">Innovator: {deal.innovator?.name}</p>
                          </div>
                          <Badge className={statusBadge[deal.status] || "bg-gray-100 text-gray-700 border-gray-200"}>{deal.status}</Badge>
                        </div>
                        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Amount: {formatLkr(deal.amount || 0)}</span>
                          <span>Equity: {deal.equity}%</span>
                          <span>Next milestone: {deal.nextMilestone || "Not set"}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/patent/${deal.patent?._id}`}>View patent</Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link to={`/investments?status=${deal.status}`}>Open deal workspace</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">Coordination and outreach</h3>
                    <p className="mb-4 text-sm text-gray-600">
                      You currently have {conversationCount} active conversation{conversationCount === 1 ? "" : "s"}.
                    </p>
                    <Button asChild>
                      <Link to="/messages">Open Messages</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/browse">Browse technologies</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/investments?status=pending">Review pending proposals</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/investments?status=active">Manage active partnerships</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/messages">Open messages</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Bell className="h-4 w-4" />Unread notifications</span>
                  <span className="font-semibold text-gray-900">{unreadNotifications}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending proposals</span>
                  <span className="font-semibold text-gray-900">{dealSummary.pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active partnerships</span>
                  <span className="font-semibold text-gray-900">{dealSummary.activeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed deals</span>
                  <span className="font-semibold text-gray-900">{dealSummary.completedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total tracked budget</span>
                  <span className="font-semibold text-gray-900">{formatLkr(dealSummary.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

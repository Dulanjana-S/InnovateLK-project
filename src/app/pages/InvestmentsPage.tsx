import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Filter,
  Loader2,
  PlusCircle,
  Search,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { investmentService, type Investment, patentService, type Patent } from "../services";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getDashboardPathForRole } from "../utils/roleRouting";

const statusOptions = ["pending", "active", "completed", "cancelled"] as const;

const formatLkr = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

type DraftState = {
  amount: string;
  equity: string;
  nextMilestone: string;
  notes: string;
  returns: string;
};

export function InvestmentsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [availablePatents, setAvailablePatents] = useState<Patent[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [form, setForm] = useState({
    patentId: searchParams.get("patentId") || "",
    amount: "",
    equity: "",
    nextMilestone: "",
    notes: "",
  });

  const isInnovator = user?.role === "Innovator";
  const requestedPatentId = searchParams.get("patentId") || "";
  const canCreateProposal = user?.role === "Investor" || user?.role === "Manufacturer";
  const proposalNoun = user?.role === "Manufacturer" ? "manufacturing proposal" : "investment proposal";

  const getPartnerRole = (investment: Investment) => investment.partnerRole || investment.investor.role || "Investor";

  const loadData = async () => {
    try {
      setLoading(true);
      const [investmentData, patentData] = await Promise.all([
        investmentService.getInvestments(),
        canCreateProposal ? patentService.getPatents({ limit: 100 }) : Promise.resolve([]),
      ]);
      setInvestments(investmentData);
      setAvailablePatents(patentData);
      setDrafts(
        Object.fromEntries(
          investmentData.map((investment) => [
            investment._id,
            {
              amount: String(investment.amount ?? ""),
              equity: String(investment.equity ?? ""),
              nextMilestone: investment.nextMilestone || "",
              notes: investment.notes || "",
              returns: String(investment.returns ?? ""),
            },
          ]),
        ),
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (!['Innovator', 'Investor', 'Manufacturer'].includes(user.role)) {
      navigate(getDashboardPathForRole(user.role));
      return;
    }

    void loadData();
  }, [canCreateProposal, navigate, user?.id, user?.role]);

  const filteredInvestments = useMemo(() => {
    return investments.filter((investment) => {
      const matchesSearch =
        !searchQuery ||
        investment.patent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        investment.innovator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        investment.investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        investment.patent.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getPartnerRole(investment).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || investment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [investments, searchQuery, statusFilter]);

  const metrics = useMemo(() => {
    const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
    const active = investments.filter((item) => item.status === "active").length;
    const pending = investments.filter((item) => item.status === "pending").length;
    const avgReturns = investments.length
      ? investments.reduce((sum, item) => sum + (item.returns || 0), 0) / investments.length
      : 0;

    return { totalInvested, active, pending, avgReturns };
  }, [investments]);

  const visiblePatents = useMemo(() => {
    const existingPatentIds = new Set(investments.filter((item) => item.investor._id === user?.id).map((item) => item.patent._id));
    return availablePatents.filter((patent) => patent._id && patent.innovator?._id !== user?.id && !existingPatentIds.has(patent._id));
  }, [availablePatents, investments, user?.id]);

  useEffect(() => {
    if (!requestedPatentId) return;
    const match = visiblePatents.find((patent) => patent._id === requestedPatentId);
    if (match) {
      setForm((current) => ({ ...current, patentId: requestedPatentId }));
    }
  }, [requestedPatentId, visiblePatents]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (statusFilter && statusFilter !== "all") nextParams.set("status", statusFilter);
    else nextParams.delete("status");

    if (searchQuery.trim()) nextParams.set("q", searchQuery.trim());
    else nextParams.delete("q");

    if (form.patentId) nextParams.set("patentId", form.patentId);
    else nextParams.delete("patentId");

    setSearchParams(nextParams, { replace: true });
  }, [statusFilter, searchQuery, form.patentId]);

  const handleCreate = async () => {
    if (!form.patentId || !form.amount) {
      toast.error("Select a patent and enter a proposal amount");
      return;
    }

    try {
      setCreating(true);
      await investmentService.createInvestment({
        patentId: form.patentId,
        amount: Number(form.amount),
        equity: form.equity ? Number(form.equity) : undefined,
        nextMilestone: form.nextMilestone || undefined,
        notes: form.notes || undefined,
      });
      toast.success(`Your ${proposalNoun} has been submitted`);
      setForm({ patentId: "", amount: "", equity: "", nextMilestone: "", notes: "" });
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create investment");
    } finally {
      setCreating(false);
    }
  };

  const getDraft = (investment: Investment): DraftState =>
    drafts[investment._id] || {
      amount: String(investment.amount ?? ""),
      equity: String(investment.equity ?? ""),
      nextMilestone: investment.nextMilestone || "",
      notes: investment.notes || "",
      returns: String(investment.returns ?? ""),
    };

  const setDraftField = (investmentId: string, field: keyof DraftState, value: string) => {
    setDrafts((current) => ({
      ...current,
      [investmentId]: {
        ...(current[investmentId] || { amount: "", equity: "", nextMilestone: "", notes: "", returns: "" }),
        [field]: value,
      },
    }));
  };

  const canSaveDetails = (investment: Investment) => {
    const isProposalOwner = investment.investor._id === user?.id;
    const isInnovatorOwner = investment.innovator._id === user?.id;

    if (investment.status === "pending") {
      return isProposalOwner || isInnovatorOwner;
    }

    if (investment.status === "active") {
      return isProposalOwner || isInnovatorOwner;
    }

    return false;
  };

  const handleSaveDraft = async (investment: Investment) => {
    const draft = getDraft(investment);
    const isProposalOwner = investment.investor._id === user?.id;
    const isInnovatorOwner = investment.innovator._id === user?.id;
    const payload: Record<string, unknown> = {};

    if (investment.status === "pending" && isProposalOwner) {
      payload.amount = Number(draft.amount || 0);
      payload.equity = Number(draft.equity || 0);
      payload.nextMilestone = draft.nextMilestone;
      payload.notes = draft.notes;
    } else if (investment.status === "pending" && isInnovatorOwner) {
      payload.equity = Number(draft.equity || 0);
      payload.nextMilestone = draft.nextMilestone;
      payload.notes = draft.notes;
    } else if (investment.status === "active" && isProposalOwner) {
      payload.nextMilestone = draft.nextMilestone;
      payload.notes = draft.notes;
    } else if (investment.status === "active" && isInnovatorOwner) {
      payload.equity = Number(draft.equity || 0);
      payload.nextMilestone = draft.nextMilestone;
      payload.notes = draft.notes;
      payload.returns = Number(draft.returns || 0);
    } else {
      return;
    }

    try {
      setSavingId(investment._id);
      await investmentService.updateInvestment(investment._id, payload);
      toast.success("Deal details updated");
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update deal details");
    } finally {
      setSavingId(null);
    }
  };

  const handleQuickStatusUpdate = async (investment: Investment, status: "active" | "completed" | "cancelled") => {
    try {
      setSavingId(investment._id);
      await investmentService.updateInvestment(investment._id, { status });
      if (status === "active") {
        toast.success("Proposal approved and moved to active deals");
      } else if (status === "completed") {
        toast.success("Deal marked as completed");
      } else {
        toast.success("Deal status updated");
      }
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update investment");
    } finally {
      setSavingId(null);
    }
  };

  const getStatusColor = (status: Investment["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusHelp = (investment: Investment) => {
    const partnerRole = getPartnerRole(investment);
    if (investment.status === "pending") {
      return partnerRole === "Manufacturer"
        ? "Waiting for the innovator to accept or decline this manufacturing partnership proposal."
        : "Waiting for the innovator to accept or decline this investment proposal.";
    }
    if (investment.status === "active") {
      return "This deal is active. Use the notes and milestone fields to track next steps.";
    }
    if (investment.status === "completed") {
      return "This deal has been completed and is now read-only.";
    }
    return "This record was cancelled or declined and is now read-only.";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Investments & Deals</h1>
            <p className="text-gray-600">
              {isInnovator
                ? "Review incoming proposals, approve the right deals, and manage active partnerships."
                : user?.role === "Manufacturer"
                  ? "Submit manufacturing proposals and track every deal in one place."
                  : "Submit investment proposals and track every deal in one place."}
            </p>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <DollarSign className="h-6 w-6 text-blue-600 mb-3" />
              <div className="text-2xl font-bold">{formatLkr(metrics.totalInvested)}</div>
              <p className="text-sm text-gray-600">Total proposal value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <TrendingUp className="h-6 w-6 text-green-600 mb-3" />
              <div className="text-2xl font-bold">{metrics.active}</div>
              <p className="text-sm text-gray-600">Active deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <BarChart3 className="h-6 w-6 text-purple-600 mb-3" />
              <div className="text-2xl font-bold">{metrics.avgReturns.toFixed(1)}%</div>
              <p className="text-sm text-gray-600">Average returns</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Calendar className="h-6 w-6 text-orange-600 mb-3" />
              <div className="text-2xl font-bold">{metrics.pending}</div>
              <p className="text-sm text-gray-600">Pending proposals</p>
            </CardContent>
          </Card>
        </div>

        {canCreateProposal && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-blue-600" />
                Create {user?.role === "Manufacturer" ? "Manufacturing" : "Investment"} Proposal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Patent</Label>
                <Select value={form.patentId} onValueChange={(value) => setForm((prev) => ({ ...prev, patentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patent to propose on" />
                  </SelectTrigger>
                  <SelectContent>
                    {visiblePatents.map((patent) => (
                      <SelectItem key={patent._id} value={patent._id}>
                        {patent.title} • {patent.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {visiblePatents.length === 0 ? (
                  <p className="text-xs text-gray-500">You already have proposals on the currently available patents or there are no approved patents ready for proposals.</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Proposal Amount (LKR)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label>Proposed Equity %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.equity}
                  onChange={(e) => setForm((prev) => ({ ...prev, equity: e.target.value }))}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label>Next Milestone</Label>
                <Input
                  value={form.nextMilestone}
                  onChange={(e) => setForm((prev) => ({ ...prev, nextMilestone: e.target.value }))}
                  placeholder="Prototype validation"
                />
              </div>
              <div className="space-y-2">
                <Label>Proposal Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={user?.role === "Manufacturer" ? "Outline manufacturing readiness, plant capacity, or production expectations" : "Optional note for the innovator about why this investment is a fit"}
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={() => void handleCreate()} disabled={creating || visiblePatents.length === 0}>
                  {creating ? "Submitting..." : `Submit ${user?.role === "Manufacturer" ? "Proposal" : "Investment"}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patent, proposal owner, innovator, or category"
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status[0].toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {authLoading ? <LoadingSpinner /> : !user || !["Innovator", "Investor", "Manufacturer"].includes(user.role) ? null : loading ? (
          <Card>
            <CardContent className="py-16 flex items-center justify-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading deals...
            </CardContent>
          </Card>
        ) : filteredInvestments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="text-xl font-semibold mb-2">No deals yet</h3>
              <p className="text-gray-600 mb-4">
                {isInnovator
                  ? "When investors or manufacturers send you proposals, they will appear here."
                  : `Create your first ${proposalNoun} from the form above or browse patents to find opportunities.`}
              </p>
              <Button asChild variant="outline">
                <Link to="/browse">Browse Patents</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredInvestments.map((investment, index) => {
              const draft = getDraft(investment);
              const isProposalOwner = user?.id === investment.investor._id;
              const isInnovatorOwner = user?.id === investment.innovator._id;
              const partnerRole = getPartnerRole(investment);
              const partnerLabel = partnerRole === "Manufacturer" ? "Manufacturing partner" : "Investor";
              const canApprove = isInnovatorOwner && investment.status === "pending";
              const canWithdraw = isProposalOwner && ["pending", "active"].includes(investment.status);
              const canComplete = isInnovatorOwner && investment.status === "active";

              return (
                <motion.div
                  key={investment._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{investment.patent.title}</h3>
                          <Badge className={getStatusColor(investment.status)}>{investment.status}</Badge>
                          <Badge variant="outline">{investment.patent.category}</Badge>
                          <Badge variant="outline">{partnerLabel}</Badge>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                          <div>
                            <p className="text-xs text-gray-500">Proposal owner</p>
                            <p className="font-medium">{investment.investor.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Patent owner</p>
                            <p className="font-medium">{investment.innovator.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-medium">{formatLkr(investment.amount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Equity</p>
                            <p className="font-medium">{investment.equity}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Returns</p>
                            <p className="font-medium">{investment.returns}%</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">{getStatusHelp(investment)}</p>

                        <div className="rounded-lg border bg-gray-50 p-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                          {(isProposalOwner && investment.status === "pending") ? (
                            <div className="space-y-2">
                              <Label>Amount</Label>
                              <Input type="number" min="0" value={draft.amount} onChange={(e) => setDraftField(investment._id, "amount", e.target.value)} />
                            </div>
                          ) : null}
                          {(isProposalOwner && investment.status === "pending") || isInnovatorOwner ? (
                            <div className="space-y-2">
                              <Label>Equity %</Label>
                              <Input type="number" min="0" max="100" value={draft.equity} onChange={(e) => setDraftField(investment._id, "equity", e.target.value)} />
                            </div>
                          ) : null}
                          {canSaveDetails(investment) ? (
                            <div className="space-y-2 xl:col-span-2">
                              <Label>Next milestone</Label>
                              <Input value={draft.nextMilestone} onChange={(e) => setDraftField(investment._id, "nextMilestone", e.target.value)} placeholder="Next deal milestone" />
                            </div>
                          ) : null}
                          {(isInnovatorOwner && investment.status === "active") ? (
                            <div className="space-y-2">
                              <Label>Returns %</Label>
                              <Input type="number" value={draft.returns} onChange={(e) => setDraftField(investment._id, "returns", e.target.value)} />
                            </div>
                          ) : null}
                          {canSaveDetails(investment) ? (
                            <div className="space-y-2 md:col-span-2 xl:col-span-5">
                              <Label>Notes</Label>
                              <Textarea value={draft.notes} onChange={(e) => setDraftField(investment._id, "notes", e.target.value)} rows={3} placeholder="Add proposal or deal notes" />
                            </div>
                          ) : null}
                          {canSaveDetails(investment) ? (
                            <div className="md:col-span-2 xl:col-span-5 flex flex-wrap gap-2">
                              <Button onClick={() => void handleSaveDraft(investment)} disabled={savingId === investment._id}>
                                {savingId === investment._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save details
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 justify-between lg:items-end">
                        <Button asChild variant="outline">
                          <Link to={`/patent/${investment.patent._id}`}>View Patent</Link>
                        </Button>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          {canApprove ? (
                            <>
                              <Button size="sm" onClick={() => void handleQuickStatusUpdate(investment, "active")} disabled={savingId === investment._id}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => void handleQuickStatusUpdate(investment, "cancelled")} disabled={savingId === investment._id}>
                                Decline
                              </Button>
                            </>
                          ) : null}
                          {canComplete ? (
                            <>
                              <Button size="sm" onClick={() => void handleQuickStatusUpdate(investment, "completed")} disabled={savingId === investment._id}>
                                Mark Completed
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => void handleQuickStatusUpdate(investment, "cancelled")} disabled={savingId === investment._id}>
                                Cancel Deal
                              </Button>
                            </>
                          ) : null}
                          {canWithdraw ? (
                            <Button size="sm" variant="outline" onClick={() => void handleQuickStatusUpdate(investment, "cancelled")} disabled={savingId === investment._id}>
                              {investment.status === "pending" ? "Withdraw Proposal" : "Leave Deal"}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

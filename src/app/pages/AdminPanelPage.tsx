import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { BarChart3, BriefcaseBusiness, CheckCircle2, FileCheck, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { adminService, type AdminAnalytics, type AdminOverview, type Investment, type Patent, type User } from '../services';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'patents', label: 'Patents', icon: FileCheck },
  { id: 'investments', label: 'Investments', icon: BriefcaseBusiness },
  { id: 'analytics', label: 'Analytics', icon: Shield },
] as const;

type AdminTab = typeof tabs[number]['id'];

const patentModerationBadge: Record<string, string> = {
  pending_review: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const investmentStatusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  active: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

function isTab(value: string | null): value is AdminTab {
  return tabs.some((tab) => tab.id === value);
}

const formatLkr = (amount: number) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export function AdminPanelPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>(isTab(searchParams.get('tab')) ? (searchParams.get('tab') as AdminTab) : 'overview');
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  const [userFilters, setUserFilters] = useState({ role: '', search: '', verified: '', isActive: '' });
  const [patentFilters, setPatentFilters] = useState({ moderationStatus: '', status: '', search: '' });
  const [investmentFilters, setInvestmentFilters] = useState({ status: '', search: '' });

  const [patentNotes, setPatentNotes] = useState<Record<string, string>>({});
  const [investmentNotes, setInvestmentNotes] = useState<Record<string, string>>({});
  const [investmentReturns, setInvestmentReturns] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (user.role !== 'Admin') {
        toast.error('Admin access only');
        navigate('/');
        return;
      }
      void loadInitial();
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', activeTab);
    setSearchParams(nextParams, { replace: true });
  }, [activeTab]);

  const syncEditableState = (patentList: Patent[], investmentList: Investment[]) => {
    setPatentNotes(Object.fromEntries(patentList.map((item) => [item._id, item.adminNotes || ''])));
    setInvestmentNotes(Object.fromEntries(investmentList.map((item) => [item._id, item.notes || ''])));
    setInvestmentReturns(Object.fromEntries(investmentList.map((item) => [item._id, String(item.returns ?? 0)])));
  };

  const loadInitial = async () => {
    try {
      setPageLoading(true);
      const [overviewData, analyticsData, usersData, patentsData, investmentsData] = await Promise.all([
        adminService.getOverview(),
        adminService.getAnalytics(),
        adminService.getUsers(),
        adminService.getPatents(),
        adminService.getInvestments(),
      ]);
      setOverview(overviewData);
      setAnalytics(analyticsData);
      setUsers(usersData);
      setPatents(patentsData);
      setInvestments(investmentsData);
      syncEditableState(patentsData, investmentsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load admin panel');
    } finally {
      setPageLoading(false);
    }
  };

  const refreshOverview = async () => {
    try {
      setRefreshing(true);
      const [overviewData, analyticsData] = await Promise.all([
        adminService.getOverview(),
        adminService.getAnalytics(),
      ]);
      setOverview(overviewData);
      setAnalytics(analyticsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to refresh analytics');
    } finally {
      setRefreshing(false);
    }
  };

  const loadUsers = async () => {
    try {
      setRefreshing(true);
      setUsers(await adminService.getUsers(userFilters));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setRefreshing(false);
    }
  };

  const loadPatents = async () => {
    try {
      setRefreshing(true);
      const patentData = await adminService.getPatents(patentFilters);
      setPatents(patentData);
      setPatentNotes(Object.fromEntries(patentData.map((item) => [item._id, item.adminNotes || ''])));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load patents');
    } finally {
      setRefreshing(false);
    }
  };

  const loadInvestments = async () => {
    try {
      setRefreshing(true);
      const investmentData = await adminService.getInvestments(investmentFilters);
      setInvestments(investmentData);
      setInvestmentNotes(Object.fromEntries(investmentData.map((item) => [item._id, item.notes || ''])));
      setInvestmentReturns(Object.fromEntries(investmentData.map((item) => [item._id, String(item.returns ?? 0)])));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load investments');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUserUpdate = async (targetUser: User, data: { verified?: boolean; isActive?: boolean }) => {
    try {
      setSavingId(targetUser._id);
      const updated = await adminService.updateUser(targetUser._id, data);
      setUsers((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      await refreshOverview();
      toast.success('User updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setSavingId(null);
    }
  };

  const handlePatentUpdate = async (patentId: string, data: Partial<Patent>) => {
    try {
      setSavingId(patentId);
      const updated = await adminService.updatePatent(patentId, {
        moderationStatus: data.moderationStatus as any,
        adminNotes: patentNotes[patentId] ?? data.adminNotes,
        isFeatured: data.isFeatured,
        isPublic: data.isPublic,
        status: data.status as any,
      });
      setPatents((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setPatentNotes((current) => ({ ...current, [updated._id]: updated.adminNotes || '' }));
      await refreshOverview();
      toast.success('Patent updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update patent');
    } finally {
      setSavingId(null);
    }
  };

  const handleInvestmentUpdate = async (investmentId: string, data: { status?: string; returns?: number; notes?: string; nextMilestone?: string }) => {
    try {
      setSavingId(investmentId);
      const updated = await adminService.updateInvestment(investmentId, {
        ...data,
        notes: investmentNotes[investmentId] ?? data.notes,
        returns: data.returns ?? Number(investmentReturns[investmentId] || 0),
      });
      setInvestments((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setInvestmentNotes((current) => ({ ...current, [updated._id]: updated.notes || '' }));
      setInvestmentReturns((current) => ({ ...current, [updated._id]: String(updated.returns ?? 0) }));
      await refreshOverview();
      toast.success('Investment updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update investment');
    } finally {
      setSavingId(null);
    }
  };

  const topSummaryCards = useMemo(() => {
    if (!overview) return [];
    return [
      {
        title: 'Users',
        value: overview.summary.totalUsers,
        description: `${overview.summary.activeUsers} active, ${overview.summary.verifiedUsers} verified`,
        icon: Users,
        tab: 'users' as AdminTab,
        action: 'Manage users',
      },
      {
        title: 'Patent queue',
        value: overview.summary.patentsPendingApproval,
        description: `${overview.summary.approvedPatents} approved, ${overview.summary.rejectedPatents} rejected`,
        icon: FileCheck,
        tab: 'patents' as AdminTab,
        action: 'Review patents',
      },
      {
        title: 'Investments',
        value: overview.summary.totalInvestments,
        description: `${overview.summary.activeInvestments} active, ${overview.summary.pendingInvestments} pending`,
        icon: BriefcaseBusiness,
        tab: 'investments' as AdminTab,
        action: 'Review deals',
      },
      {
        title: 'Capital volume',
        value: formatLkr(Number(overview.summary.investmentVolume || 0)),
        description: 'Total tracked investment amount',
        icon: CheckCircle2,
        tab: 'analytics' as AdminTab,
        action: 'Open analytics',
      },
    ];
  }, [overview]);

  if (loading || pageLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'Admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-12 pt-24">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="mt-1 text-gray-600">Single-admin control center for users, patents, investments, and platform analytics.</p>
          </div>
          <Button onClick={loadInitial} disabled={refreshing}>{refreshing ? 'Refreshing...' : 'Refresh data'}</Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && overview ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {topSummaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.title} className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{card.title}</CardTitle>
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                      <p className="mt-2 text-sm text-gray-600">{card.description}</p>
                      <Button className="mt-4" variant="outline" size="sm" onClick={() => setActiveTab(card.tab)}>
                        {card.action}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Users by role</CardTitle>
                  <CardDescription>Current platform user mix</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {overview.charts.usersByRole.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Patents by moderation</CardTitle>
                  <CardDescription>Approval pipeline health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {overview.charts.patentsByModeration.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="font-medium capitalize text-gray-700">{item.label.replace('_', ' ')}</span>
                      <Badge variant="secondary">{item.value}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle>Recent users</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {overview.recent.users.map((item) => (
                    <div key={item._id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.email}</p>
                        </div>
                        <Badge variant="outline">{item.role}</Badge>
                      </div>
                      <Button className="mt-3" size="sm" variant="outline" onClick={() => setActiveTab('users')}>Open user table</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle>Recent patents</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {overview.recent.patents.map((item) => (
                    <div key={item._id} className="rounded-lg border p-3">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className={patentModerationBadge[item.moderationStatus || 'approved'] || 'bg-gray-100 text-gray-700'}>{(item.moderationStatus || 'approved').replace('_', ' ')}</Badge>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <Button className="mt-3" size="sm" variant="outline" onClick={() => setActiveTab('patents')}>Open review queue</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle>Recent investments</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {overview.recent.investments.map((item) => (
                    <div key={item._id} className="rounded-lg border p-3">
                      <p className="font-semibold text-gray-900">{item.patent?.title || 'Patent investment'}</p>
                      <p className="mt-1 text-sm text-gray-500">{formatLkr(Number(item.amount || 0))}</p>
                      <div className="mt-2">
                        <Badge className={investmentStatusBadge[item.status] || 'bg-gray-100 text-gray-700'}>{item.status}</Badge>
                      </div>
                      <Button className="mt-3" size="sm" variant="outline" onClick={() => setActiveTab('investments')}>Open oversight table</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {activeTab === 'users' ? (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>User management</CardTitle>
              <CardDescription>Search, verify, activate, suspend, and open public user profiles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                <Input placeholder="Search name, email, company" value={userFilters.search} onChange={(e) => setUserFilters((current) => ({ ...current, search: e.target.value }))} />
                <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={userFilters.role} onChange={(e) => setUserFilters((current) => ({ ...current, role: e.target.value }))}>
                  <option value="">All roles</option>
                  <option value="Innovator">Innovator</option>
                  <option value="Investor">Investor</option>
                  <option value="Manufacturer">Manufacturer</option>
                </select>
                <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={userFilters.verified} onChange={(e) => setUserFilters((current) => ({ ...current, verified: e.target.value }))}>
                  <option value="">Any verification</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
                <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={userFilters.isActive} onChange={(e) => setUserFilters((current) => ({ ...current, isActive: e.target.value }))}>
                  <option value="">Any status</option>
                  <option value="true">Active</option>
                  <option value="false">Suspended</option>
                </select>
                <Button onClick={loadUsers} disabled={refreshing}>{refreshing ? 'Loading...' : 'Apply filters'}</Button>
                <Button variant="outline" onClick={() => { setUserFilters({ role: '', search: '', verified: '', isActive: '' }); void adminService.getUsers().then(setUsers); }}>Reset</Button>
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Country</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Verification</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item._id} className="border-t align-top">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-gray-500">{item.email}</p>
                            {item.company ? <p className="text-xs text-gray-500">{item.company}</p> : null}
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="outline">{item.role}</Badge></td>
                        <td className="px-4 py-3 text-gray-600">{item.country || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge className={item.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}>
                            {item.isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={item.verified ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                            {item.verified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/people/${item._id}`}>Open profile</Link>
                            </Button>
                            <Button size="sm" variant="outline" disabled={savingId === item._id} onClick={() => handleUserUpdate(item, { verified: !item.verified })}>
                              {item.verified ? 'Unverify' : 'Verify'}
                            </Button>
                            <Button size="sm" variant="outline" disabled={savingId === item._id} onClick={() => handleUserUpdate(item, { isActive: !item.isActive })}>
                              {item.isActive ? 'Suspend' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === 'patents' ? (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Patent moderation and approval</CardTitle>
              <CardDescription>Review pending patents, add admin notes, and control visibility and feature state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                <Input placeholder="Search title, number, innovator" value={patentFilters.search} onChange={(e) => setPatentFilters((current) => ({ ...current, search: e.target.value }))} />
                <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={patentFilters.moderationStatus} onChange={(e) => setPatentFilters((current) => ({ ...current, moderationStatus: e.target.value }))}>
                  <option value="">All moderation states</option>
                  <option value="pending_review">Pending review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={patentFilters.status} onChange={(e) => setPatentFilters((current) => ({ ...current, status: e.target.value }))}>
                  <option value="">All patent statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Granted">Granted</option>
                  <option value="Expired">Expired</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <Button onClick={loadPatents} disabled={refreshing}>{refreshing ? 'Loading...' : 'Apply filters'}</Button>
                <Button variant="outline" onClick={() => { setPatentFilters({ moderationStatus: '', status: '', search: '' }); void adminService.getPatents().then((data) => { setPatents(data); setPatentNotes(Object.fromEntries(data.map((item) => [item._id, item.adminNotes || '']))); }); }}>Reset</Button>
              </div>

              <div className="space-y-4">
                {patents.map((item) => (
                  <div key={item._id} className="rounded-xl border bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <Badge className={patentModerationBadge[item.moderationStatus || 'approved'] || 'bg-gray-100 text-gray-700 border-gray-200'}>
                            {(item.moderationStatus || 'approved').replace('_', ' ')}
                          </Badge>
                          {item.isFeatured ? <Badge className="bg-purple-100 text-purple-700 border-purple-200">Featured</Badge> : null}
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{item.patentNumber} · {item.category}</p>
                        <p className="text-sm text-gray-600">Innovator: {item.innovatorName}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/patent/${item._id}`}>Preview</Link>
                        </Button>
                        <Button size="sm" disabled={savingId === item._id} onClick={() => handlePatentUpdate(item._id, { moderationStatus: 'approved', isPublic: true, status: item.status === 'Rejected' ? 'Active' : item.status })}>Approve</Button>
                        <Button size="sm" variant="outline" disabled={savingId === item._id} onClick={() => handlePatentUpdate(item._id, { moderationStatus: 'rejected', isPublic: false, status: 'Rejected' })}>Reject</Button>
                        <Button size="sm" variant="outline" disabled={savingId === item._id} onClick={() => handlePatentUpdate(item._id, { isFeatured: !item.isFeatured })}>
                          {item.isFeatured ? 'Unfeature' : 'Feature'}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_200px_200px]">
                      <Textarea
                        placeholder="Admin notes for this patent"
                        value={patentNotes[item._id] ?? ''}
                        onChange={(e) => setPatentNotes((current) => ({ ...current, [item._id]: e.target.value }))}
                      />
                      <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={item.status} onChange={(e) => handlePatentUpdate(item._id, { status: e.target.value as Patent['status'] })}>
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Granted">Granted</option>
                        <option value="Expired">Expired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <Button variant="secondary" disabled={savingId === item._id} onClick={() => handlePatentUpdate(item._id, {})}>Save notes</Button>
                    </div>
                    {item.reviewedAt ? <p className="mt-3 text-xs text-gray-500">Last reviewed: {new Date(item.reviewedAt).toLocaleString()}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === 'investments' ? (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Investment oversight</CardTitle>
              <CardDescription>Track every deal, update status, adjust returns, and jump into the user deal workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <Input placeholder="Search by patent title or participant" value={investmentFilters.search} onChange={(e) => setInvestmentFilters((current) => ({ ...current, search: e.target.value }))} />
                <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={investmentFilters.status} onChange={(e) => setInvestmentFilters((current) => ({ ...current, status: e.target.value }))}>
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button onClick={loadInvestments} disabled={refreshing}>{refreshing ? 'Loading...' : 'Apply filters'}</Button>
                <Button variant="outline" onClick={() => { setInvestmentFilters({ status: '', search: '' }); void adminService.getInvestments().then((data) => { setInvestments(data); setInvestmentNotes(Object.fromEntries(data.map((item) => [item._id, item.notes || '']))); setInvestmentReturns(Object.fromEntries(data.map((item) => [item._id, String(item.returns ?? 0)]))); }); }}>Reset</Button>
              </div>

              <div className="space-y-4">
                {investments.map((item) => (
                  <div key={item._id} className="rounded-xl border bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.patent?.title || 'Patent investment'}</h3>
                          <Badge className={investmentStatusBadge[item.status] || 'bg-gray-100 text-gray-700 border-gray-200'}>{item.status}</Badge>
                          <Badge variant="outline">{item.partnerRole || item.investor?.role || 'Investor'}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Investor: {item.investor?.name} · Innovator: {item.innovator?.name}</p>
                        <p className="text-sm text-gray-600">Amount: {formatLkr(Number(item.amount || 0))} · Equity: {item.equity || 0}%</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <select className="h-10 rounded-md border border-gray-200 px-3 text-sm" value={item.status} onChange={(e) => handleInvestmentUpdate(item._id, { status: e.target.value })}>
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/investments?status=${item.status}`}>Open workspace</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
                      <Textarea
                        placeholder="Admin notes or oversight comments"
                        value={investmentNotes[item._id] ?? ''}
                        onChange={(e) => setInvestmentNotes((current) => ({ ...current, [item._id]: e.target.value }))}
                      />
                      <Input type="number" min="0" placeholder="Returns" value={investmentReturns[item._id] ?? '0'} onChange={(e) => setInvestmentReturns((current) => ({ ...current, [item._id]: e.target.value }))} />
                      <Button variant="secondary" disabled={savingId === item._id} onClick={() => handleInvestmentUpdate(item._id, {})}>Save record</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === 'analytics' && analytics ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Growth snapshot</CardTitle>
                <CardDescription>Recent 6-month trend data for users, patents, and investments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">User growth</h3>
                  <div className="space-y-2">
                    {analytics.growth.users.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <span className="text-gray-700">{item.label}</span>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Patent growth</h3>
                  <div className="space-y-2">
                    {analytics.growth.patents.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <span className="text-gray-700">{item.label}</span>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Reporting tables</CardTitle>
                <CardDescription>Operational breakdowns for the admin account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Top patent categories</h3>
                  <div className="space-y-2">
                    {analytics.charts.patentsByCategory.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <span className="text-gray-700">{item.label}</span>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Investments by status</h3>
                  <div className="space-y-2">
                    {analytics.charts.investmentsByStatus.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <div>
                          <p className="capitalize text-gray-700">{item.label}</p>
                          <p className="text-xs text-gray-500">{formatLkr(Number(item.amount || 0))}</p>
                        </div>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Investment growth</h3>
                  <div className="space-y-2">
                    {analytics.growth.investments.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <div>
                          <p className="text-gray-700">{item.label}</p>
                          <p className="text-xs text-gray-500">{formatLkr(Number(item.amount || 0))}</p>
                        </div>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

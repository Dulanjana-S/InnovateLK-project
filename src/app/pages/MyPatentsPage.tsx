import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Eye, FileText, Heart, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { patentService, type Patent } from '../services';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardPathForRole } from '../utils/roleRouting';
import { toast } from 'sonner';

export function MyPatentsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Innovator') {
      toast.error('Only innovators can manage patents');
      navigate(getDashboardPathForRole(user.role));
    }
  }, [authLoading, navigate, user?.id, user?.role]);

  const loadPatents = async () => {
    try {
      setLoading(true);
      setPatents(await patentService.getMyPatents());
    } catch (error: any) {
      toast.error(error.message || 'Failed to load patents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Innovator') {
      void loadPatents();
    }
  }, [user?.role]);

  const totals = {
    patents: patents.length,
    views: patents.reduce((sum, patent) => sum + (patent.views || 0), 0),
    interest: patents.reduce((sum, patent) => sum + (patent.interested || 0), 0),
  };

  const handleRequestResponse = async (
    patentId: string,
    requestUserId: string,
    status: 'approved' | 'declined',
  ) => {
    try {
      setSavingKey(`${patentId}:${requestUserId}:${status}`);
      const updated = await patentService.respondToDetailRequest(patentId, requestUserId, status);
      setPatents((current) => current.map((item) => (item._id === patentId ? updated : item)));
      toast.success(status === 'approved' ? 'Request approved' : 'Request declined');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update request');
    } finally {
      setSavingKey(null);
    }
  };

  if (authLoading) return <LoadingSpinner />;
  if (!user || user.role !== 'Innovator') return null;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4">
        <motion.div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-3xl font-bold mb-2">My Patents</h1>
            <p className="text-gray-600">Manage your patent portfolio, moderation status, and full-details requests.</p>
          </div>
          <Button asChild><Link to="/upload-patent"><Plus className="mr-2 h-4 w-4" />Upload Patent</Link></Button>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card><CardHeader><CardTitle>Total Patents</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.patents}</CardContent></Card>
          <Card><CardHeader><CardTitle>Total Views</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.views}</CardContent></Card>
          <Card><CardHeader><CardTitle>Interested Parties</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{totals.interest}</CardContent></Card>
        </div>

        <div className="space-y-4">
          {patents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No patents yet</h3>
                <p className="text-gray-600 mb-4">Create your first patent listing to start attracting investors and manufacturers.</p>
                <Button asChild><Link to="/upload-patent">Create Patent</Link></Button>
              </CardContent>
            </Card>
          ) : patents.map((patent) => (
            <motion.div key={patent._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="pt-6 space-y-5">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="h-36 w-full md:w-48 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden flex items-center justify-center">
                      {patent.image ? <img src={patent.image} alt={patent.title} className="h-full w-full object-cover" /> : <FileText className="h-10 w-10 text-white/70" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge>{patent.category}</Badge>
                        <Badge variant="outline">{patent.status}</Badge>
                        {patent.moderationStatus ? (
                          <Badge className={patent.moderationStatus === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : patent.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}>
                            {patent.moderationStatus === 'pending_review' ? 'Awaiting admin review' : patent.moderationStatus}
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{patent.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{patent.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{patent.views || 0} views</span>
                        <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{patent.interested || 0} interested</span>
                        <span className="flex items-center gap-1"><FileText className="h-4 w-4" />{patent.detailRequests?.length || 0} detail requests</span>
                      </div>
                      {patent.adminNotes ? <p className="mb-3 text-sm text-gray-600"><span className="font-medium">Admin note:</span> {patent.adminNotes}</p> : null}
                      <Button asChild variant="outline"><Link to={`/patent/${patent._id}`}>View Patent</Link></Button>
                    </div>
                  </div>

                  {(patent.detailRequests?.length || 0) > 0 ? (
                    <div className="rounded-xl border bg-gray-50 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-gray-900">Full details requests</h4>
                        <Badge variant="secondary">{patent.detailRequests?.length || 0}</Badge>
                      </div>
                      <div className="space-y-3">
                        {patent.detailRequests?.map((request) => {
                          const requestId = request.user?._id;
                          const status = request.status || 'pending';
                          return (
                            <div key={`${patent._id}:${requestId}`} className="rounded-lg border bg-white p-4">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{request.user?.name}</p>
                                  <p className="text-sm text-gray-500">{request.user?.role} • {request.user?.email}</p>
                                  {request.note ? <p className="mt-2 text-sm text-gray-700">{request.note}</p> : null}
                                  {request.responseNote ? <p className="mt-2 text-sm text-gray-600"><span className="font-medium">Response note:</span> {request.responseNote}</p> : null}
                                  <p className="mt-2 text-xs text-gray-400">Requested {new Date(request.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="space-y-2 md:min-w-[210px]">
                                  <Badge className={status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : status === 'declined' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}>
                                    {status}
                                  </Badge>
                                  {status === 'pending' ? (
                                    <div className="flex gap-2">
                                      <Button size="sm" className="flex-1" onClick={() => requestId && void handleRequestResponse(patent._id, requestId, 'approved')} disabled={savingKey === `${patent._id}:${requestId}:approved` || savingKey === `${patent._id}:${requestId}:declined`}>
                                        {savingKey === `${patent._id}:${requestId}:approved` ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                                      </Button>
                                      <Button size="sm" variant="outline" className="flex-1" onClick={() => requestId && void handleRequestResponse(patent._id, requestId, 'declined')} disabled={savingKey === `${patent._id}:${requestId}:approved` || savingKey === `${patent._id}:${requestId}:declined`}>
                                        {savingKey === `${patent._id}:${requestId}:declined` ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Decline'}
                                      </Button>
                                    </div>
                                  ) : request.respondedAt ? <p className="text-xs text-gray-500">Responded {new Date(request.respondedAt).toLocaleString()}</p> : null}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

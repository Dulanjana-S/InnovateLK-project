import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Eye,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { patentService, type Patent, chatService, userService } from '../services';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function PatentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [patent, setPatent] = useState<Patent | null>(null);
  const [relatedPatents, setRelatedPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interestLoading, setInterestLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      void loadPatent(id);
    }
  }, [id, user?.id]);

  const loadPatent = async (patentId: string) => {
    setLoading(true);
    setError('');
    try {
      const [data, favoritePatents] = await Promise.all([
        patentService.getPatentById(patentId),
        isAuthenticated ? userService.getFavoritePatents().catch(() => []) : Promise.resolve([]),
      ]);
      setPatent(data);
      setFavoriteIds((favoritePatents || []).map((item) => item._id));
      if (data.category) {
        const related = await patentService.getPatents({ category: data.category });
        setRelatedPatents(related.filter((p) => p._id !== patentId).slice(0, 2));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patent');
      toast.error('Failed to load patent details');
    } finally {
      setLoading(false);
    }
  };

  const requestEntry = useMemo(
    () => patent?.detailRequests?.find((entry) => (entry?.user?._id || '') === user?.id),
    [patent?.detailRequests, user?.id],
  );

  const hasExpressedInterest = !!patent?.interestedUsers?.some((entry: any) => entry?._id === user?.id);
  const isOwnPatent = !!patent && ((patent.innovator?._id || '') === user?.id);
  const canEngage = isAuthenticated && !isOwnPatent && (user?.role === 'Investor' || user?.role === 'Manufacturer');
  const isFavorite = !!patent && favoriteIds.includes(patent._id);

  const handleInterest = async () => {
    if (!patent || !canEngage) return;
    try {
      setInterestLoading(true);
      const updatedPatent = hasExpressedInterest
        ? await patentService.removeInterest(patent._id)
        : await patentService.expressInterest(patent._id);
      setPatent(updatedPatent);
      toast.success(hasExpressedInterest ? 'Interest removed.' : 'Interest expressed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update interest');
    } finally {
      setInterestLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!patent || isOwnPatent) return;

    try {
      setFavoriteLoading(true);
      const result = await userService.toggleFavoritePatent(patent._id);
      setFavoriteIds(result.favoritePatentIds);
      toast.success(result.isFavorite ? 'Saved to favorites' : 'Removed from favorites');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };


  const handleOpenConversation = async () => {
    const innovatorId = patent?.innovator?._id;
    if (!innovatorId) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const conversation = await chatService.getOrCreateDirectConversation(innovatorId);
      navigate(`/messages?userId=${conversation.displayParticipant?._id || innovatorId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to open conversation');
    }
  };

  const handleRequestFullDetails = async () => {
    if (!patent || !canEngage || requestEntry) return;
    const note = `Hello ${patent.innovatorName}, I reviewed "${patent.title}" and would like the full details for evaluation.`;
    try {
      setDetailsLoading(true);
      const updatedPatent = await patentService.requestFullDetails(patent._id, note);
      setPatent(updatedPatent);
      const innovatorId = updatedPatent.innovator?._id || patent.innovator?._id;
      if (innovatorId) {
        const conversation = await chatService.getOrCreateDirectConversation(innovatorId);
        try {
          await chatService.sendMessage(conversation._id, note);
        } catch (_messageError) {
          // ignore secondary chat error; request already saved
        }
      }
      toast.success('Full details requested. The innovator has been notified.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to request full details');
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !patent) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Patent Not Found</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button asChild><Link to="/browse">Back to Browse</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <Button variant="ghost" asChild className="mb-0">
            <Link to="/browse"><ArrowLeft className="mr-2 h-4 w-4" />Back to Patents</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600">
                  {patent.image ? (
                    <img src={patent.image} alt={patent.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FileText className="w-24 h-24 text-white/50" /></div>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge>{patent.category}</Badge>
                    {patent.moderationStatus ? <Badge variant="outline">{patent.moderationStatus.replace('_', ' ')}</Badge> : null}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{patent.title}</h1>
                  <p className="text-sm md:text-base text-gray-600">Patent No: {patent.patentNumber}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => void handleToggleFavorite()} disabled={favoriteLoading || isOwnPatent}>
                    {favoriteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {patent.tags.map((tag, idx) => <Badge key={idx} variant="secondary">{tag}</Badge>)}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="innovator">Innovator</TabsTrigger>
                  <TabsTrigger value="investment">Investment</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{patent.description}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Market Opportunity</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{patent.commercialization?.marketSize || 'Commercialization analysis can be shared directly with interested investors and manufacturers.'}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>Patent Information</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><p className="text-sm text-gray-500">Patent Number</p><p className="font-medium">{patent.patentNumber}</p></div>
                        <div><p className="text-sm text-gray-500">Filing Date</p><p className="font-medium">{new Date(patent.filingDate).toLocaleDateString()}</p></div>
                        <div><p className="text-sm text-gray-500">Status</p><Badge variant={patent.status === 'Granted' ? 'default' : 'secondary'}>{patent.status}</Badge></div>
                        <div><p className="text-sm text-gray-500">Category</p><p className="font-medium">{patent.category}</p></div>
                      </div>
                      {patent.technicalDetails?.abstract ? (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Abstract</p>
                            <p className="text-gray-700">{patent.technicalDetails.abstract}</p>
                          </div>
                        </>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Technical Readiness</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start"><CheckCircle2 className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" /><span>Ready for investor or manufacturer review</span></li>
                        <li className="flex items-start"><CheckCircle2 className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" /><span>Commercialization route can be discussed directly with the innovator</span></li>
                        <li className="flex items-start"><CheckCircle2 className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" /><span>Structured engagement and detail-request workflow available</span></li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="innovator" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>About the Innovator</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">{patent.innovatorName.charAt(0)}</div>
                        <div>
                          <h3 className="font-semibold text-base md:text-lg">{patent.innovatorName}</h3>
                          <p className="text-sm md:text-base text-gray-600 flex items-center"><MapPin className="w-4 h-4 mr-1" />{patent.innovatorCountry}</p>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-gray-700">{patent.innovator?.bio || `Experienced innovator working in ${patent.category.toLowerCase()} with a focus on commercialization and practical industry adoption.`}</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button variant="outline" asChild><Link to={`/people/${patent.innovator?._id || ''}`}>View innovator profile</Link></Button>
                        <Button asChild><Link to={isAuthenticated ? `/messages?userId=${patent.innovator?._id || ''}` : '/login'}>Message innovator</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="investment" className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>Investment Opportunity</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><p className="text-sm text-gray-500">Funding Required</p><p className="text-2xl font-bold text-blue-600">{patent.fundingRequired}</p></div>
                        <div><p className="text-sm text-gray-500">Investment Stage</p><p className="text-xl font-semibold">{patent.investmentStage}</p></div>
                      </div>
                      {requestEntry ? (
                        <div className={`rounded-lg border p-3 text-sm ${requestEntry.status === 'approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : requestEntry.status === 'declined' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                          <p>
                            Full details request status: <span className="font-semibold capitalize">{requestEntry.status || 'pending'}</span>
                          </p>
                          {requestEntry.responseNote ? <p className="mt-2">{requestEntry.responseNote}</p> : null}
                          {requestEntry.status === 'approved' ? (
                            <Button size="sm" className="mt-3" onClick={() => void handleOpenConversation()}>
                              Continue in Messages
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
              <Card className="lg:sticky lg:top-24">
                <CardContent className="pt-6 space-y-3 md:space-y-4">
                  {canEngage ? (
                    <Button className="w-full" size="lg" onClick={() => void handleInterest()} disabled={interestLoading}>
                      {interestLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                      {hasExpressedInterest ? 'Remove Interest' : 'Express Interest'}
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {isOwnPatent ? 'Your patent' : isAuthenticated ? 'Investor or manufacturer only' : 'Login to engage'}
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => void handleOpenConversation()}>
                    Contact Innovator
                  </Button>
                  {requestEntry?.status === 'approved' ? (
                    <Button variant="outline" className="w-full" onClick={() => void handleOpenConversation()}>
                      Full Details Approved
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => void handleRequestFullDetails()} disabled={!canEngage || detailsLoading || !!requestEntry}>
                      {detailsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {requestEntry ? `Request ${requestEntry.status || 'pending'}` : 'Request Full Details'}
                    </Button>
                  )}
                  {canEngage ? (
                    <Button variant="secondary" className="w-full" asChild>
                      <Link to={`/investments?patentId=${patent._id}`}>
                        {user?.role === 'Manufacturer' ? 'Start Manufacturing Proposal' : 'Start Investment Proposal'}
                      </Link>
                    </Button>
                  ) : null}
                  {canEngage ? <p className="text-xs text-gray-500">Expressing interest helps the innovator prioritize outreach. Requesting full details creates a tracked review request. Use the proposal button when you are ready to send concrete commercial terms.</p> : null}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
              <Card>
                <CardHeader><CardTitle className="text-lg">Engagement</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between"><div className="flex items-center text-gray-600"><Eye className="w-4 h-4 mr-2" /><span className="text-sm">Views</span></div><span className="font-semibold">{patent.views || 0}</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center text-gray-600"><Heart className="w-4 h-4 mr-2" /><span className="text-sm">Interested</span></div><span className="font-semibold">{patent.interested || 0}</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center text-gray-600"><FileText className="w-4 h-4 mr-2" /><span className="text-sm">Detail requests</span></div><span className="font-semibold">{patent.detailRequests?.length || 0}</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center text-gray-600"><TrendingUp className="w-4 h-4 mr-2" /><span className="text-sm">Trending</span></div><Badge variant="secondary">Top 10%</Badge></div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
              <Card>
                <CardHeader><CardTitle className="text-lg">Quick Info</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start"><Calendar className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" /><div><p className="text-gray-500">Filed</p><p className="font-medium">{new Date(patent.filingDate).toLocaleDateString()}</p></div></div>
                  <div className="flex items-start"><MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" /><div><p className="text-gray-500">Location</p><p className="font-medium">{patent.innovatorCountry}</p></div></div>
                  <div className="flex items-start"><DollarSign className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" /><div><p className="text-gray-500">Investment Stage</p><p className="font-medium">{patent.investmentStage}</p></div></div>
                  <div className="flex items-start"><FileText className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" /><div><p className="text-gray-500">Status</p><Badge variant="secondary">{patent.status}</Badge></div></div>
                </CardContent>
              </Card>
            </motion.div>

            {relatedPatents.length > 0 ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Similar Patents</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {relatedPatents.map((similar) => (
                      <Link key={similar._id} to={`/patent/${similar._id}`} className="block hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <p className="font-medium text-sm line-clamp-2 mb-1">{similar.title}</p>
                        <p className="text-xs text-gray-500">{similar.innovatorCountry}</p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, SlidersHorizontal, Eye, Heart, X, Loader2 } from 'lucide-react';
import { categories } from '../data/mockData';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { motion } from 'motion/react';
import { patentService, type Patent, userService } from '../services';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function BrowsePatentsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStage, setSelectedStage] = useState('All Stages');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<string | null>(null);

  useEffect(() => {
    void loadPatents();
  }, [selectedCategory, user?.id]);

  const loadPatents = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (selectedCategory !== 'All Categories') filters.category = selectedCategory;
      const [data, favoritePatents] = await Promise.all([
        patentService.getPatents(filters),
        isAuthenticated ? userService.getFavoritePatents().catch(() => []) : Promise.resolve([]),
      ]);
      setPatents(data);
      setFavoriteIds((favoritePatents || []).map((item) => item._id));
    } catch (err: any) {
      setError(err.message || 'Failed to load patents');
      toast.error('Failed to load patents');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatents = patents.filter((patent) => {
    const matchesSearch = patent.title.toLowerCase().includes(searchQuery.toLowerCase()) || patent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'All Stages' || patent.investmentStage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedStage('All Stages');
  };

  const handleToggleFavorite = async (event: MouseEvent, patent: Patent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if ((patent.innovator?._id || '') === user?.id) {
      toast.error('You cannot favorite your own patent');
      return;
    }
    try {
      setFavoriteLoadingId(patent._id);
      const result = await userService.toggleFavoritePatent(patent._id);
      setFavoriteIds(result.favoritePatentIds);
      toast.success(result.isFavorite ? 'Saved to favorites' : 'Removed from favorites');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorite');
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  const FilterContent = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search patents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Investment Stage</label>
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Stages">All Stages</SelectItem>
            <SelectItem value="Seed">Seed</SelectItem>
            <SelectItem value="Series A">Series A</SelectItem>
            <SelectItem value="Series B">Series B</SelectItem>
            <SelectItem value="Series C">Series C</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" variant="outline" onClick={resetFilters}>Reset Filters</Button>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Patents</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => void loadPatents()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 px-4 py-2 bg-white/20 text-white border-white/30 backdrop-blur-sm"><Search className="w-4 h-4 mr-2" />Discovery Platform</Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Browse Patents</h1>
            <p className="text-base md:text-lg text-blue-100">Discover investment-ready innovations from around the world</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24 border-0 shadow-xl"><CardContent className="pt-6"><div className="flex items-center mb-6"><SlidersHorizontal className="w-5 h-5 mr-2 text-blue-600" /><h3 className="font-bold text-lg">Filters</h3></div><FilterContent /></CardContent></Card>
          </div>

          <div className="lg:col-span-3">
            <div className="lg:hidden mb-6">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild><Button variant="outline" className="w-full"><SlidersHorizontal className="w-4 h-4 mr-2" />Filters</Button></SheetTrigger>
                <SheetContent side="left" className="w-80"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="mt-6"><FilterContent /></div></SheetContent>
              </Sheet>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600"><span className="font-semibold text-gray-900">{filteredPatents.length}</span> patents found</p>
              {(searchQuery || selectedCategory !== 'All Categories' || selectedStage !== 'All Stages') ? (
                <Button variant="ghost" size="sm" onClick={resetFilters}><X className="w-4 h-4 mr-2" />Clear all</Button>
              ) : null}
            </div>

            {filteredPatents.length === 0 ? (
              <Card className="p-12 text-center border-0 shadow-xl"><div className="flex flex-col items-center"><Search className="w-16 h-16 text-gray-300 mb-4" /><h3 className="text-xl font-bold mb-2">No patents found</h3><p className="text-gray-600 mb-4">Try adjusting your filters or search query</p><Button onClick={resetFilters}>Reset Filters</Button></div></Card>
            ) : (
              <div className="grid gap-6">
                {filteredPatents.map((patent) => {
                  const isFavorite = favoriteIds.includes(patent._id);
                  return (
                    <motion.div key={patent._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                      <Link to={`/patent/${patent._id}`}>
                        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group cursor-pointer">
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-72 h-48 md:h-auto bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden flex-shrink-0">
                                {patent.image ? <img src={patent.image} alt={patent.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><Search className="w-16 h-16 text-white/50" /></div>}
                                <div className="absolute top-4 left-4"><Badge className="bg-white/90 text-blue-700 backdrop-blur-sm border-0">{patent.category}</Badge></div>
                                <div className="absolute top-4 right-4">
                                  <Button variant="secondary" size="icon" onClick={(event) => void handleToggleFavorite(event, patent)}>
                                    {favoriteLoadingId === patent._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />}
                                  </Button>
                                </div>
                              </div>

                              <div className="flex-1 p-6">
                                <div className="flex items-start justify-between mb-3 gap-4">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{patent.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{patent.patentNumber} • {patent.innovatorCountry}</p>
                                  </div>
                                  <Badge className={`${patent.status === 'Granted' ? 'bg-green-100 text-green-700' : patent.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'} border-0`}>{patent.status}</Badge>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-2">{patent.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">{patent.tags.slice(0, 3).map((tag, idx) => <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>)}</div>
                                <div className="flex items-center justify-between pt-4 border-t">
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center"><Eye className="w-4 h-4 mr-1" />{patent.views || 0}</div>
                                    <div className="flex items-center"><Heart className="w-4 h-4 mr-1" />{patent.interested || 0}</div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">{patent.investmentStage}</Badge>
                                    <p className="text-sm font-semibold text-blue-600">{patent.fundingRequired}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

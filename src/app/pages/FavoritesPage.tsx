import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Heart, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { userService, type Patent } from '../services';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setFavorites(await userService.getFavoritePatents());
      } catch (error: any) {
        toast.error(error.message || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  const handleToggle = async (patentId: string) => {
    try {
      const result = await userService.toggleFavoritePatent(patentId);
      if (!result.isFavorite) {
        setFavorites((current) => current.filter((item) => item._id !== patentId));
      }
      toast.success(result.isFavorite ? 'Saved to favorites' : 'Removed from favorites');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorite');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Sign in to view favorites</h1>
        <Button asChild className="mt-4"><Link to="/login">Go to login</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Favorites</h1>
          <p className="mt-2 text-gray-600">Save promising patents and return to them later.</p>
        </motion.div>

        {loading ? (
          <div className="py-16 text-center text-gray-500"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-500">
              <Heart className="mx-auto mb-4 h-10 w-10 text-gray-300" />
              No favorites yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((patent) => (
              <Card key={patent._id} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{patent.title}</CardTitle>
                      <p className="mt-2 text-sm text-gray-500">{patent.patentNumber}</p>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => void handleToggle(patent._id)}>
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{patent.category}</Badge>
                    <Badge variant="outline">{patent.investmentStage}</Badge>
                  </div>
                  <p className="line-clamp-3 text-sm text-gray-600">{patent.description}</p>
                  <p className="text-sm font-medium text-blue-600">{patent.fundingRequired}</p>
                  <Button asChild className="w-full"><Link to={`/patent/${patent._id}`}>Open patent</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

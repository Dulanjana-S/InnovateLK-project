import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Building2, Globe, Link2, MessageSquare, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { chatService, userService, User } from "../services";
import { toast } from "sonner";

export function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id || !user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await userService.getUserById(id);
        setProfile(result);
      } catch (error: any) {
        toast.error(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, user?.id]);

  const roleHighlights = useMemo(() => {
    if (!profile) return [] as string[];

    if (profile.role === "Innovator") {
      return [
        ...(profile.profile?.industries || []),
        ...(profile.profile?.expertise || []),
      ].slice(0, 6);
    }

    if (profile.role === "Investor") {
      return [
        ...(profile.profile?.industries || []),
        profile.profile?.investmentRange || "",
      ].filter(Boolean).slice(0, 6);
    }

    return [
      ...(profile.profile?.industries || []),
      profile.profile?.manufacturingCapacity || "",
      ...(profile.profile?.expertise || []),
    ].filter(Boolean).slice(0, 6);
  }, [profile]);

  const handleMessage = async () => {
    if (!profile) return;
    try {
      await chatService.getOrCreateDirectConversation(profile._id);
      navigate(`/messages?userId=${profile._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to start conversation");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }


  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Sign in to view profiles</h1>
        <Button asChild className="mt-4">
          <Link to="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <Button asChild className="mt-4">
          <Link to="/people">Back to directory</Link>
        </Button>
      </div>
    );
  }

  const isOwnProfile = profile._id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10">
      <div className="container mx-auto px-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/people"><ArrowLeft className="mr-2 h-4 w-4" />Back to directory</Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-3xl font-semibold text-blue-700">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                      <Badge>{profile.role}</Badge>
                      {profile.verified ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge> : null}
                    </div>
                    <p className="mt-2 text-gray-600">{profile.bio || "This user has not added a bio yet."}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                      {profile.company ? <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" />{profile.company}</span> : null}
                      <span className="inline-flex items-center gap-2"><Globe className="h-4 w-4" />{profile.country || "Country not provided"}</span>
                      <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4" />{profile.email}</span>
                    </div>
                  </div>
                </div>

                {!isOwnProfile ? (
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link to="/people">More profiles</Link>
                    </Button>
                    <Button onClick={() => void handleMessage()}>
                      <MessageSquare className="mr-2 h-4 w-4" />Message
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to="/profile-settings">Edit profile</Link>
                  </Button>
                )}
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Public profile details</h2>
                  <div className="space-y-3 text-sm text-gray-600">
                    {profile.profile?.website ? <div className="flex items-center gap-2"><Link2 className="h-4 w-4" />{profile.profile.website}</div> : null}
                    {profile.profile?.linkedin ? <div className="flex items-center gap-2"><Link2 className="h-4 w-4" />{profile.profile.linkedin}</div> : null}
                    {profile.profile?.phone ? <div className="flex items-center gap-2"><UserRound className="h-4 w-4" />{profile.profile.phone}</div> : null}
                  </div>
                </div>
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Specialization</h2>
                  <div className="flex flex-wrap gap-2">
                    {roleHighlights.length > 0 ? roleHighlights.map((item) => (
                      <Badge key={item} variant="outline">{item}</Badge>
                    )) : <p className="text-sm text-gray-500">No specialization details added yet.</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Role summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                {profile.role === "Innovator" ? (
                  <>
                    <p>Innovators publish patent opportunities, connect with investors, and collaborate with manufacturers.</p>
                    <p>This profile can be contacted directly to discuss inventions, commercialization, and partnership opportunities.</p>
                  </>
                ) : null}
                {profile.role === "Investor" ? (
                  <>
                    <p>Investors review patents, evaluate founders, and open discussions for funding and commercialization.</p>
                    {profile.profile?.investmentRange ? <p><span className="font-medium text-gray-900">Investment range:</span> {profile.profile.investmentRange}</p> : null}
                  </>
                ) : null}
                {profile.role === "Manufacturer" ? (
                  <>
                    <p>Manufacturers help convert validated ideas into real products and production partnerships.</p>
                    {profile.profile?.manufacturingCapacity ? <p><span className="font-medium text-gray-900">Manufacturing capacity:</span> {profile.profile.manufacturingCapacity}</p> : null}
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>How to connect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>Open a direct chat to keep a single conversation thread per user. The same profile will always reuse the same conversation.</p>
                {!isOwnProfile ? (
                  <Button className="w-full" onClick={() => void handleMessage()}>
                    <MessageSquare className="mr-2 h-4 w-4" />Start direct conversation
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

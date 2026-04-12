import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Building2, Globe, MessageSquare, Search, UserRound, Users } from "lucide-react";
import { userService, chatService, User } from "../services";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { LoadingSpinner } from "../components/LoadingSpinner";

const roleOptions = ["All", "Innovator", "Investor", "Manufacturer"] as const;

export function PeopleDirectoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [people, setPeople] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<(typeof roleOptions)[number]>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await userService.getUsers(role === "All" ? undefined : role);
        setPeople(result.filter((person) => person._id !== user?.id));
      } catch (error: any) {
        toast.error(error.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [role, user?.id]);

  const filteredPeople = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((person) => {
      const haystack = [
        person.name,
        person.email,
        person.company || "",
        person.country || "",
        ...(person.profile?.industries || []),
        ...(person.profile?.expertise || []),
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [people, search]);

  const startConversation = async (personId: string) => {
    try {
      await chatService.getOrCreateDirectConversation(personId);
      navigate(`/messages?userId=${personId}`);
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
        <h1 className="text-2xl font-bold text-gray-900">Sign in to browse profiles</h1>
        <p className="mt-2 text-gray-600">Directory access is available to registered innovators, investors, and manufacturers.</p>
        <Button asChild className="mt-4">
          <Link to="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Users className="mr-2 h-4 w-4" />
            People directory
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">Find innovators, investors, and manufacturers</h1>
          <p className="mt-2 max-w-3xl text-gray-600">
           Where Expertise Meets Opportunity—Directly.
          </p>
        </motion.div>

        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, company, country, industry, or expertise" className="pl-10" />
            </div>
            <Select value={role} onValueChange={(value) => setRole(value as (typeof roleOptions)[number])}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="mb-4 text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredPeople.length}</span> profiles
        </div>

        {filteredPeople.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No profiles matched your search.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPeople.map((person) => (
              <Card key={person._id} className="overflow-hidden border-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="border-b bg-white">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-lg font-semibold text-blue-700">
                      {person.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-xl">{person.name}</CardTitle>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="secondary">{person.role}</Badge>
                        {person.verified ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge> : null}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <p className="line-clamp-3 text-sm leading-6 text-gray-600">{person.bio || "This user has not added a bio yet."}</p>

                  <div className="space-y-2 text-sm text-gray-600">
                    {person.company ? (
                      <div className="flex items-center gap-2"><Building2 className="h-4 w-4" />{person.company}</div>
                    ) : null}
                    <div className="flex items-center gap-2"><Globe className="h-4 w-4" />{person.country || "Country not set"}</div>
                    <div className="flex items-center gap-2"><UserRound className="h-4 w-4" />{person.email}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(person.profile?.industries || []).slice(0, 3).map((industry) => (
                      <Badge key={industry} variant="outline">{industry}</Badge>
                    ))}
                    {(person.profile?.expertise || []).slice(0, 2).map((item) => (
                      <Badge key={item} variant="outline">{item}</Badge>
                    ))}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" asChild>
                      <Link to={`/people/${person._id}`}>View profile</Link>
                    </Button>
                    <Button onClick={() => void startConversation(person._id)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

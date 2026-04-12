import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, FileText, Plus, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { fileService, patentService } from "../services";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardPathForRole } from "../utils/roleRouting";
import { toast } from "sonner";
import { LoadingSpinner } from "../components/LoadingSpinner";

const categories = [
  "Biotechnology",
  "Renewable Energy",
  "Software",
  "Hardware & Electronics",
  "Mechanical Engineering",
  "Medical Devices",
  "Artificial Intelligence",
  "Agriculture",
];

export function UploadPatentPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Innovator') {
      toast.error('Only innovators can submit patents');
      navigate(getDashboardPathForRole(user.role));
    }
  }, [authLoading, navigate, user?.id, user?.role]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    patentNumber: "",
    filingDate: "",
    country: user?.country || "Sri Lanka",
    description: "",
    fundingRequired: "",
    investmentStage: "Seed",
    image: "",
  });

  const steps = useMemo(
    () => [
      { number: 1, title: "Basic Info", icon: FileText },
      { number: 2, title: "Details", icon: FileText },
      { number: 3, title: "Media", icon: Upload },
      { number: 4, title: "Review", icon: CheckCircle2 },
    ],
    [],
  );

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setTags((prev) => [...prev, value]);
    setTagInput("");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login as an innovator first");
      return;
    }

    if (!formData.title || !formData.category || !formData.patentNumber || !formData.filingDate || !formData.description || !formData.fundingRequired) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = formData.image;

      if (selectedFile) {
        setUploadingFile(true);
        const uploaded = await fileService.uploadFile(selectedFile);
        imageUrl = uploaded.url;
      }

      const patent = await patentService.createPatent({
        title: formData.title,
        patentNumber: formData.patentNumber,
        category: formData.category,
        description: formData.description,
        innovatorName: user.name,
        innovatorCountry: formData.country,
        filingDate: formData.filingDate,
        status: "Pending",
        fundingRequired: formData.fundingRequired,
        investmentStage: formData.investmentStage,
        image: imageUrl,
        tags,
        isPublic: false,
      });

      toast.success("Patent submitted. It is now waiting for admin review and approval.");
      navigate(`/patent/${patent._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit patent");
    } finally {
      setSubmitting(false);
      setUploadingFile(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'Innovator') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div className="mb-6 sm:mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/innovator-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Upload Your Patent</h1>
          <p className="text-gray-600">Share your innovation with investors and manufacturers worldwide</p>
        </motion.div>

        <div className="mb-8 flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${currentStep >= step.number ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {currentStep > step.number ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <span className="text-xs sm:text-sm mt-2 font-medium hidden sm:block">{step.title}</span>
              </div>
              {index < steps.length - 1 && <div className={`h-1 flex-1 mx-2 ${currentStep > step.number ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about the patent basics"}
              {currentStep === 2 && "Add commercial and technical details"}
              {currentStep === 3 && "Optional image and tags"}
              {currentStep === 4 && "Review before you publish"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Patent Title *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g., Low-Cost Solar Water Purification System" />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patent Number *</Label>
                    <Input value={formData.patentNumber} onChange={(e) => setFormData((prev) => ({ ...prev, patentNumber: e.target.value }))} placeholder="LK/P/2024/001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Filing Date *</Label>
                    <Input type="date" value={formData.filingDate} onChange={(e) => setFormData((prev) => ({ ...prev, filingDate: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Patent Jurisdiction *</Label>
                  <Input value={formData.country} onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))} />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} rows={7} placeholder="Describe the innovation, the problem it solves, and why it matters." />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Funding Required *</Label>
                    <Input value={formData.fundingRequired} onChange={(e) => setFormData((prev) => ({ ...prev, fundingRequired: e.target.value }))} placeholder="LKR 500,000 - LKR 1,000,000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Investment Stage *</Label>
                    <Select value={formData.investmentStage} onValueChange={(value) => setFormData((prev) => ({ ...prev, investmentStage: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Seed", "Series A", "Series B", "Series C"].map((stage) => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Upload Cover Image or Supporting File</Label>
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.txt"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {selectedFile && <p className="text-sm text-gray-500">Selected: {selectedFile.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Or use a Cover Image URL</Label>
                  <Input value={formData.image} onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))} placeholder="https://example.com/patent-image.jpg" />
                </div>
                <div className="space-y-2">
                  <Label>Add Tags</Label>
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="AI, solar, medical, IoT..." onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }} />
                    <Button type="button" variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} className="gap-1">{tag}<button onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}><X className="h-3 w-3" /></button></Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
                <p><span className="font-semibold">Title:</span> {formData.title}</p>
                <p><span className="font-semibold">Category:</span> {formData.category}</p>
                <p><span className="font-semibold">Patent Number:</span> {formData.patentNumber}</p>
                <p><span className="font-semibold">Jurisdiction:</span> {formData.country}</p>
                <p><span className="font-semibold">Funding Required:</span> {formData.fundingRequired}</p>
                <p><span className="font-semibold">Investment Stage:</span> {formData.investmentStage}</p>
                <p><span className="font-semibold">Tags:</span> {tags.join(", ") || "None"}</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.description}</p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))} disabled={currentStep === 1 || submitting}>
                Previous
              </Button>
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep((prev) => prev + 1)}>Next</Button>
              ) : (
                <Button onClick={() => void handleSubmit()} disabled={submitting}>
                  {submitting || uploadingFile ? "Submitting..." : "Submit Patent"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

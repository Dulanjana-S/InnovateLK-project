import { useState, useEffect } from "react";
import { patentService, Patent } from "../services";
import { toast } from "sonner";

interface UsePatentsOptions {
  userId?: string;
  category?: string;
  autoLoad?: boolean;
}

export function usePatents(options: UsePatentsOptions = {}) {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (options.autoLoad !== false) {
      void loadPatents();
    }
  }, [options.userId, options.category, options.autoLoad]);

  const loadPatents = async () => {
    setLoading(true);
    setError("");

    try {
      const data = options.userId
        ? await patentService.getMyPatents()
        : await patentService.getPatents(
            options.category ? { category: options.category } : undefined,
          );

      setPatents(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || "Failed to load patents";
      setError(errorMsg);
      toast.error(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createPatent = async (patentData: any) => {
    const newPatent = await patentService.createPatent(patentData);
    setPatents((prev) => [newPatent, ...prev]);
    toast.success("Patent created successfully!");
    return newPatent;
  };

  const updatePatent = async (id: string, updates: any) => {
    const updated = await patentService.updatePatent(id, updates);
    setPatents((prev) => prev.map((p) => (p._id === id ? updated : p)));
    toast.success("Patent updated successfully!");
    return updated;
  };

  const deletePatent = async (id: string) => {
    await patentService.deletePatent(id);
    setPatents((prev) => prev.filter((p) => p._id !== id));
    toast.success("Patent deleted successfully!");
  };

  return {
    patents,
    loading,
    error,
    loadPatents,
    createPatent,
    updatePatent,
    deletePatent,
  };
}

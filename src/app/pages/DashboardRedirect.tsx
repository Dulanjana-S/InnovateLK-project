import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getDashboardPathForRole } from "../utils/roleRouting";

export function DashboardRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else {
        const path = getDashboardPathForRole(user.role);
        navigate(path === "/login" ? "/" : path);
      }
    }
  }, [user, loading, navigate]);

  return <LoadingSpinner />;
}

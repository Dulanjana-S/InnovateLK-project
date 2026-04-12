import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function DashboardRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else {
        switch (user.role) {
          case "Innovator":
            navigate("/innovator-dashboard");
            break;
          case "Investor":
            navigate("/investor-dashboard");
            break;
          case "Manufacturer":
            navigate("/manufacturer-dashboard");
            break;
          case "Admin":
            navigate("/admin");
            break;
          default:
            navigate("/");
        }
      }
    }
  }, [user, loading, navigate]);

  return <LoadingSpinner />;
}

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ wait for redux-persist hydration
    if (loading) return;

    if (!user || user.role !== "recruiter") {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  // ✅ block render until auth resolved
  if (loading) {
    return <p>Please wait...</p>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

const OauthSuccessPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);
    api.get("/auth/me").then((res) => {
      setUser(res.data.user);
      navigate("/user");
    }).catch(() => navigate("/login"));
  }, [navigate, params, setUser]);

  return <main className="container">Signing you in...</main>;
};

export default OauthSuccessPage;

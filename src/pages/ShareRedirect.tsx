import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { videoService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const ShareRedirect = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"resolving" | "redirecting" | "error">("resolving");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!shareToken) {
      setErrorMsg("Lien invalide");
      setStatus("error");
      return;
    }

    const resolveAndRedirect = async () => {
      try {
        const response = await videoService.resolveShareLink(shareToken);
        const { video_id } = response.data;

        if (isAuthenticated && user) {
          await videoService.claimShare(video_id);
          navigate("/dashboard", { replace: true });
        } else {
          localStorage.setItem("pending_share_token", shareToken);
          navigate("/auth", { replace: true });
        }
      } catch (error: any) {
        const msg = error.response?.data?.error || "Ce lien de partage est invalide ou a expiré.";
        setErrorMsg(msg);
        setStatus("error");
      }
    };

    resolveAndRedirect();
  }, [shareToken, isAuthenticated, user, navigate]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-destructive text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold">Lien invalide</h1>
          <p className="text-muted-foreground">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Récupération de la vidéo...</p>
      </div>
    </div>
  );
};

export default ShareRedirect;

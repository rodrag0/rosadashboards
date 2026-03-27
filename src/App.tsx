import { useEffect, useState } from "react";
import MatchExperience from "./match-demo/MatchExperience";
import PostMatchDashboard from "./PostMatchDashboard";

function getPathname() {
  const normalized = window.location.pathname.replace(/\/+$/, "");
  return normalized || "/";
}

export default function App() {
  const [pathname, setPathname] = useState(getPathname);

  useEffect(() => {
    const handlePopState = () => setPathname(getPathname());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (pathname.startsWith("/match-demo")) {
    return <MatchExperience />;
  }

  return <PostMatchDashboard />;
}

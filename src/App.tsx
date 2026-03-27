import { useEffect, useMemo, useState } from "react";
import type { Language, Theme } from "./appTypes";
import MatchExperience from "./match-demo/MatchExperience";
import PostMatchDashboard from "./PostMatchDashboard";

const LANGUAGE_KEY = "rosa-dashboard-language";
const THEME_KEY = "rosa-dashboard-theme";

function getPathname() {
  const normalized = window.location.pathname.replace(/\/+$/, "");
  return normalized || "/";
}

function getStoredLanguage(): Language {
  const value = window.localStorage.getItem(LANGUAGE_KEY);
  return value === "es" || value === "de" ? value : "en";
}

function getStoredTheme(): Theme {
  const value = window.localStorage.getItem(THEME_KEY);
  return value === "light" ? "light" : "dark";
}

export default function App() {
  const [pathname, setPathname] = useState(getPathname);
  const [language, setLanguage] = useState<Language>(getStoredLanguage);
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    const handlePopState = () => setPathname(getPathname());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
    window.localStorage.setItem(THEME_KEY, theme);
    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [theme, language]);

  const sharedProps = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
    }),
    [language, theme],
  );

  if (pathname.startsWith("/match-demo")) {
    return <MatchExperience {...sharedProps} />;
  }

  return <PostMatchDashboard {...sharedProps} />;
}

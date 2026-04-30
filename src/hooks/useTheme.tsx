import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface ThemeState {
  bgColor: string;
  buttonColor: string;
  emoji: string;
}

interface ThemeContextType extends ThemeState {
  setBgColor: (color: string) => void;
  setButtonColor: (color: string) => void;
  setEmoji: (emoji: string) => void;
}

const STORAGE_KEY = "flower_shot_theme";

const defaultTheme: ThemeState = {
  bgColor: "#FFF44F",
  buttonColor: "#FF9CAD",
  emoji: "🌻",
};

function loadTheme(): ThemeState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultTheme, ...JSON.parse(saved) };
  } catch {}
  return defaultTheme;
}

function saveTheme(theme: ThemeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

const ThemeContext = createContext<ThemeContextType>({
  ...defaultTheme,
  setBgColor: () => {},
  setButtonColor: () => {},
  setEmoji: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(loadTheme);

  useEffect(() => {
    document.body.style.backgroundColor = theme.bgColor;
  }, [theme.bgColor]);

  const setBgColor = useCallback((color: string) => {
    setTheme((prev) => {
      const next = { ...prev, bgColor: color };
      saveTheme(next);
      return next;
    });
  }, []);

  const setButtonColor = useCallback((color: string) => {
    setTheme((prev) => {
      const next = { ...prev, buttonColor: color };
      saveTheme(next);
      return next;
    });
  }, []);

  const setEmoji = useCallback((emoji: string) => {
    setTheme((prev) => {
      const next = { ...prev, emoji };
      saveTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ ...theme, setBgColor, setButtonColor, setEmoji }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

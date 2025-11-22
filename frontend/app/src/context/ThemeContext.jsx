// context/ThemeContext.js
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// Helper function to safely access localStorage
function getStorageItem(key, defaultValue) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item || defaultValue;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Helper function to safely set localStorage
function setStorageItem(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to save ${key} from localStorage:`, error);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [calendarView, setCalendarView] = useState("Month");
  const [weekStart, setWeekStart] = useState("Monday");
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    emailReminders: false,
    dailySummary: false,
  });

  // Load settings from localStorage on mount (client-side only)
  useEffect(() => {
    setTheme(getStorageItem("theme", "light"));
    setCalendarView(getStorageItem("calendarView", "Month"));
    setWeekStart(getStorageItem("weekStart", "Monday"));

    const storedNotifications = getStorageItem("notifications", null);
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (error) {
        console.warn("Failed to parse notifications from localStorage:", error);
      }
    }
  }, []);

  // Save all settings to localStorage when they change
  useEffect(() => {
    setStorageItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setStorageItem("calendarView", calendarView);
  }, [calendarView]);

  useEffect(() => {
    setStorageItem("weekStart", weekStart);
  }, [weekStart]);

  useEffect(() => {
    setStorageItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        calendarView,
        setCalendarView,
        weekStart,
        setWeekStart,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeSettings() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeSettings must be used within a ThemeProvider");
  }
  return context;
}

export interface userDetails {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  name: string | undefined;
  mail: string | undefined;
  token: string | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (bool: boolean) => void;
  setMail: (email: string) => void;
  setName: (name: string) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
}

export interface tabsType {
  icon: string;
  label: string;
  href: string;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export const formatDay = (date: Date = new Date()): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export type HeartRateSample = {
  time: string;
  beatsPerMinute: number;
};

export type SleepSession = {
  startTime: string;
  endTime: string;
  stages: {
    stage: number;
    startTime: string;
    endTime: string;
  }[];
};

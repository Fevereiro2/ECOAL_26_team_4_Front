import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { Compass, Flame, Library, User } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { StatusBar } from "react-native";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { mockLighters, mockUsers } from "./data/mockData";
import { palette } from "./native/palette";
import { AuthScreen } from "./native/screens/AuthScreen";
import { ExploreScreen } from "./native/screens/ExploreScreen";
import { HomeScreen } from "./native/screens/HomeScreen";
import { ProfileScreen } from "./native/screens/ProfileScreen";
import { SplashScreen } from "./native/screens/SplashScreen";
import { VaultScreen } from "./native/screens/VaultScreen";
import type { AppUser, Lighter, Role } from "./native/types";

const Tab = createBottomTabNavigator();

function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const colors = theme === "light" ? palette.light : palette.dark;
  const seedProfiles: Record<string, { email: string; password: string; bio: string; avatar: string }> = {
    u1: {
      email: "visitor@lightit.app",
      password: "Guest#123",
      bio: "Browsing premium lighters as a visitor.",
      avatar: "",
    },
    u2: {
      email: "arthur@lightit.app",
      password: "Arthur#123",
      bio: "Collector of Vintage and Rare Lighters",
      avatar: "",
    },
    u3: {
      email: "admin@lightit.app",
      password: "Admin#123",
      bio: "Overseeing marketplace quality and user collections.",
      avatar: "",
    },
    u4: {
      email: "elena@lightit.app",
      password: "Elena#123",
      bio: "Focused on European artisan and luxury editions.",
      avatar: "",
    },
  };

  const [users, setUsers] = useState<AppUser[]>(() =>
    (mockUsers as { id: string; name: string; role: Role }[]).map((user) => {
      const seeded = seedProfiles[user.id];
      if (seeded) {
        return { ...user, ...seeded };
      }

      return {
        ...user,
        email: `${user.id}@lightit.app`,
        password: "User#1234",
        bio: "Collector of Vintage and Rare Lighters",
        avatar: "",
      };
    }),
  );
  const [lighters, setLighters] = useState<Lighter[]>(() =>
    (mockLighters as Omit<Lighter, "ownerId">[]).map((lighter) => ({
      ...lighter,
      ownerId:
        lighter.id === "1" ? "u2" : lighter.id === "2" ? "u4" : lighter.id === "3" ? "u3" : "u2",
    })),
  );
  const [role, setRole] = useState<Role>("guest");
  const [currentUserId, setCurrentUserId] = useState("u1");
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.bg,
        card: colors.panel,
        text: colors.text,
        border: colors.border,
      },
    }),
    [colors],
  );

  const logout = () => {
    setHasSession(false);
    setRole("guest");
    setCurrentUserId("u1");
  };

  const shared = {
    role,
    setRole,
    colors,
    theme,
    toggleTheme,
    lighters,
    setLighters,
    users,
    setUsers,
    currentUserId,
    setCurrentUserId,
    logout,
  };

  if (isLoading) {
    return <SplashScreen colors={colors} />;
  }

  if (!hasSession) {
    return (
      <>
        <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
        <AuthScreen
          colors={colors}
          users={users}
          onLogin={(email, password) => {
            const found = users.find(
              (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
            );
            if (!found) {
              return "Invalid email or password.";
            }

            setRole(found.role);
            setCurrentUserId(found.id);
            setHasSession(true);
            return null;
          }}
          onRegister={(name, email, password) => {
            const exists = users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase());
            if (exists) {
              return "That email is already registered.";
            }

            const newUser: AppUser = {
              id: `u${Date.now()}`,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
              role: "user",
              avatar: "",
              bio: "Collector of Vintage and Rare Lighters",
            };

            setUsers((prev) => [...prev, newUser]);
            setRole("user");
            setCurrentUserId(newUser.id);
            setHasSession(true);
            return null;
          }}
          onContinueGuest={() => {
            setRole("guest");
            setCurrentUserId("u1");
            setHasSession(true);
          }}
          onQuickLogin={(nextRole) => {
            const target = users.find((user) => user.role === nextRole);
            if (!target) return;
            setRole(nextRole);
            setCurrentUserId(target.id);
            setHasSession(true);
          }}
        />
      </>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.panel,
            borderTopColor: colors.border,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarIcon: ({ color, size }) => {
            const iconMap: Record<string, React.ComponentType<{ color: string; size: number }>> = {
              Home: Flame,
              Explore: Compass,
              Vault: Library,
              Profile: User,
            };
            const Icon = iconMap[route.name] ?? Flame;
            return <Icon color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen name="Home">{() => <HomeScreen shared={shared} />}</Tab.Screen>
        <Tab.Screen name="Explore">{() => <ExploreScreen shared={shared} />}</Tab.Screen>
        <Tab.Screen name="Vault">{() => <VaultScreen shared={shared} />}</Tab.Screen>
        <Tab.Screen name="Profile">{() => <ProfileScreen shared={shared} />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

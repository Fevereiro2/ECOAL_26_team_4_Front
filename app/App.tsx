import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { Compass, Flame, Library, User } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StatusBar } from "react-native";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { palette } from "./native/palette";
import { ExploreScreen } from "./native/screens/ExploreScreen";
import { HomeScreen } from "./native/screens/HomeScreen";
import { ProfileScreen } from "./native/screens/ProfileScreen";
import { VaultScreen } from "./native/screens/VaultScreen";
import type { Role } from "./native/types";

const Tab = createBottomTabNavigator();

function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const colors = theme === "light" ? palette.light : palette.dark;
  const [role, setRole] = useState<Role>("user");

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

  const shared = { role, setRole, colors, theme, toggleTheme };

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

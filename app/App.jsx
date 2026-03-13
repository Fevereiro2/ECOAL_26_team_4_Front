import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { Compass, Flame, Library, Plus, User } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StatusBar, View } from "react-native";
import { API_BASE_URL, apiRequest, unwrapApiData } from "./api/client";
import { mapApiCollectionToAppCollection, mapApiItemToLighter, mapApiUserToAppUser, mapCriterionToAppKey } from "./api/mappers";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { loadLocalAvatarMap } from "./native/avatarStorage";
import { palette } from "./native/palette";
import { AuthScreen } from "./native/screens/AuthScreen";
import { ExploreScreen } from "./native/screens/ExploreScreen";
import { HomeScreen } from "./native/screens/HomeScreen";
import { NewCollectionScreen } from "./native/screens/NewCollectionScreen";
import { ProfileScreen } from "./native/screens/ProfileScreen";
import { SplashScreen } from "./native/screens/SplashScreen";
import { VaultScreen } from "./native/screens/VaultScreen";
const Tab = createBottomTabNavigator();
const guestUser = {
    id: "guest",
    name: "Visitor",
    email: "",
    password: "",
    role: "guest",
    avatar: "",
    avatarUrl: "",
    avatarHash: "",
    bio: "Browse the public collection without an account.",
};

function mergeUsersPreservingSessionFields(nextUsers, previousUsers, sessionUser) {
    const previousById = new Map(previousUsers.map((user) => [user.id, user]));
    const mergedUsers = nextUsers.map((user) => {
        const previous = previousById.get(user.id);
        if (!previous) {
            return user;
        }
        return {
            ...user,
            email: user.email || previous.email || "",
            avatarUrl: user.avatarUrl || previous.avatarUrl || "",
            avatarHash: user.avatarHash || previous.avatarHash || "",
            avatar: user.avatar || previous.avatar || user.avatarUrl || previous.avatarUrl || "",
        };
    });
    if (!sessionUser) {
        return mergedUsers;
    }
    const hasSessionUser = mergedUsers.some((user) => user.id === sessionUser.id);
    if (hasSessionUser) {
        return mergedUsers.map((user) => (user.id === sessionUser.id
            ? {
                ...user,
                email: user.email || sessionUser.email || "",
                avatarUrl: user.avatarUrl || sessionUser.avatarUrl || "",
                avatarHash: user.avatarHash || sessionUser.avatarHash || "",
                avatar: user.avatar || sessionUser.avatar || user.avatarUrl || sessionUser.avatarUrl || "",
            }
            : user));
    }
    return [sessionUser, ...mergedUsers];
}
function mergeItemCriteriaIntoLighters(lighters, itemCriteriaRows) {
    const scoresByItemId = new Map();
    for (const row of itemCriteriaRows) {
        const itemId = String(row.id_item ?? row.item?.id ?? "");
        const criterionId = String(row.id_criteria ?? row.criteria?.id_criteria ?? row.criteria?.id ?? "");
        if (!itemId || !criterionId) {
            continue;
        }
        const nextScores = scoresByItemId.get(itemId) ?? {};
        nextScores[criterionId] = Number(row.value ?? 0);
        scoresByItemId.set(itemId, nextScores);
    }
    return lighters.map((lighter) => {
        const criteriaValues = scoresByItemId.get(lighter.id);
        if (!criteriaValues) {
            return lighter;
        }
        const nextCriteria = { ...lighter.criteria };
        for (const [criterionId, value] of Object.entries(criteriaValues)) {
            const key = mapCriterionToAppKey({ id_criteria: criterionId });
            if (key) {
                nextCriteria[key] = value;
            }
        }
        return {
            ...lighter,
            criteria: nextCriteria,
            criteriaValues: {
                ...lighter.criteriaValues,
                ...criteriaValues,
            },
        };
    });
}
function toLookupCollection(response, mapItem) {
    const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
    return rows.map(mapItem);
}

function AppShell() {
    const { theme, toggleTheme } = useTheme();
    const colors = theme === "light" ? palette.light : palette.dark;
    const [users, setUsers] = useState([]);
    const [collections, setCollections] = useState([]);
    const [lighters, setLighters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [criteriaCatalog, setCriteriaCatalog] = useState([]);
    const [role, setRole] = useState("guest");
    const [currentUserId, setCurrentUserId] = useState(guestUser.id);
    const [isLoading, setIsLoading] = useState(true);
    const [hasSession, setHasSession] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [localAvatarMap, setLocalAvatarMap] = useState({});
    useEffect(() => {
        if (Platform.OS !== "web" || typeof document === "undefined") {
            return;
        }
        const fontLinkId = "lightit-brand-fonts";
        if (document.getElementById(fontLinkId)) {
            return;
        }
        const link = document.createElement("link");
        link.id = fontLinkId;
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Syne:wght@700;800&display=swap";
        document.head.appendChild(link);
    }, []);
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1400);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        let cancelled = false;
        loadLocalAvatarMap()
            .then((storedMap) => {
            if (!cancelled) {
                setLocalAvatarMap(storedMap);
            }
        })
            .catch(() => {
            if (!cancelled) {
                setLocalAvatarMap({});
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);
    const normalizeCollection = useCallback((response) => {
        const payload = unwrapApiData(response);
        if (Array.isArray(payload))
            return payload;
        if (Array.isArray(payload?.data))
            return payload.data;
        if (Array.isArray(payload?.users))
            return payload.users;
        if (Array.isArray(payload?.items))
            return payload.items;
        return [];
    }, []);
    const loadUsers = useCallback(async () => {
        const response = await apiRequest("/users");
        return normalizeCollection(response).map(mapApiUserToAppUser);
    }, [normalizeCollection]);
    const loadItems = useCallback(async () => {
        const response = await apiRequest("/items");
        return normalizeCollection(response).map(mapApiItemToLighter);
    }, [normalizeCollection]);
    const loadCollections = useCallback(async () => {
        const response = await apiRequest("/collections");
        return normalizeCollection(response).map(mapApiCollectionToAppCollection);
    }, [normalizeCollection]);
    const loadCategories = useCallback(async () => {
        const response = await apiRequest("/categories");
        return toLookupCollection(response, (category) => ({
            id: String(category.id),
            title: category.title ?? category.name ?? `Category ${category.id}`,
        }));
    }, []);
    const loadCriteriaCatalog = useCallback(async () => {
        const response = await apiRequest("/criteria");
        return toLookupCollection(response, (criterion) => ({
            id: String(criterion.id_criteria ?? criterion.id),
            name: criterion.name ?? `Criteria ${criterion.id_criteria ?? criterion.id}`,
        }));
    }, []);
    const loadItemCriteria = useCallback(async () => {
        const rows = [];
        let page = 1;
        let lastPage = 1;
        do {
            const response = await apiRequest(`/item-criteria?page=${page}`);
            const nextRows = Array.isArray(response?.data) ? response.data : [];
            rows.push(...nextRows);
            lastPage = Number(response?.meta?.last_page ?? 1);
            page += 1;
        } while (page <= lastPage);
        return rows;
    }, []);
    const refreshAppData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const [nextUsers, nextCollections, nextItems, nextCategories, nextCriteriaCatalog, nextItemCriteria] = await Promise.all([loadUsers(), loadCollections(), loadItems(), loadCategories(), loadCriteriaCatalog(), loadItemCriteria()]);
            setUsers((prev) => {
                const sessionUser = prev.find((user) => user.id === currentUserId);
                return mergeUsersPreservingSessionFields(nextUsers, prev, sessionUser);
            });
            setCollections(nextCollections);
            setCategories(nextCategories);
            setCriteriaCatalog(nextCriteriaCatalog);
            setLighters(mergeItemCriteriaIntoLighters(nextItems, nextItemCriteria));
        }
        finally {
            setIsRefreshing(false);
        }
    }, [currentUserId, loadCategories, loadCollections, loadCriteriaCatalog, loadItemCriteria, loadItems, loadUsers]);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [nextUsers, nextCollections, nextItems, nextCategories, nextCriteriaCatalog, nextItemCriteria] = await Promise.all([loadUsers(), loadCollections(), loadItems(), loadCategories(), loadCriteriaCatalog(), loadItemCriteria()]);
                if (cancelled)
                    return;
                setUsers((prev) => mergeUsersPreservingSessionFields(nextUsers, prev, prev.find((user) => user.id === currentUserId)));
                setCollections(nextCollections);
                setCategories(nextCategories);
                setCriteriaCatalog(nextCriteriaCatalog);
                setLighters(mergeItemCriteriaIntoLighters(nextItems, nextItemCriteria));
            }
            catch (error) {
                if (cancelled)
                    return;
                const message = error instanceof Error ? error.message : "Failed to reach the API.";
                setAuthError(`${message} API base: ${API_BASE_URL}`);
            }
            finally {
                if (!cancelled)
                    setIsBootstrapping(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [currentUserId, loadCategories, loadCollections, loadCriteriaCatalog, loadItemCriteria, loadItems, loadUsers]);
    const navTheme = useMemo(() => ({
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: colors.bg,
            card: colors.panel,
            text: colors.text,
            border: colors.border,
        },
    }), [colors]);
    const logout = useCallback(() => {
        const currentToken = authToken;
        setAuthToken(null);
        setHasSession(false);
        setRole("guest");
        setCurrentUserId(guestUser.id);
        if (currentToken) {
            apiRequest("/logout", {
                method: "POST",
                token: currentToken,
            }).catch(() => null);
        }
    }, [authToken]);
    const handleAuthSuccess = useCallback(async (payload) => {
        const auth = unwrapApiData(payload);
        const mappedUser = mapApiUserToAppUser(auth.user);
        setAuthToken(auth.access_token);
        setRole(mappedUser.role);
        setCurrentUserId(mappedUser.id);
        setHasSession(true);
        setAuthError(null);
        try {
            await refreshAppData();
            setUsers((prev) => mergeUsersPreservingSessionFields(prev, prev, mappedUser));
        }
        catch {
            setUsers((prev) => {
                const withoutCurrent = prev.filter((user) => user.id !== mappedUser.id);
                return [mappedUser, ...withoutCurrent];
            });
        }
    }, [refreshAppData]);
    const shared = {
        role,
        setRole,
        colors,
        theme,
        toggleTheme,
        authToken,
        apiBaseUrl: API_BASE_URL,
        isBootstrapping,
        isRefreshing,
        authError,
        categories,
        criteriaCatalog,
        collections,
        setCollections,
        lighters,
        setLighters,
        users,
        setUsers,
        currentUserId,
        setCurrentUserId,
        localAvatarMap,
        setLocalAvatarMap,
        refreshAppData,
        logout,
    };
    let content;
    if (isLoading) {
        content = <SplashScreen colors={colors}/>;
    }
    else if (!hasSession) {
        content = (<>
        <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"}/>
        <AuthScreen colors={colors} users={users} statusMessage={authError} onLogin={async (email, password) => {
                try {
                    const response = await apiRequest("/login", {
                        method: "POST",
                        body: JSON.stringify({ email: email.trim(), password }),
                    });
                    await handleAuthSuccess(response);
                    return null;
                }
                catch (error) {
                    return error instanceof Error ? error.message : "Unable to log in.";
                }
            }} onRegister={async (name, email, password) => {
                try {
                    const response = await apiRequest("/register", {
                        method: "POST",
                        body: JSON.stringify({
                            name: name.trim(),
                            email: email.trim().toLowerCase(),
                            password,
                            password_confirmation: password,
                        }),
                    });
                    await handleAuthSuccess(response);
                    return null;
                }
                catch (error) {
                    return error instanceof Error ? error.message : "Unable to create the account.";
                }
            }} onContinueGuest={() => {
                setAuthToken(null);
                setRole("guest");
                setCurrentUserId(guestUser.id);
                setHasSession(true);
            }} onQuickLogin={(nextRole) => {
                if (nextRole === "guest") {
                    setAuthToken(null);
                    setRole("guest");
                    setCurrentUserId(guestUser.id);
                    setHasSession(true);
                    return;
                }
                const target = users.find((user) => user.role === nextRole);
                if (!target)
                    return;
                setRole(target.role);
                setCurrentUserId(target.id);
                setHasSession(true);
                setAuthError("Quick login does not create an API token. Write actions may fail until you log in normally.");
            }}/>
      </>);
    }
    else if (isBootstrapping && lighters.length === 0 && users.length === 0) {
        content = (<View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <ActivityIndicator size="large" color={colors.primary}/>
      </View>);
    }
    else {
        content = (<NavigationContainer theme={navTheme}>
        <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"}/>
        <Tab.Navigator screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.panel,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                height: 82,
                paddingBottom: 10,
                paddingTop: 10,
                ...(Platform.OS === "web"
                    ? {
                        backdropFilter: "blur(16px)",
                        boxShadow: colors.shadow,
                    }
                    : {}),
            },
            tabBarActiveTintColor: colors.highlight,
            tabBarInactiveTintColor: colors.muted,
            tabBarLabelStyle: {
                fontWeight: "700",
                letterSpacing: 0.6,
                textTransform: "uppercase",
                fontSize: 10,
            },
            tabBarIcon: ({ color, size }) => {
                const iconMap = {
                    Home: Flame,
                    Explore: Compass,
                    Vault: Library,
                    New: Plus,
                    Profile: User,
                };
                const Icon = iconMap[route.name] ?? Flame;
                return <Icon color={color} size={size}/>;
            },
        })}>
          <Tab.Screen name="Home">{() => <HomeScreen shared={shared}/>}</Tab.Screen>
          <Tab.Screen name="Explore">{() => <ExploreScreen shared={shared}/>}</Tab.Screen>
            <Tab.Screen name="New">{() => <NewCollectionScreen shared={shared}/>}</Tab.Screen>
          <Tab.Screen name="Vault">{() => <VaultScreen shared={shared}/>}</Tab.Screen>
          <Tab.Screen name="Profile">{() => <ProfileScreen shared={shared}/>}</Tab.Screen>
          
        </Tab.Navigator>
      </NavigationContainer>);
    }
    return content;
}
export default function App() {
    return (<ThemeProvider>
      <AppShell />
    </ThemeProvider>);
}

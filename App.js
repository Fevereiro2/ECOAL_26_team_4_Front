import React, { useMemo, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  Switch,
} from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const COLORS = {
  bg: "#0B0F14",
  card: "#141A22",
  card2: "#1B2430",
  text: "#F5F7FA",
  sub: "#9AA4B2",
  accent: "#F59E0B",
  border: "#263241",
  green: "#22C55E",
  red: "#EF4444",
};

const mockLighters = [
  {
    id: "1",
    name: "Zippo Classic",
    description: "A classic refillable petrol lighter with iconic metal body.",
    image:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80",
    isPublic: true,
    categories: ["Flint", "Petrol"],
    criteria: {
      weight: 56,
      flameTemperature: 900,
      ignitionCapacity: 200,
      year: 1932,
    },
  },
  {
    id: "2",
    name: "Bic Mini",
    description: "Compact disposable butane lighter for daily use.",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
    isPublic: true,
    categories: ["Flint", "Butane"],
    criteria: {
      weight: 21,
      flameTemperature: 800,
      ignitionCapacity: 3000,
      year: 1973,
    },
  },
  {
    id: "3",
    name: "Tesla Coil Lighter",
    description: "Rechargeable electric plasma lighter with USB charging.",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    isPublic: false,
    categories: ["Plasma", "Electric"],
    criteria: {
      weight: 68,
      flameTemperature: 1100,
      ignitionCapacity: 500,
      year: 2018,
    },
  },
  {
    id: "4",
    name: "Torch Lighter Pro",
    description: "Powerful jet flame lighter suitable for outdoors.",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    isPublic: true,
    categories: ["Piezoelectric", "Butane"],
    criteria: {
      weight: 84,
      flameTemperature: 1300,
      ignitionCapacity: 1200,
      year: 2016,
    },
  },
  {
    id: "5",
    name: "Vintage Petrol Lighter",
    description: "Decorative lighter inspired by early industrial designs.",
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80",
    isPublic: false,
    categories: ["Flint", "Petrol"],
    criteria: {
      weight: 72,
      flameTemperature: 880,
      ignitionCapacity: 180,
      year: 1954,
    },
  },
  {
    id: "6",
    name: "Arc Pocket Lighter",
    description: "Compact dual-arc electric lighter with wind resistance.",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    isPublic: true,
    categories: ["Plasma", "Electric"],
    criteria: {
      weight: 49,
      flameTemperature: 1050,
      ignitionCapacity: 450,
      year: 2020,
    },
  },
  {
    id: "7",
    name: "Outdoor Storm Lighter",
    description: "Rugged lighter made for camping and windy conditions.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    isPublic: true,
    categories: ["Piezoelectric", "Butane"],
    criteria: {
      weight: 91,
      flameTemperature: 1250,
      ignitionCapacity: 1000,
      year: 2019,
    },
  },
  {
    id: "8",
    name: "Slim Metal Lighter",
    description: "Minimal lighter with brushed metal finish.",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    isPublic: true,
    categories: ["Flint", "Butane"],
    criteria: {
      weight: 33,
      flameTemperature: 820,
      ignitionCapacity: 1500,
      year: 2014,
    },
  },
];

const allCategories = [
  "Flint",
  "Piezoelectric",
  "Plasma",
  "Butane",
  "Petrol",
  "Electric",
];

function AppHeader({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function SearchBar({ value, onChangeText, placeholder = "Search..." }) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={COLORS.sub}
      value={value}
      onChangeText={onChangeText}
      style={styles.search}
    />
  );
}

function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CriteriaRow({ label, value, unit }) {
  return (
    <View style={styles.criteriaRow}>
      <Text style={styles.criteriaLabel}>{label}</Text>
      <Text style={styles.criteriaValue}>
        {value} {unit || ""}
      </Text>
    </View>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LighterCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.isPublic ? "#16351F" : "#3A1B1B" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: item.isPublic ? COLORS.green : COLORS.red },
              ]}
            >
              {item.isPublic ? "Public" : "Private"}
            </Text>
          </View>
        </View>

        <Text numberOfLines={2} style={styles.cardDescription}>
          {item.description}
        </Text>

        <View style={styles.chipRow}>
          {item.categories.map((cat) => (
            <View key={cat} style={styles.miniChip}>
              <Text style={styles.miniChipText}>{cat}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HomeScreen({ navigation }) {
  const featured = mockLighters.slice(0, 4);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Ignition Vault"
          subtitle="A premium lighter collection app"
        />

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Discover and compare iconic lighters</Text>
          <Text style={styles.heroText}>
            Browse categories, explore technical criteria, and manage your personal collection.
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("Collection")}
            >
              <Text style={styles.primaryButtonText}>Open Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("Dashboard")}
            >
              <Text style={styles.secondaryButtonText}>Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Featured lighters</Text>
        {featured.map((item) => (
          <LighterCard
            key={item.id}
            item={item}
            onPress={() => navigation.navigate("Detail", { item })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function CollectionScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const data = useMemo(() => {
    let filtered = [...mockLighters];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) =>
        item.categories.includes(selectedCategory)
      );
    }

    if (search.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "weight") return a.criteria.weight - b.criteria.weight;
      if (sortBy === "year") return a.criteria.year - b.criteria.year;
      if (sortBy === "temperature")
        return a.criteria.flameTemperature - b.criteria.flameTemperature;
      return 0;
    });

    return filtered;
  }, [search, selectedCategory, sortBy]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Collection" subtitle="Browse all lighter objects" />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search lighter by name..."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        {["All", ...allCategories].map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            active={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      >
        {[
          { key: "name", label: "Sort: Name" },
          { key: "weight", label: "Sort: Weight" },
          { key: "year", label: "Sort: Year" },
          { key: "temperature", label: "Sort: Temp" },
        ].map((item) => (
          <CategoryChip
            key={item.key}
            label={item.label}
            active={sortBy === item.key}
            onPress={() => setSortBy(item.key)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LighterCard
            item={item}
            onPress={() => navigation.navigate("Detail", { item })}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

function DetailScreen({ route, navigation }) {
  const { item } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: item.image }} style={styles.detailImage} />
        <View style={styles.detailBody}>
          <View style={styles.rowBetween}>
            <Text style={styles.detailTitle}>{item.name}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: item.isPublic ? "#16351F" : "#3A1B1B" },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: item.isPublic ? COLORS.green : COLORS.red },
                ]}
              >
                {item.isPublic ? "Public" : "Private"}
              </Text>
            </View>
          </View>

          <Text style={styles.detailDescription}>{item.description}</Text>

          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.chipRow}>
            {item.categories.map((cat) => (
              <View key={cat} style={styles.miniChip}>
                <Text style={styles.miniChipText}>{cat}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Criteria</Text>
          <View style={styles.criteriaCard}>
            <CriteriaRow label="Weight" value={item.criteria.weight} unit="g" />
            <CriteriaRow
              label="Flame Temperature"
              value={item.criteria.flameTemperature}
              unit="°C"
            />
            <CriteriaRow
              label="Ignition Capacity"
              value={item.criteria.ignitionCapacity}
              unit=""
            />
            <CriteriaRow label="Year" value={item.criteria.year} unit="" />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Compare", { firstItem: item })}
          >
            <Text style={styles.primaryButtonText}>Compare this lighter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CompareScreen({ route }) {
  const firstItem = route.params?.firstItem || mockLighters[0];
  const [selectedId, setSelectedId] = useState(mockLighters[1]?.id || "2");
  const secondItem =
    mockLighters.find((item) => item.id === selectedId) || mockLighters[1];

  const compareValue = (a, b) => {
    if (a > b) return "↑";
    if (a < b) return "↓";
    return "=";
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Compare" subtitle="Compare two lighters" />

      <Text style={styles.sectionTitle}>Select second lighter</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mockLighters
          .filter((item) => item.id !== firstItem.id)
          .map((item) => (
            <CategoryChip
              key={item.id}
              label={item.name}
              active={selectedId === item.id}
              onPress={() => setSelectedId(item.id)}
            />
          ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.compareCard}>
          <Text style={styles.compareTitle}>{firstItem.name}</Text>
          <Text style={styles.compareSubtitle}>vs</Text>
          <Text style={styles.compareTitle}>{secondItem.name}</Text>
        </View>

        {[
          ["Weight", firstItem.criteria.weight, secondItem.criteria.weight, "g"],
          [
            "Flame Temp",
            firstItem.criteria.flameTemperature,
            secondItem.criteria.flameTemperature,
            "°C",
          ],
          [
            "Ignition Capacity",
            firstItem.criteria.ignitionCapacity,
            secondItem.criteria.ignitionCapacity,
            "",
          ],
          ["Year", firstItem.criteria.year, secondItem.criteria.year, ""],
        ].map(([label, a, b, unit]) => (
          <View key={label} style={styles.compareRow}>
            <Text style={styles.compareLabel}>{label}</Text>
            <Text style={styles.compareValue}>
              {a} {unit} {compareValue(a, b)}
            </Text>
            <Text style={styles.compareValue}>
              {b} {unit} {compareValue(b, a)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardScreen() {
  const publicCount = mockLighters.filter((i) => i.isPublic).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Dashboard" subtitle="Manage your collection" />

        <View style={styles.statsRow}>
          <StatCard label="Objects" value={mockLighters.length} />
          <StatCard label="Categories" value={allCategories.length} />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Public" value={publicCount} />
          <StatCard label="Private" value={mockLighters.length - publicCount} />
        </View>

        <Text style={styles.sectionTitle}>Recent objects</Text>
        {mockLighters.slice(0, 4).map((item) => (
          <LighterCard key={item.id} item={item} onPress={() => {}} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileScreen() {
  const [publicCollection, setPublicCollection] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Profile" subtitle="User and collection settings" />

        <View style={styles.profileCard}>
          <Text style={styles.profileName}>Pedro Fevereiro</Text>
          <Text style={styles.profileEmail}>pedro@example.com</Text>

          <View style={styles.divider} />

          <Text style={styles.profileSection}>Collection title</Text>
          <Text style={styles.profileText}>Ignition Vault</Text>

          <Text style={styles.profileSection}>Collection description</Text>
          <Text style={styles.profileText}>
            A curated mobile collection of historical and technological lighters.
          </Text>

          <View style={[styles.rowBetween, { marginTop: 14 }]}>
            <Text style={styles.profileSection}>Public collection</Text>
            <Switch
              value={publicCollection}
              onValueChange={setPublicCollection}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Compare" component={CompareScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: COLORS.bg,
      card: COLORS.card,
      text: COLORS.text,
      border: COLORS.border,
      primary: COLORS.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle="light-content" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.card,
            borderTopColor: COLORS.border,
          },
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.sub,
        }}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Collection" component={CollectionScreen} />
        <Tab.Screen name="Compare" component={CompareScreen} />
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    marginBottom: 18,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: COLORS.sub,
    marginTop: 6,
    fontSize: 14,
  },
  hero: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroText: {
    color: COLORS.sub,
    lineHeight: 20,
    marginBottom: 14,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  primaryButtonText: {
    color: "#111827",
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.card2,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 6,
  },
  search: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
  },
  cardImage: {
    width: "100%",
    height: 170,
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
    paddingRight: 12,
  },
  cardDescription: {
    color: COLORS.sub,
    marginTop: 8,
    lineHeight: 20,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: "700",
    fontSize: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  chip: {
    backgroundColor: COLORS.card2,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  chipText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#111827",
  },
  miniChip: {
    backgroundColor: COLORS.card2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  miniChipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  detailImage: {
    width: "100%",
    height: 280,
    borderRadius: 20,
    marginBottom: 16,
  },
  detailBody: {
    paddingBottom: 40,
  },
  detailTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
    flex: 1,
    paddingRight: 10,
  },
  detailDescription: {
    color: COLORS.sub,
    marginTop: 12,
    lineHeight: 22,
  },
  criteriaCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
  },
  criteriaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  criteriaLabel: {
    color: COLORS.sub,
    fontSize: 15,
  },
  criteriaValue: {
    color: COLORS.text,
    fontWeight: "700",
  },
  compareCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginVertical: 14,
    alignItems: "center",
  },
  compareTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  compareSubtitle: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "700",
    marginVertical: 8,
  },
  compareRow: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  compareLabel: {
    color: COLORS.sub,
    marginBottom: 8,
    fontSize: 13,
    textTransform: "uppercase",
  },
  compareValue: {
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  statValue: {
    color: COLORS.accent,
    fontWeight: "900",
    fontSize: 24,
  },
  statLabel: {
    color: COLORS.sub,
    marginTop: 6,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  profileName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  profileEmail: {
    color: COLORS.sub,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  profileSection: {
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: 6,
  },
  profileText: {
    color: COLORS.sub,
    lineHeight: 20,
    marginBottom: 14,
  },
});
import { Image, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getFontFamily } from "../artDirection";
import { GhostPill } from "./BrandButton";

const brandMark = require("../../../assets/images/prototypes/profile/Logo.png");

const defaultLinks = [
    { label: "Home", route: "Home" },
    { label: "Collection", route: "Explore" },
    { label: "New", route: "New" },
    { label: "Vault", route: "Vault" },
    { label: "Profile", route: "Profile" },
];

export function TopBar({ colors, activeRoute, onToggleTheme, links = defaultLinks, compact = false }) {
    const navigation = useNavigation();

    return (
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 18,
            }}
        >
            <Pressable
                onPress={() => navigation.navigate("Home")}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <Image source={brandMark} style={{ width: compact ? 88 : 108, height: compact ? 28 : 34, resizeMode: "contain" }} />
                <Text
                    style={{
                        color: colors.text,
                        fontFamily: getFontFamily("heading"),
                        fontSize: 18,
                        fontWeight: "700",
                        letterSpacing: -0.4,
                    }}
                >
                    LightIt
                </Text>
            </Pressable>

            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                {links.map((link) => (
                    <GhostPill
                        key={link.route}
                        colors={colors}
                        label={link.label}
                        active={activeRoute === link.route}
                        onPress={() => navigation.navigate(link.route)}
                    />
                ))}
                <GhostPill colors={colors} label="Theme" onPress={onToggleTheme} />
            </View>
        </View>
    );
}

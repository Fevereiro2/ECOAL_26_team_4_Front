import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, SafeAreaView, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { getBodyTextStyle, getEyebrowStyle, getHeadingStyle, getHeroSurfaceStyle, getPageShellStyle, getPanelStyle } from "../artDirection";
import { AmbientBackground } from "../components/AmbientBackground";
import { BrandButton } from "../components/BrandButton";
import { CompareModal } from "../components/CompareModal";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { SectionTitle } from "../components/SectionTitle";
import { TopBar } from "../components/TopBar";
import { styles } from "../styles";
export function HomeScreen({ shared }) {
    const { colors, lighters, toggleTheme } = shared;
    const featured = lighters.filter((lighter) => lighter.visibility === "public").slice(0, 3);
    const privateCount = lighters.filter((lighter) => lighter.visibility === "private").length;
    const totalCount = lighters.length;
    const [selected, setSelected] = useState(null);
    const [compare, setCompare] = useState(null);
    const lighterFloat = useRef(new Animated.Value(0)).current;
    const glowPulse = useRef(new Animated.Value(0)).current;
    const { width, height } = useWindowDimensions();
    const compact = height < 780;
    const heroSize = Math.min(width * 0.4, compact ? 190 : 250);
    const logoWidth = compact ? 160 : 190;
    const shellStyle = getPageShellStyle(width);
    useEffect(() => {
        const floatLoop = Animated.loop(Animated.sequence([
            Animated.timing(lighterFloat, {
                toValue: 1,
                duration: 2800,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),
            Animated.timing(lighterFloat, {
                toValue: 0,
                duration: 2800,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            }),
        ]));
        const glowLoop = Animated.loop(Animated.sequence([
            Animated.timing(glowPulse, {
                toValue: 1,
                duration: 2200,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(glowPulse, {
                toValue: 0,
                duration: 2200,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
        ]));
        floatLoop.start();
        glowLoop.start();
        return () => {
            floatLoop.stop();
            glowLoop.stop();
        };
    }, [glowPulse, lighterFloat]);
    return (<SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={{ flex: 1 }}>
        <AmbientBackground colors={colors}/>
        <Animated.View style={{
            position: "absolute",
            right: -40,
            top: 72,
            width: 260,
            height: 260,
            borderRadius: 999,
            backgroundColor: "rgba(243, 207, 103, 0.16)",
            opacity: glowPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.35, 0.72],
            }),
            transform: [
                {
                    scale: glowPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1.08],
                    }),
                },
            ],
        }}/>

        <ScrollView contentContainerStyle={shellStyle}>
          <TopBar colors={colors} activeRoute="Home" onToggleTheme={toggleTheme} compact={width < 700}/>

          <View style={[styles.hero, getHeroSurfaceStyle(colors, width)]}>
            <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.02)" }}/>
            <View style={{ position: "absolute", inset: 0, opacity: 0.3, backgroundColor: "rgba(232, 121, 71, 0.08)" }}/>
            <View style={{ flexDirection: width >= 700 ? "row" : "column", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
              <View style={{ flex: 1 }}>
                <View style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.panelSoft,
            paddingHorizontal: 12,
            paddingVertical: 6,
        }}>
                  <Text style={getEyebrowStyle(colors)}>Official Collector Edit</Text>
                </View>
                <Image source={require("../../../assets/images/prototypes/profile/Logo.png")} style={{
            width: logoWidth,
            height: logoWidth * 0.42,
            resizeMode: "contain",
            marginTop: 16,
        }}/>
                <Text style={[getHeadingStyle(colors, "h1"), { fontSize: width < 420 ? 38 : 52, lineHeight: width < 420 ? 36 : 50, marginTop: 10 }]}>
                  Light every story worth keeping.
                </Text>
                <Text style={[getBodyTextStyle(colors, true), { fontSize: 16, marginTop: 14, maxWidth: width >= 700 ? "86%" : "100%" }]}>
                  A warm industrial vault for collectible lighters, shaped for clear browsing, measured curation, and premium account journeys.
                </Text>
                <View style={{ flexDirection: width < 520 ? "column" : "row", gap: 12, marginTop: 18 }}>
                  <BrandButton colors={colors} onPress={() => setSelected(featured[0] ?? null)} style={{ flex: width < 520 ? undefined : 1 }}>
                    View spotlight
                  </BrandButton>
                  <BrandButton colors={colors} variant="secondary" onPress={() => setCompare(featured[1] ?? featured[0] ?? null)} style={{ flex: width < 520 ? undefined : 1 }}>
                    Compare pieces
                  </BrandButton>
                </View>
              </View>

              <Animated.View style={{
            width: heroSize,
            height: heroSize,
            alignItems: "center",
            justifyContent: "center",
            transform: [
                {
                    translateY: lighterFloat.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -14],
                    }),
                },
                {
                    rotate: lighterFloat.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["-4deg", "3deg"],
                    }),
                },
            ],
        }}>
                <View style={{
            position: "absolute",
            width: heroSize * 0.86,
            height: heroSize * 0.86,
            borderRadius: 40,
            backgroundColor: colors.panelSoft,
            borderWidth: 1,
            borderColor: colors.border,
        }}/>
                <Image source={require("../../../assets/images/prototypes/lighterpng.png")} style={{
            width: heroSize * 0.76,
            height: heroSize * 0.76,
            resizeMode: "contain",
        }}/>
              </Animated.View>
            </View>

            <View style={{ flexDirection: width < 700 ? "column" : "row", gap: 12, marginTop: 24 }}>
              <View style={[getPanelStyle(colors, { elevated: true, padding: 14 }), { flex: 1 }]}>
                <Text style={[getEyebrowStyle(colors), { marginBottom: 6 }]}>Public Collection</Text>
                <Text style={[getHeadingStyle(colors), { fontSize: 28, lineHeight: 28 }]}>{featured.length}</Text>
              </View>
              <View style={[getPanelStyle(colors, { elevated: true, padding: 14 }), { flex: 1 }]}>
                <Text style={[getEyebrowStyle(colors), { marginBottom: 6 }]}>Private Vault</Text>
                <Text style={[getHeadingStyle(colors), { fontSize: 28, lineHeight: 28 }]}>{privateCount}</Text>
              </View>
              <View style={[getPanelStyle(colors, { elevated: true, padding: 14 }), { flex: 1 }]}>
                <Text style={[getEyebrowStyle(colors), { marginBottom: 6 }]}>Total Pieces</Text>
                <Text style={[getHeadingStyle(colors), { fontSize: 28, lineHeight: 28 }]}>{totalCount}</Text>
              </View>
            </View>
          </View>

          <View style={[getPanelStyle(colors, { radius: 30, padding: 22 }), { marginTop: 24 }]}>
            <SectionTitle title="Featured Collection" subtitle="A restrained selection from the public archive" colors={colors}/>
            {featured.map((item) => (<LighterCard key={item.id} lighter={item} colors={colors} onView={setSelected} onCompare={setCompare}/>))}
          </View>
        </ScrollView>
      </View>

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors}/>
      <CompareModal item={compare} onClose={() => setCompare(null)} colors={colors} lighters={lighters}/>
    </SafeAreaView>);
}

import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, SafeAreaView, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { getShadow } from "../brand";
import { Atmosphere } from "../components/Atmosphere";
import { CompareModal } from "../components/CompareModal";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { SectionTitle } from "../components/SectionTitle";
import { styles } from "../styles";
export function HomeScreen({ shared }) {
    const { colors, lighters, theme } = shared;
    const featured = lighters.filter((lighter) => lighter.visibility === "public").slice(0, 3);
    const privateCount = lighters.filter((lighter) => lighter.visibility === "private").length;
    const [selected, setSelected] = useState(null);
    const [compare, setCompare] = useState(null);
    const lighterFloat = useRef(new Animated.Value(0)).current;
    const glowPulse = useRef(new Animated.Value(0)).current;
    const frameBurn = useRef(new Animated.Value(0)).current;
    const { width, height } = useWindowDimensions();
    const compact = height < 780;
    const heroSize = Math.min(width * 0.52, compact ? 180 : 220);
    const logoWidth = compact ? 160 : 190;
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
        const burnLoop = Animated.loop(Animated.sequence([
            Animated.timing(frameBurn, {
                toValue: 1,
                duration: 900,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(frameBurn, {
                toValue: 0,
                duration: 760,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ]));
        floatLoop.start();
        glowLoop.start();
        burnLoop.start();
        return () => {
            floatLoop.stop();
            glowLoop.stop();
            burnLoop.stop();
        };
    }, [frameBurn, glowPulse, lighterFloat]);
    return (<SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <Atmosphere colors={colors} haloScale={1.1}>
        <Animated.View style={{
            position: "absolute",
            right: -40,
            top: 92,
            width: 230,
            height: 230,
            borderRadius: 999,
            backgroundColor: colors.haloSoft,
            opacity: glowPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.35, 0.85],
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
        <Animated.View style={{
            position: "absolute",
            top: compact ? 8 : 12,
            left: compact ? 6 : 10,
            right: compact ? 6 : 10,
            bottom: compact ? 8 : 12,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 28,
            opacity: frameBurn.interpolate({
                inputRange: [0, 1],
                outputRange: [0.12, 0.3],
            }),
        }}/>

        <ScrollView contentContainerStyle={styles.scrollPad}>
          <View style={[styles.hero, getShadow(theme, "card"), { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <View style={{ flexDirection: compact ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.eyebrow, { color: colors.accent }]}>Collector vault</Text>
                <Image source={require("../../../assets/images/prototypes/profile/Logo.png")} style={{
            width: logoWidth,
            height: logoWidth * 0.42,
            resizeMode: "contain",
            marginTop: 16,
        }}/>
                <Text style={[styles.heroTitle, { color: colors.text, marginTop: 8, maxWidth: compact ? "90%" : "74%" }]}>Preserve every piece with quiet confidence.</Text>
                <Text style={[styles.heroCopy, { color: colors.muted, marginTop: 14, maxWidth: "92%" }]}>Light It turns a lighter collection into a premium catalog: documented, filtered, shareable, and still fully under the collector&apos;s control.</Text>
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
            backgroundColor: colors.elevated,
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

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                            <View style={[styles.stat, { backgroundColor: colors.panelSoft, borderColor: colors.border, marginRight: 0 }]}> 
                                <Text style={[styles.statLabel, { color: colors.muted }]}>Public pieces</Text>
                                <Text style={[styles.statValue, { color: colors.primary }]}>{featured.length}</Text>
              </View>
                            <View style={[styles.stat, { backgroundColor: colors.panelSoft, borderColor: colors.border, marginRight: 0 }]}> 
                                <Text style={[styles.statLabel, { color: colors.muted }]}>Private pieces</Text>
                                <Text style={[styles.statValue, { color: colors.accent }]}>{privateCount}</Text>
              </View>
            </View>
          </View>

                    <View style={[styles.formCard, getShadow(theme, "card"), { borderRadius: 30, borderColor: colors.border, backgroundColor: colors.panel }]}> 
            <SectionTitle title="Featured Machines" subtitle="Top public pieces from the road" colors={colors}/>
                        {featured.map((item) => (<LighterCard key={item.id} lighter={item} colors={colors} theme={theme} onView={setSelected} onCompare={setCompare}/>))}
          </View>
        </ScrollView>
            </Atmosphere>

            <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors} theme={theme}/>
            <CompareModal item={compare} onClose={() => setCompare(null)} colors={colors} lighters={lighters} theme={theme}/>
    </SafeAreaView>);
}

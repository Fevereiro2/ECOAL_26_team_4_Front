import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, SafeAreaView, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { CompareModal } from "../components/CompareModal";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { SectionTitle } from "../components/SectionTitle";
import { styles } from "../styles";
export function HomeScreen({ shared }) {
    const { colors, lighters } = shared;
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
    return (<SafeAreaView style={[styles.safe, { backgroundColor: "#120909" }]}>
      <View style={{ flex: 1 }}>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "#120909" }}/>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(12,5,5,0.52)" }}/>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(120,18,18,0.12)" }}/>
        <View style={{ position: "absolute", top: -120, left: -90, width: 260, height: 260, borderRadius: 999, backgroundColor: "rgba(127,29,29,0.34)" }}/>
        <Animated.View style={{
            position: "absolute",
            right: -40,
            top: 92,
            width: 230,
            height: 230,
            borderRadius: 999,
            backgroundColor: "rgba(255,170,64,0.18)",
            opacity: glowPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.45, 0.9],
            }),
            transform: [
                {
                    scale: glowPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1.12],
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
            borderColor: "rgba(255,210,122,0.12)",
            opacity: frameBurn.interpolate({
                inputRange: [0, 1],
                outputRange: [0.16, 0.42],
            }),
        }}/>

        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 30 }}>
          <View style={[styles.hero, { backgroundColor: "rgba(20,10,10,0.72)", borderColor: "rgba(255,184,108,0.16)" }]}>
            <View style={{ flexDirection: compact ? "column" : "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <View style={{ flex: 1 }}>
                <View style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.18)",
            backgroundColor: "rgba(255,255,255,0.08)",
            paddingHorizontal: 12,
            paddingVertical: 6,
        }}>
                  <Text style={{ color: "#fef2f2", fontSize: 12, fontWeight: "700", letterSpacing: 1.2 }}>COLLECTOR VAULT</Text>
                </View>
                <Image source={require("../../../assets/images/prototypes/profile/Logo.png")} style={{
            width: logoWidth,
            height: logoWidth * 0.42,
            resizeMode: "contain",
            marginTop: 16,
        }}/>
                <Text style={{ color: "#ffe4e6", fontSize: compact ? 22 : 28, fontWeight: "600", lineHeight: compact ? 28 : 34, marginTop: 8, maxWidth: "88%" }}>
                  Ignite the story behind every piece
                </Text>
                <Text style={{ color: "rgba(255,244,244,0.78)", fontSize: 15, lineHeight: 22, marginTop: 14, maxWidth: "92%" }}>
                  Track rare lighters, shape your collection, and compare standout finds in one premium mobile vault.
                </Text>
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
            backgroundColor: "rgba(16,10,10,0.42)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
        }}/>
                <Image source={require("../../../assets/images/prototypes/lighterpng.png")} style={{
            width: heroSize * 0.76,
            height: heroSize * 0.76,
            resizeMode: "contain",
        }}/>
              </Animated.View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <View style={{ flex: 1, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.06)", padding: 12 }}>
                <Text style={{ color: "rgba(255,237,213,0.7)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Public rides</Text>
                <Text style={{ color: "#f97316", fontSize: 24, fontWeight: "900", marginTop: 4 }}>{featured.length}</Text>
              </View>
              <View style={{ flex: 1, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.06)", padding: 12 }}>
                <Text style={{ color: "rgba(255,237,213,0.7)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Locked stash</Text>
                <Text style={{ color: "#fdba74", fontSize: 24, fontWeight: "900", marginTop: 4 }}>{privateCount}</Text>
              </View>
            </View>
          </View>

          <View style={{ borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,184,108,0.12)", backgroundColor: "rgba(22,8,8,0.78)", padding: 16 }}>
            <SectionTitle title="Featured Machines" subtitle="Top public pieces from the road" colors={colors}/>
            {featured.map((item) => (<LighterCard key={item.id} lighter={item} colors={colors} onView={setSelected} onCompare={setCompare}/>))}
          </View>
        </ScrollView>
      </View>

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors}/>
      <CompareModal item={compare} onClose={() => setCompare(null)} colors={colors} lighters={lighters}/>
    </SafeAreaView>);
}

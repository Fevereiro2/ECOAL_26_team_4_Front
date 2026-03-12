import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, Image, SafeAreaView, Text, View, useWindowDimensions } from "react-native";
import { getShadow } from "../brand";
import { Atmosphere } from "../components/Atmosphere";
import { styles } from "../styles";
export function SplashScreen({ colors }) {
    const lighterFloat = useRef(new Animated.Value(0)).current;
    const glowPulse = useRef(new Animated.Value(0)).current;
    const frameBurn = useRef(new Animated.Value(0)).current;
    const { width, height } = useWindowDimensions();
    const compact = height < 780;
    const heroSize = Math.min(width * 0.62, compact ? 220 : 280);
    const logoWidth = width < 390 ? 170 : 210;
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
    return (<SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Atmosphere colors={colors} haloScale={1.1}>
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
                outputRange: [0.12, 0.28],
            }),
        }}/>
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
                        outputRange: [0.9, 1.12],
                    }),
                },
            ],
        }}/>

                <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
          <View style={{
                        ...getShadow("dark", "card"),
                        borderRadius: 30,
            borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.panel,
            paddingHorizontal: 22,
            paddingVertical: compact ? 28 : 34,
            alignItems: "center",
          }}>
                        <Text style={[styles.eyebrow, { color: colors.accent }]}>Collector vault</Text>

            <Image source={require("../../../assets/images/prototypes/profile/Logo.png")} style={{
                width: logoWidth,
                height: logoWidth * 0.42,
                resizeMode: "contain",
                marginTop: 18,
            }}/>

            <Animated.View style={{
                width: heroSize,
                height: heroSize,
                alignItems: "center",
                justifyContent: "center",
                marginTop: compact ? 14 : 18,
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
                width: heroSize * 0.72,
                height: heroSize * 0.72,
                resizeMode: "contain",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 18 },
                shadowOpacity: 0.3,
                shadowRadius: 26,
              }}/>
            </Animated.View>

                        <Text style={[styles.heroTitle, { color: colors.text, marginTop: 10, textAlign: "center", maxWidth: 320 }]}>Preparing your collector vault.</Text>
                        <Text style={[styles.heroCopy, { color: colors.muted, marginTop: 14, textAlign: "center", maxWidth: 320 }]}>Syncing collections, profiles, and the warm industrial atmosphere that frames the whole experience.</Text>

            <View style={{
                marginTop: 22,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderRadius: 999,
                borderWidth: 1,
                                borderColor: colors.border,
                                backgroundColor: colors.panelSoft,
                paddingHorizontal: 16,
                paddingVertical: 10,
            }}>
                            <ActivityIndicator color={colors.primary} size="small"/>
                            <Text style={[styles.metaText, { color: colors.text }]}>Opening the vault...</Text>
            </View>
          </View>
        </View>
            </Atmosphere>
    </SafeAreaView>);
}

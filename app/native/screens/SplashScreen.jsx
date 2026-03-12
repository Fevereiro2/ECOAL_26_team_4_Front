import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, Image, SafeAreaView, Text, View, useWindowDimensions } from "react-native";
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
    return (<SafeAreaView style={{ flex: 1, backgroundColor: "#120909" }}>
      <View style={{ flex: 1 }}>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "#120909" }}/>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(12,5,5,0.52)" }}/>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(120,18,18,0.12)" }}/>
        <View style={{ position: "absolute", top: -120, left: -90, width: 260, height: 260, borderRadius: 999, backgroundColor: "rgba(127,29,29,0.34)" }}/>
        <View style={{ position: "absolute", bottom: 120, right: -110, width: 300, height: 300, borderRadius: 999, backgroundColor: "rgba(249,115,22,0.12)" }}/>
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

        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
          <View style={{
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "rgba(255,184,108,0.18)",
            backgroundColor: "rgba(20,10,10,0.72)",
            paddingHorizontal: 22,
            paddingVertical: compact ? 28 : 34,
            alignItems: "center",
          }}>
            <View style={{
                alignSelf: "center",
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
                backgroundColor: "rgba(16,10,10,0.42)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
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

            <Text style={{ color: "#ffe4e6", fontSize: compact ? 22 : 28, fontWeight: "600", textAlign: "center", lineHeight: compact ? 28 : 34, marginTop: 10 }}>
              Ignite the story behind every piece
            </Text>
            <Text style={{ color: "rgba(255,244,244,0.78)", fontSize: 15, lineHeight: 22, marginTop: 14, textAlign: "center", maxWidth: 320 }}>
              Preparing your premium mobile vault and syncing the collection.
            </Text>

            <View style={{
                marginTop: 22,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.06)",
                paddingHorizontal: 16,
                paddingVertical: 10,
            }}>
              <ActivityIndicator color="#f97316" size="small"/>
              <Text style={{ color: "#fff7ed", fontSize: 14, fontWeight: "700" }}>Opening the vault...</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>);
}

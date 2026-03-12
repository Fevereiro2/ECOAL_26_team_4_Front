import { ActivityIndicator, Image, SafeAreaView, Text, View } from "react-native";

export function SplashScreen({ colors }) {
    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ position: "absolute", right: -30, top: -20, width: 210, height: 210, borderRadius: 999, backgroundColor: "rgba(232, 121, 71, 0.18)" }} />
      <View style={{ position: "absolute", left: -70, bottom: 120, width: 240, height: 240, borderRadius: 999, backgroundColor: "rgba(239, 175, 83, 0.14)" }} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Image source={require("../../../assets/images/icon.png")} style={{ width: 98, height: 98, borderRadius: 28, marginBottom: 16, borderWidth: 2, borderColor: colors.primary }} />
        <Text style={{ color: colors.text, fontSize: 36, fontWeight: "900", letterSpacing: 0.6 }}>Light It</Text>
        <Text style={{ color: colors.muted, fontSize: 14, marginTop: 6 }}>Collector Vault</Text>
        <ActivityIndicator color={colors.primary} size="small" style={{ marginTop: 22 }} />
      </View>
    </SafeAreaView>
    );
}

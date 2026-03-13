import { StyleSheet, View } from "react-native";
import { getAtmosphereStyle, getTextureOverlayStyle } from "../artDirection";

export function AmbientBackground({ colors }) {
    return (
        <>
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bg }]} />
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, getAtmosphereStyle(colors)]} />
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    top: -120,
                    left: -90,
                    width: 280,
                    height: 280,
                    borderRadius: 999,
                    backgroundColor: "rgba(232, 121, 71, 0.16)",
                }}
            />
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    right: -120,
                    top: 160,
                    width: 360,
                    height: 360,
                    borderRadius: 999,
                    backgroundColor: "rgba(243, 207, 103, 0.12)",
                }}
            />
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    left: "14%",
                    bottom: -120,
                    width: 320,
                    height: 320,
                    borderRadius: 999,
                    backgroundColor: "rgba(239, 175, 83, 0.12)",
                }}
            />
            <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, getTextureOverlayStyle(colors)]} />
        </>
    );
}

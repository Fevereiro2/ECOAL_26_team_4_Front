import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

const GRID_LINES = Array.from({ length: 6 }, (_, index) => index);

export function Atmosphere({ colors, children, haloScale = 1 }) {
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}> 
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={colors.atmosphereGradient} locations={[0, 0.58, 1]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFillObject} />
        <View
          style={[
            styles.halo,
            {
              width: 280 * haloScale,
              height: 280 * haloScale,
              left: -96,
              top: -52,
              backgroundColor: colors.haloStrong,
            },
          ]}
        />
        <View
          style={[
            styles.halo,
            {
              width: 320 * haloScale,
              height: 320 * haloScale,
              right: -120,
              top: 148,
              backgroundColor: colors.haloSoft,
            },
          ]}
        />
        <View style={styles.textureWrap}>
          {GRID_LINES.map((index) => (
            <View
              key={`v-${index}`}
              style={[
                styles.verticalLine,
                { left: `${12 + index * 16}%`, backgroundColor: colors.texture },
              ]}
            />
          ))}
          {GRID_LINES.map((index) => (
            <View
              key={`h-${index}`}
              style={[
                styles.horizontalLine,
                { top: `${14 + index * 14}%`, backgroundColor: colors.texture },
              ]}
            />
          ))}
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  halo: {
    position: "absolute",
    borderRadius: 999,
  },
  textureWrap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  verticalLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  horizontalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});

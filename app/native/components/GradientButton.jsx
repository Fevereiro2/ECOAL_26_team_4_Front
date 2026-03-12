import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";
import { getShadow } from "../brand";
import { styles } from "../styles";

export function GradientButton({
  title,
  onPress,
  disabled = false,
  colors,
  theme,
  icon = null,
  style,
  textStyle,
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.actionBtn, getShadow(theme, "button"), style, disabled && { opacity: 0.7 }]}> 
      <LinearGradient colors={colors.brandGradient} locations={[0, 0.58, 1]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.actionBtnInner}>
        <View style={styles.actionBtnContent}>
          {icon}
          <Text style={[styles.actionBtnText, textStyle]}>{title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

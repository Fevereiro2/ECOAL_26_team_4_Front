import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { getFontFamily, getInteractiveLift, getTransitionStyle } from "../artDirection";

function getVariantStyles(colors, variant, state) {
    const pressed = state.pressed;
    switch (variant) {
        case "secondary":
            return {
                borderColor: colors.border,
                backgroundColor: colors.panelSoft,
                textColor: colors.text,
                shadowColor: "#000",
                shadowOpacity: pressed ? 0.06 : 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                webShadow: pressed ? "none" : "0 10px 22px rgba(0, 0, 0, 0.08)",
            };
        case "ghost":
            return {
                borderColor: colors.border,
                backgroundColor: "transparent",
                textColor: colors.text,
                shadowColor: "#000",
                shadowOpacity: 0,
                shadowRadius: 0,
                shadowOffset: { width: 0, height: 0 },
                webShadow: "none",
            };
        case "danger":
            return {
                borderColor: "rgba(220, 38, 38, 0.26)",
                backgroundColor: "rgba(220, 38, 38, 0.08)",
                textColor: "#dc2626",
                shadowColor: "#000",
                shadowOpacity: pressed ? 0.04 : 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 5 },
                webShadow: pressed ? "none" : "0 10px 22px rgba(120, 0, 0, 0.08)",
            };
        default:
            return {
                borderColor: "rgba(255, 248, 221, 0.14)",
                backgroundColor: colors.buttonEnd,
                textColor: colors.buttonText,
                shadowColor: colors.buttonEnd,
                shadowOpacity: pressed ? 0.12 : 0.22,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                webShadow: pressed ? "none" : `0 14px 28px ${colors.buttonShadow}`,
            };
    }
}

function PrimaryFill({ colors, variant }) {
    if (variant !== "primary") {
        return null;
    }
    if (Platform.OS === "web") {
        return null;
    }
    return (
        <>
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.buttonEnd }]} />
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "58%", backgroundColor: colors.buttonMid }} />
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "32%", backgroundColor: colors.buttonStart }} />
            <View
                style={{
                    position: "absolute",
                    left: 1,
                    right: 1,
                    top: 1,
                    height: "44%",
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    backgroundColor: "rgba(255, 255, 255, 0.14)",
                }}
            />
        </>
    );
}

function resolveButtonText(children, textStyle, color, size) {
    if (typeof children !== "string") {
        return children;
    }
    return (
        <Text
            style={[
                {
                    color,
                    fontFamily: getFontFamily("body"),
                    fontSize: size === "sm" ? 14 : 15,
                    lineHeight: size === "sm" ? 18 : 20,
                    fontWeight: "700",
                    textAlign: "center",
                    letterSpacing: 0.1,
                },
                textStyle,
            ]}
        >
            {children}
        </Text>
    );
}

export function BrandButton({
    colors,
    variant = "primary",
    size = "md",
    onPress,
    children,
    disabled = false,
    style,
    textStyle,
    contentStyle,
}) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={(state) => {
                const liftStyle = getInteractiveLift(state);
                const variantStyles = getVariantStyles(colors, variant, state);
                const verticalPadding = size === "sm" ? 10 : 12;
                return [
                    {
                        minHeight: size === "sm" ? 42 : 48,
                        borderRadius: 16,
                        paddingHorizontal: size === "sm" ? 16 : 18,
                        paddingVertical: verticalPadding,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: variantStyles.borderColor,
                        backgroundColor: variantStyles.backgroundColor,
                        opacity: disabled ? 0.62 : 1,
                        ...(Platform.OS === "web"
                            ? {
                                backgroundImage:
                                    variant === "primary"
                                        ? `linear-gradient(180deg, ${colors.buttonStart} 0%, ${colors.buttonMid} 58%, ${colors.buttonEnd} 100%)`
                                        : undefined,
                                boxShadow: variantStyles.webShadow,
                            }
                            : {
                                shadowColor: variantStyles.shadowColor,
                                shadowOpacity: variantStyles.shadowOpacity,
                                shadowRadius: variantStyles.shadowRadius,
                                shadowOffset: variantStyles.shadowOffset,
                            }),
                    },
                    getTransitionStyle(),
                    liftStyle,
                    style,
                ];
            }}
        >
            <PrimaryFill colors={colors} variant={variant} />
            <View
                style={[
                    {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        width: "100%",
                    },
                    contentStyle,
                ]}
            >
                {resolveButtonText(children, textStyle, getVariantStyles(colors, variant, { pressed: false }).textColor, size)}
            </View>
        </Pressable>
    );
}

export function GhostPill({ colors, onPress, label, active = false, style }) {
    return (
        <Pressable
            onPress={onPress}
            style={(state) => [
                {
                    minHeight: 40,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? colors.border : state.hovered || state.focused ? colors.border : "transparent",
                    backgroundColor: active ? colors.panel : state.hovered || state.focused ? colors.panelSoft : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                },
                getTransitionStyle(),
                getInteractiveLift(state),
                style,
            ]}
        >
            <Text
                style={{
                    color: active ? colors.text : colors.muted,
                    fontFamily: getFontFamily("body"),
                    fontSize: 13,
                    fontWeight: "700",
                }}
            >
                {label}
            </Text>
        </Pressable>
    );
}

export function IconCircleButton({ colors, onPress, children, danger = false, style }) {
    return (
        <Pressable
            onPress={onPress}
            style={(state) => [
                {
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: danger ? "rgba(220, 38, 38, 0.2)" : colors.border,
                    backgroundColor: danger ? "rgba(220, 38, 38, 0.08)" : colors.panelSoft,
                    alignItems: "center",
                    justifyContent: "center",
                },
                getTransitionStyle(),
                getInteractiveLift(state),
                style,
            ]}
        >
            {children}
        </Pressable>
    );
}

export function SelectionChip({ colors, label, selected, onPress, style, compact = false }) {
    return (
        <Pressable
            onPress={onPress}
            style={(state) => [
                {
                    minHeight: compact ? 38 : 42,
                    paddingHorizontal: compact ? 12 : 14,
                    paddingVertical: compact ? 8 : 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selected ? colors.accent : colors.border,
                    backgroundColor: selected ? colors.panel : colors.panelSoft,
                    justifyContent: "center",
                    alignItems: "center",
                },
                getTransitionStyle(),
                getInteractiveLift(state),
                style,
            ]}
        >
            <Text
                style={{
                    color: selected ? colors.text : colors.muted,
                    fontFamily: getFontFamily("body"),
                    fontSize: compact ? 12 : 13,
                    fontWeight: selected ? "700" : "600",
                }}
            >
                {label}
            </Text>
        </Pressable>
    );
}

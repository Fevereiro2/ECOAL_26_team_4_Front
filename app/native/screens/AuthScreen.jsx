import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { getBodyTextStyle, getEyebrowStyle, getHeadingStyle, getPageShellStyle, getPanelStyle } from "../artDirection";
import { AmbientBackground } from "../components/AmbientBackground";
import { BrandButton } from "../components/BrandButton";
import { requiredText, validateEmail, validatePassword } from "../validation";

const logoImage = require("../../../assets/images/prototypes/profile/Logo.png");

function FieldError({ message }) {
    if (!message) {
        return null;
    }
    return <Text style={{ color: "#dc2626", marginTop: 4 }}>{message}</Text>;
}

export function AuthScreen({ colors, statusMessage, onLogin, onRegister, onContinueGuest }) {
    const [mode, setMode] = useState("login");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isModalMounted, setIsModalMounted] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const sheetAnim = useRef(new Animated.Value(0)).current;
    const lighterFloat = useRef(new Animated.Value(0)).current;
    const glowPulse = useRef(new Animated.Value(0)).current;
    const { width, height } = useWindowDimensions();
    const shellStyle = getPageShellStyle(width);
    const isLogin = mode === "login";
    const isRegister = mode === "register";
    const isForgotPassword = mode === "forgot";
    const heroImageSize = Math.min(width * 0.54, height < 780 ? 210 : 280);
    const isSplitLayout = width >= 700;

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setErrors({});
        setFormError(null);
    };

    useEffect(() => {
        if (isPopupOpen) {
            setIsModalMounted(true);
            Animated.timing(sheetAnim, {
                toValue: 1,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
            return;
        }
        Animated.timing(sheetAnim, {
            toValue: 0,
            duration: 220,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setIsModalMounted(false);
            }
        });
    }, [isPopupOpen, sheetAnim]);

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

    const openPopup = (nextMode) => {
        switchMode(nextMode);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setErrors({});
        setFormError(null);
        setIsPopupOpen(false);
    };

    const handleSubmit = async () => {
        const nextErrors = {};
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (isRegister) {
            const nameError = requiredText(name, "Name");
            if (nameError) {
                nextErrors.name = nameError;
            }
            if (confirmPassword !== password) {
                nextErrors.confirmPassword = "Passwords must match.";
            }
        }

        if (!isForgotPassword && emailError) {
            nextErrors.email = emailError;
        }
        if (!isForgotPassword && passwordError) {
            nextErrors.password = passwordError;
        }

        setErrors(nextErrors);
        setFormError(null);
        if (Object.keys(nextErrors).length > 0 || isForgotPassword) {
            return;
        }

        setIsSubmitting(true);
        try {
            if (isLogin) {
                const error = await onLogin(email, password);
                if (error) {
                    setFormError(error);
                }
                return;
            }
            const error = await onRegister(name, email, password);
            if (error) {
                setFormError(error);
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = (field) => ({
        color: colors.text,
        borderColor: errors[field] ? "#dc2626" : colors.border,
        borderWidth: 1,
        borderRadius: 16,
        minHeight: 50,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.panelSoft,
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <View style={{ flex: 1 }}>
                <AmbientBackground colors={colors} />
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        right: -40,
                        top: 110,
                        width: 250,
                        height: 250,
                        borderRadius: 999,
                        backgroundColor: "rgba(243, 207, 103, 0.16)",
                        opacity: glowPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.4, 0.8],
                        }),
                        transform: [
                            {
                                scale: glowPulse.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.94, 1.08],
                                }),
                            },
                        ],
                    }}
                />

                <ScrollView contentContainerStyle={shellStyle}>
                    <View style={[getPanelStyle(colors, { radius: 30, padding: width >= 700 ? 24 : 18 }), { overflow: "hidden" }]}>
                        <View style={{ flexDirection: isSplitLayout ? "row" : "column", gap: 22 }}>
                            <View style={{ flex: isSplitLayout ? 1.05 : undefined }}>
                                <Text style={getEyebrowStyle(colors)}>Official Collector Vault</Text>
                                <Text style={[getHeadingStyle(colors, "h1"), { fontSize: width < 420 ? 38 : 52, lineHeight: width < 420 ? 36 : 50 }]}>
                                    Warm curation, clear access, premium restraint.
                                </Text>
                                <Text style={[getBodyTextStyle(colors, true), { fontSize: 16, marginTop: 16, maxWidth: isSplitLayout ? "82%" : "100%" }]}>
                                    LightIt is designed as a collectible archive first: cinematic atmosphere, sharp clarity, and account flows that stay quiet and precise.
                                </Text>

                                <View style={{ flexDirection: width < 480 ? "column" : "row", gap: 12, marginTop: 22 }}>
                                    <BrandButton colors={colors} onPress={() => openPopup("login")} style={{ flex: width < 480 ? undefined : 1 }}>
                                        Open login
                                    </BrandButton>
                                    <BrandButton colors={colors} variant="secondary" onPress={onContinueGuest} style={{ flex: width < 480 ? undefined : 1 }}>
                                        Continue as guest
                                    </BrandButton>
                                </View>

                                {statusMessage ? (
                                    <View style={[getPanelStyle(colors, { elevated: true, padding: 14 }), { marginTop: 16 }]}>
                                        <Text style={getBodyTextStyle(colors, true)}>{statusMessage}</Text>
                                    </View>
                                ) : null}
                            </View>

                            <View style={{ flex: isSplitLayout ? 0.95 : undefined, alignItems: "center", justifyContent: "center", minHeight: isSplitLayout ? 360 : 240 }}>
                                <Animated.View
                                    style={{
                                        transform: [
                                            {
                                                translateY: lighterFloat.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -12],
                                                }),
                                            },
                                        ],
                                    }}
                                >
                                    <View style={[getPanelStyle(colors, { elevated: true, padding: 18 }), { borderRadius: 30 }]}>
                                        <Image source={logoImage} style={{ width: heroImageSize, height: heroImageSize * 0.58, resizeMode: "contain" }} />
                                    </View>
                                </Animated.View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>

            <Modal visible={isModalMounted} transparent animationType="none" onRequestClose={closePopup}>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                    <Animated.View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(18, 14, 10, 0.48)", opacity: sheetAnim }} />
                    <Pressable onPress={closePopup} style={StyleSheet.absoluteFillObject} />

                    <Animated.View
                        style={[
                            getPanelStyle(colors, { radius: 30, padding: 24 }),
                            {
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                minHeight: "62%",
                                maxHeight: "80%",
                                transform: [
                                    {
                                        translateY: sheetAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [480, 0],
                                        }),
                                    },
                                ],
                                opacity: sheetAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.6, 1],
                                }),
                            },
                        ]}
                    >
                        <View style={{ alignItems: "center", marginBottom: 12 }}>
                            <Pressable onPress={closePopup}>
                                <View style={{ width: 52, height: 5, borderRadius: 999, backgroundColor: colors.border }} />
                            </Pressable>
                        </View>

                        <Text style={[getHeadingStyle(colors, "h2"), { textAlign: "center", alignSelf: "center" }]}>
                            {isLogin ? "Sign in to your vault" : isRegister ? "Create your account" : "Forgot password"}
                        </Text>
                        <Text style={[getBodyTextStyle(colors, true), { textAlign: "center", marginTop: 10, marginBottom: 18 }]}>
                            {isLogin
                                ? "Use your existing account to open the collection space."
                                : isRegister
                                    ? "Create a profile once, then build collections and items with the same visual language."
                                    : "This page is intentionally a placeholder. Email recovery is not connected yet."}
                        </Text>

                        {isRegister ? (
                            <View style={{ marginBottom: 8 }}>
                                <TextInput
                                    value={name}
                                    onChangeText={(value) => {
                                        setName(value);
                                        setErrors((prev) => ({ ...prev, name: "" }));
                                    }}
                                    placeholder="Full name"
                                    placeholderTextColor={colors.muted}
                                    style={inputStyle("name")}
                                />
                                <FieldError message={errors.name} />
                            </View>
                        ) : null}

                        <View style={{ marginBottom: 8 }}>
                            <TextInput
                                value={email}
                                onChangeText={(value) => {
                                    setEmail(value);
                                    setErrors((prev) => ({ ...prev, email: "" }));
                                }}
                                placeholder="Email"
                                placeholderTextColor={colors.muted}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!isForgotPassword}
                                style={inputStyle("email")}
                            />
                            <FieldError message={errors.email} />
                        </View>

                        {!isForgotPassword ? (
                            <View style={{ marginBottom: 8 }}>
                                <View style={[inputStyle("password"), { flexDirection: "row", alignItems: "center" }]}>
                                    <TextInput
                                        value={password}
                                        onChangeText={(value) => {
                                            setPassword(value);
                                            setErrors((prev) => ({ ...prev, password: "" }));
                                        }}
                                        placeholder="Password"
                                        placeholderTextColor={colors.muted}
                                        secureTextEntry={!showPassword}
                                        style={{ flex: 1, color: colors.text }}
                                    />
                                    <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                                        <Text style={{ color: colors.accent, fontWeight: "700" }}>{showPassword ? "Hide" : "Show"}</Text>
                                    </Pressable>
                                </View>
                                <FieldError message={errors.password} />
                            </View>
                        ) : null}

                        {isRegister ? (
                            <View style={{ marginBottom: 8 }}>
                                <View style={[inputStyle("confirmPassword"), { flexDirection: "row", alignItems: "center" }]}>
                                    <TextInput
                                        value={confirmPassword}
                                        onChangeText={(value) => {
                                            setConfirmPassword(value);
                                            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                                        }}
                                        placeholder="Confirm password"
                                        placeholderTextColor={colors.muted}
                                        secureTextEntry={!showConfirmPassword}
                                        style={{ flex: 1, color: colors.text }}
                                    />
                                    <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)}>
                                        <Text style={{ color: colors.accent, fontWeight: "700" }}>{showConfirmPassword ? "Hide" : "Show"}</Text>
                                    </Pressable>
                                </View>
                                <FieldError message={errors.confirmPassword} />
                            </View>
                        ) : null}

                        {formError ? <Text style={{ color: "#dc2626", marginBottom: 12 }}>{formError}</Text> : null}

                        {isForgotPassword ? (
                            <View style={[getPanelStyle(colors, { elevated: true, padding: 16 }), { marginTop: 8 }]}>
                                <Text style={[getBodyTextStyle(colors, true), { textAlign: "center" }]}>
                                    Password recovery screen placeholder. When the backend flow exists, this area can trigger the real reset process.
                                </Text>
                            </View>
                        ) : (
                            <BrandButton colors={colors} onPress={handleSubmit} disabled={isSubmitting} style={{ marginTop: 8 }}>
                                {isSubmitting ? "Please wait..." : isLogin ? "Login" : "Register"}
                            </BrandButton>
                        )}

                        {isLogin ? (
                            <Pressable onPress={() => switchMode("forgot")} style={{ marginTop: 12 }}>
                                <Text style={{ textAlign: "center", color: colors.accent, fontWeight: "700" }}>Forgot your password?</Text>
                            </Pressable>
                        ) : null}

                        {isLogin ? (
                            <Pressable onPress={() => switchMode("register")} style={{ marginTop: 16 }}>
                                <Text style={{ textAlign: "center", color: colors.text }}>
                                    No account yet? <Text style={{ color: colors.accent, fontWeight: "700" }}>Create one</Text>
                                </Text>
                            </Pressable>
                        ) : (
                            <Pressable onPress={() => switchMode("login")} style={{ marginTop: 16 }}>
                                <Text style={{ textAlign: "center", color: colors.text }}>
                                    {isRegister ? "Already have an account? " : "Back to "}
                                    <Text style={{ color: colors.accent, fontWeight: "700" }}>Login</Text>
                                </Text>
                            </Pressable>
                        )}

                        <Pressable onPress={closePopup} style={{ marginTop: 12 }}>
                            <Text style={{ textAlign: "center", color: colors.muted }}>Close</Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { requiredText, validateEmail, validatePassword } from "../validation";
export function AuthScreen({ colors, users, statusMessage, onLogin, onRegister, onContinueGuest, onQuickLogin, }) {
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
    const frameBurn = useRef(new Animated.Value(0)).current;
    const { width, height } = useWindowDimensions();
    const isLogin = mode === "login";
    const submitLabel = isLogin ? "Login" : "Register";
    const compact = height < 780;
    const heroSize = Math.min(width * 0.68, compact ? 230 : 290);
    const lighterSize = heroSize * 1.50;
    const subtitleSize = width < 390 ? 28 : 34;
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
        if (mode === "register") {
            const nameError = requiredText(name, "Name");
            if (nameError)
                nextErrors.name = nameError;
            if (confirmPassword !== password) {
                nextErrors.confirmPassword = "Passwords must match.";
            }
        }
        if (emailError)
            nextErrors.email = emailError;
        if (passwordError)
            nextErrors.password = passwordError;
        setErrors(nextErrors);
        setFormError(null);
        if (Object.keys(nextErrors).length > 0)
            return;
        setIsSubmitting(true);
        try {
            if (mode === "login") {
                const error = await onLogin(email, password);
                if (error)
                    setFormError(error);
                return;
            }
            const error = await onRegister(name, email, password);
            if (error)
                setFormError(error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <View style={{ flex: 1 }}>

          <View style={{ position: "absolute", inset: 0,  }}/>
          <View style={{ position: "absolute", inset: 0,  }}/>
          <View style={{
            position: "absolute",
            top: -120,
            left: -90,
            width: 260,
            height: 260,
            borderRadius: 999,
            backgroundColor: "rgba(127,29,29,0.34)",
        }}/>
          <View style={{
            position: "absolute",
            bottom: 120,
            right: -110,
            width: 300,
            height: 300,
            borderRadius: 999,
            backgroundColor: "rgba(249,115,22,0.12)",
        }}/>
          <Animated.View style={{
            position: "absolute",
            top: compact ? 8 : 12,
            left: compact ? 6 : 10,
            right: compact ? 6 : 10,
            bottom: compact ? 8 : 12,
            
            
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

          <View style={{ paddingHorizontal: 24, paddingTop: compact ? 44 : 72 }}>
            <View style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.18)",
            backgroundColor: "rgba(255,255,255,0.08)",
            paddingHorizontal: 12,
            paddingVertical: 6,
        }}>
              <Text style={{ color: "#000000", fontSize: 12, fontWeight: "700", letterSpacing: 1.2 }}>COLLECTOR VAULT</Text>
            </View>

            
            <Text style={{ color: "#0a0a0a", fontSize: subtitleSize, fontWeight: "600", lineHeight: subtitleSize + 4, marginTop: 10, maxWidth: "82%" }}>
              Ignite the story behind every piece
            </Text>
            <Text style={{ color: "rgba(0, 0, 0, 0.78)", fontSize: 15, lineHeight: 22, marginTop: 14, maxWidth: compact ? "88%" : "74%" }}>
              Track rare lighters, shape your collection, and compare standout finds in one premium mobile vault.
            </Text>
          </View>

<View style={{ alignItems: "center", marginTop: compact ? 19 : 24 }}>
  
    <Image
      source={require("../../../assets/images/prototypes/profile/Logo.png")}
      style={{
        margintop: "40vh",
        width: lighterSize,
        height: lighterSize,
        resizeMode: "contain",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 25 },
        shadowOpacity: 0.3,
        shadowRadius: 26,
      }}
    />

</View>

          <View style={{ flex: compact ? 0.6 : 1 }}/>

          <View style={{ paddingHorizontal: 20, paddingBottom: 22 }}>
 

            <Pressable onPress={() => openPopup("login")} style={{
            backgroundColor: "#f97316",
            borderRadius: 999,
            paddingVertical: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.18,
            shadowRadius: 18,
        }}>
              <Text style={{ textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "900" }}>Open login</Text>
            </Pressable>


          </View>
        </View>

      <Modal visible={isModalMounted} transparent animationType="none" onRequestClose={closePopup}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.bg,
            opacity: sheetAnim,
        }}/>

          <Pressable onPress={closePopup} style={{ ...StyleSheet.absoluteFillObject }}/>

          <Animated.View style={{
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
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderWidth: 1,
            borderColor: "rgba(255,184,108,0.2)",
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 20,
            minHeight: "62%",
            maxHeight: "78%",
        }}>
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Pressable onPress={closePopup} style={{ marginTop: 10 }}>
                <View style={{ width: 52, height: 5, borderRadius: 999, backgroundColor: "rgba(0, 0, 0, 0.34)" }}/>
              </Pressable>
            </View>

            <Text style={{ textAlign: "center", color: "#000000", fontSize: 34, fontWeight: "800", marginBottom: 8 }}>
              {isLogin ? "Connect to your vault" : "Create your account"}
            </Text>
            <Text style={{ textAlign: "center", color: "rgba(0, 0, 0, 0.74)", fontSize: 14, lineHeight: 20, marginBottom: 18 }}>
              {isLogin
                ? "Use your email, continue as guest, or jump in with quick access."
                : "Register once, then start cataloguing your collection with a cleaner flow."}
            </Text>

            <View style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 18,
            borderRadius: 999,
            padding: 4,
            backgroundColor: "rgba(255,255,255,0.06)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
        }}>
              <Pressable onPress={() => switchMode("login")} style={{
            flex: 1,
            borderRadius: 999,
            paddingVertical: 10,
            backgroundColor: isLogin ? "#f97316" : "transparent",
        }}>
                <Text style={{ textAlign: "center", color: "#000000", fontWeight: "800", fontSize: 14 }}>Login</Text>
              </Pressable>
              <Pressable onPress={() => switchMode("register")} style={{
            flex: 1,
            borderRadius: 999,
            paddingVertical: 10,
            backgroundColor: !isLogin ? "#f97316" : "transparent",
        }}>
                <Text style={{ textAlign: "center", color: "#000000", fontWeight: "800", fontSize: 14 }}>Register</Text>
              </Pressable>
            </View>

            {!isLogin ? (<>
                <TextInput value={name} onChangeText={(value) => {
                setName(value);
                setErrors((prev) => ({ ...prev, name: "" }));
            }} placeholder="User Name" placeholderTextColor="#a1a1aa" style={{
                color: "#000000",
                borderColor: errors.name ? "#fb7185" : "rgba(255,255,255,0.14)",
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 6,
                backgroundColor: "rgba(255,255,255,0.08)",
                fontSize: 17,
            }}/>
                {errors.name ? <Text style={{ color: "#fb7185", marginBottom: 8 }}>{errors.name}</Text> : null}
              </>) : null}

            <TextInput value={email} onChangeText={(value) => {
            setEmail(value);
            setErrors((prev) => ({ ...prev, email: "" }));
        }} placeholder="Email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#a1a1aa" style={{
            color: "#000000",
            borderColor: errors.email ? "#fb7185" : "rgba(255,255,255,0.14)",
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 6,
            backgroundColor: "rgba(255,255,255,0.08)",
            fontSize: 17,
        }}/>
            {errors.email ? <Text style={{ color: "#fb7185", marginBottom: 8 }}>{errors.email}</Text> : null}

            <View style={{
            borderColor: errors.password ? "#fb7185" : "rgba(255,255,255,0.14)",
            borderWidth: 1,
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.08)",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            marginBottom: 6,
        }}>
              <TextInput value={password} onChangeText={(value) => {
            setPassword(value);
            setErrors((prev) => ({ ...prev, password: "" }));
        }} placeholder="Password" secureTextEntry={!showPassword} placeholderTextColor="#a1a1aa" style={{ flex: 1, color: "#000000", paddingVertical: 12, fontSize: 17 }}/>
              <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                <Text style={{ color: "#fdba74", fontSize: 16, fontWeight: "700" }}>{showPassword ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
            {errors.password ? <Text style={{ color: "#fda4af", marginBottom: 8 }}>{errors.password}</Text> : null}

            {!isLogin ? (<>
                <View style={{
                borderColor: errors.confirmPassword ? "#ff1c36" : "rgba(255,255,255,0.14)",
                borderWidth: 1,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.08)",
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                marginBottom: 6,
            }}>
                  <TextInput value={confirmPassword} onChangeText={(value) => {
                setConfirmPassword(value);
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }} placeholder="Confirm Password" secureTextEntry={!showConfirmPassword} placeholderTextColor="#a1a1aa" style={{ flex: 1, color: "#000000", paddingVertical: 12, fontSize: 17 }}/>
                  <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)}>
                    <Text style={{ color: "#fdba74", fontSize: 16, fontWeight: "700" }}>{showConfirmPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                </View>
                {errors.confirmPassword ? <Text style={{ color: "#fda4af", marginBottom: 8 }}>{errors.confirmPassword}</Text> : null}
              </>) : null}

            {formError ? <Text style={{ color: "#ff1c36", marginTop: 4, marginBottom: 8 }}>{formError}</Text> : null}
            {statusMessage ? (<View style={{
                marginBottom: 8,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(253,186,116,0.18)",
                backgroundColor: "rgba(255,255,255,0.04)",
                paddingHorizontal: 12,
                paddingVertical: 10,
            }}>
                <Text style={{ color: "rgba(255,237,213,0.82)", lineHeight: 18 }}>{statusMessage}</Text>
              </View>) : null}

            <Pressable disabled={isSubmitting} onPress={handleSubmit} style={{
            backgroundColor: "#f97316",
            borderRadius: 999,
            paddingVertical: 14,
            marginTop: 18,
            opacity: isSubmitting ? 0.7 : 1,
        }}>
              <Text style={{ textAlign: "center", color: "#fff", fontSize: 19, fontWeight: "800" }}>
                {isSubmitting ? "Please wait..." : submitLabel}
              </Text>
            </Pressable>

            {isLogin ? (<Pressable style={{ marginTop: 10 }}>
                <Text style={{ textAlign: "center", color: "#fdba74", fontSize: 15 }}>Forgot your password?</Text>
              </Pressable>) : null}
            <Pressable onPress={closePopup} style={{ marginTop: 10 }}>
              <Text style={{ textAlign: "center", color: "rgba(255,237,213,0.72)", fontSize: 14 }}>Close</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>);
}

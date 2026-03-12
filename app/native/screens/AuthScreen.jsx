import { useEffect, useRef, useState } from "react";
import { Animated, Easing, ImageBackground, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
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
    const isLogin = mode === "login";
    const submitLabel = isLogin ? "Login" : "Register";
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
    const openPopup = (nextMode) => {
        setMode(nextMode);
        setErrors({});
        setFormError(null);
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
    return (<SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ImageBackground source={require("../../../assets/images/prototypes/auth-hero.png")} style={{ flex: 1 }} imageStyle={{ resizeMode: "cover" }}>
        <View style={{ flex: 1, backgroundColor: "rgba(245,245,245,0.84)" }}>
          <View style={{ paddingHorizontal: 28, paddingTop: 84 }}>
            <Text style={{ color: "#09090b", fontSize: 56, fontWeight: "900", lineHeight: 60 }}>Light It</Text>
            <Text style={{ color: "#3f3f46", fontSize: 38, fontWeight: "500", lineHeight: 40, marginTop: 12 }}>
              Bring the light to
            </Text>
            <Text style={{ color: "#3f3f46", fontSize: 38, fontWeight: "500", lineHeight: 40 }}>your collection</Text>
          </View>

          <View style={{ flex: 1 }}/>

          <View style={{ paddingHorizontal: 20, paddingBottom: 22 }}>
            <View style={{ flexDirection: "row", gap: 18 }}>
              <Pressable onPress={() => openPopup("login")} style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 999, paddingVertical: 14 }}>
                <Text style={{ textAlign: "center", color: "#fff", fontSize: 19, fontWeight: "800" }}>Login</Text>
              </Pressable>
              <Pressable onPress={() => openPopup("register")} style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 999, paddingVertical: 14 }}>
                <Text style={{ textAlign: "center", color: "#fff", fontSize: 19, fontWeight: "800" }}>Register</Text>
              </Pressable>
            </View>

            <Pressable onPress={onContinueGuest} style={{ marginTop: 12 }}>
              <Text style={{ textAlign: "center", color: "#52525b", fontSize: 14 }}>Continue as Guest</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      <Modal visible={isModalMounted} transparent animationType="none" onRequestClose={closePopup}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(17,24,39,0.38)",
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
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "#f4f4f5",
            borderWidth: 1,
            borderColor: "#e5e7eb",
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 20,
            minHeight: "62%",
            maxHeight: "78%",
        }}>
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <View style={{ width: 52, height: 5, borderRadius: 999, backgroundColor: "#d4d4d8" }}/>
            </View>

            <Text style={{ textAlign: "center", color: "#09090b", fontSize: 48, fontWeight: "800", marginBottom: 24 }}>
              {submitLabel}
            </Text>

            {!isLogin ? (<>
                <TextInput value={name} onChangeText={(value) => {
                setName(value);
                setErrors((prev) => ({ ...prev, name: "" }));
            }} placeholder="User Name" placeholderTextColor="#a1a1aa" style={{
                color: "#18181b",
                borderColor: errors.name ? "#ef4444" : "#d4d4d8",
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 6,
                backgroundColor: "#f2f2f3",
                fontSize: 20,
            }}/>
                {errors.name ? <Text style={{ color: "#dc2626", marginBottom: 8 }}>{errors.name}</Text> : null}
              </>) : null}

            <TextInput value={email} onChangeText={(value) => {
            setEmail(value);
            setErrors((prev) => ({ ...prev, email: "" }));
        }} placeholder="Email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#a1a1aa" style={{
            color: "#18181b",
            borderColor: errors.email ? "#ef4444" : "#d4d4d8",
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 6,
            backgroundColor: "#f2f2f3",
            fontSize: 20,
        }}/>
            {errors.email ? <Text style={{ color: "#dc2626", marginBottom: 8 }}>{errors.email}</Text> : null}

            <View style={{
            borderColor: errors.password ? "#ef4444" : "#d4d4d8",
            borderWidth: 1,
            borderRadius: 10,
            backgroundColor: "#f2f2f3",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            marginBottom: 6,
        }}>
              <TextInput value={password} onChangeText={(value) => {
            setPassword(value);
            setErrors((prev) => ({ ...prev, password: "" }));
        }} placeholder="Password" secureTextEntry={!showPassword} placeholderTextColor="#a1a1aa" style={{ flex: 1, color: "#18181b", paddingVertical: 12, fontSize: 20 }}/>
              <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                <Text style={{ color: "#b91c1c", fontSize: 16, fontWeight: "500" }}>{showPassword ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
            {errors.password ? <Text style={{ color: "#dc2626", marginBottom: 8 }}>{errors.password}</Text> : null}

            {!isLogin ? (<>
                <View style={{
                borderColor: errors.confirmPassword ? "#ef4444" : "#d4d4d8",
                borderWidth: 1,
                borderRadius: 10,
                backgroundColor: "#f2f2f3",
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                marginBottom: 6,
            }}>
                  <TextInput value={confirmPassword} onChangeText={(value) => {
                setConfirmPassword(value);
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }} placeholder="Confirm Password" secureTextEntry={!showConfirmPassword} placeholderTextColor="#a1a1aa" style={{ flex: 1, color: "#18181b", paddingVertical: 12, fontSize: 20 }}/>
                  <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)}>
                    <Text style={{ color: "#b91c1c", fontSize: 16, fontWeight: "500" }}>{showConfirmPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                </View>
                {errors.confirmPassword ? <Text style={{ color: "#dc2626", marginBottom: 8 }}>{errors.confirmPassword}</Text> : null}
              </>) : null}

            {formError ? <Text style={{ color: "#dc2626", marginTop: 4, marginBottom: 8 }}>{formError}</Text> : null}
            {statusMessage ? <Text style={{ color: "#52525b", marginBottom: 8 }}>{statusMessage}</Text> : null}

            <Pressable disabled={isSubmitting} onPress={handleSubmit} style={{
            backgroundColor: colors.primary,
            borderRadius: 999,
            paddingVertical: 14,
            marginTop: 24,
            opacity: isSubmitting ? 0.7 : 1,
        }}>
              <Text style={{ textAlign: "center", color: "#fff", fontSize: 19, fontWeight: "800" }}>
                {isSubmitting ? "Please wait..." : submitLabel}
              </Text>
            </Pressable>

            <Pressable onPress={isLogin ? () => setMode("register") : () => setMode("login")} style={{ marginTop: 18 }}>
              <Text style={{ textAlign: "center", color: "#b91c1c", fontSize: 15 }}>
                {isLogin ? "Don't have an account ? Become a collectionner" : "Already have an account ? Login"}
              </Text>
            </Pressable>

            {isLogin ? (<Pressable style={{ marginTop: 8 }}>
                <Text style={{ textAlign: "center", color: "#b91c1c", fontSize: 15 }}>Forgot your password?</Text>
              </Pressable>) : null}

            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <Pressable onPress={() => onQuickLogin("user")} style={{ flex: 1, borderRadius: 999, borderWidth: 1, borderColor: "#d4d4d8", paddingVertical: 8 }}>
                <Text style={{ textAlign: "center", color: "#3f3f46", fontSize: 12 }}>User</Text>
              </Pressable>
              <Pressable onPress={() => onQuickLogin("admin")} style={{ flex: 1, borderRadius: 999, borderWidth: 1, borderColor: "#d4d4d8", paddingVertical: 8 }}>
                <Text style={{ textAlign: "center", color: "#3f3f46", fontSize: 12 }}>Admin</Text>
              </Pressable>
              <Pressable onPress={() => onQuickLogin("guest")} style={{ flex: 1, borderRadius: 999, borderWidth: 1, borderColor: "#d4d4d8", paddingVertical: 8 }}>
                <Text style={{ textAlign: "center", color: "#3f3f46", fontSize: 12 }}>Guest</Text>
              </Pressable>
            </View>

            <Text style={{ color: "#71717a", marginTop: 10, fontSize: 11 }}>
              Test users: {users.map((user) => user.email).filter(Boolean).join(" | ") || "Use a valid API account."}
            </Text>

            <Pressable onPress={closePopup} style={{ marginTop: 10 }}>
              <Text style={{ textAlign: "center", color: "#52525b", fontSize: 14 }}>Close</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>);
}

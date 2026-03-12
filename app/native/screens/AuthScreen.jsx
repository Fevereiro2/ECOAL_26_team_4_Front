import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { palette } from "../palette";
import { requiredText, validateEmail, validatePassword } from "../validation";

const inputStyle = (colors, hasError) => ({
    color: colors.text,
    borderColor: hasError ? colors.error : colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 50,
    marginBottom: 8,
    backgroundColor: colors.bgElevated,
    fontSize: 16,
});

export function AuthScreen({ colors, users, statusMessage, onLogin, onRegister, onContinueGuest, onQuickLogin }) {
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
            if (finished) setIsModalMounted(false);
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
            if (nameError) nextErrors.name = nameError;
            if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords must match.";
        }
        if (emailError) nextErrors.email = emailError;
        if (passwordError) nextErrors.password = passwordError;
        setErrors(nextErrors);
        setFormError(null);
        if (Object.keys(nextErrors).length > 0) return;
        setIsSubmitting(true);
        try {
            if (mode === "login") {
                const error = await onLogin(email, password);
                if (error) setFormError(error);
                return;
            }
            const error = await onRegister(name, email, password);
            if (error) setFormError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Warm ambient halos */}
      <View style={{ position: "absolute", right: -40, top: -30, width: 220, height: 220, borderRadius: 999, backgroundColor: "rgba(232, 121, 71, 0.18)" }} />
      <View style={{ position: "absolute", left: -60, bottom: 140, width: 260, height: 260, borderRadius: 999, backgroundColor: "rgba(239, 175, 83, 0.14)" }} />

      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 28, paddingTop: 84 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2.2, marginBottom: 10 }}>
            Collector Vault
          </Text>
          <Text style={{ color: colors.text, fontSize: 48, fontWeight: "900", lineHeight: 48 }}>
            Light It
          </Text>
          <Text style={{ color: colors.muted, fontSize: 22, fontWeight: "500", lineHeight: 30, marginTop: 12 }}>
            Bring the light to{"\n"}your collection
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ paddingHorizontal: 20, paddingBottom: 22 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable onPress={() => openPopup("login")} style={{ flex: 1, backgroundColor: palette.gradient.top, borderRadius: 16, minHeight: 48, justifyContent: "center" }}>
              <Text style={{ textAlign: "center", color: colors.buttonText, fontSize: 17, fontWeight: "800" }}>Login</Text>
            </Pressable>
            <Pressable onPress={() => openPopup("register")} style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 16, minHeight: 48, justifyContent: "center" }}>
              <Text style={{ textAlign: "center", color: colors.text, fontSize: 17, fontWeight: "800" }}>Register</Text>
            </Pressable>
          </View>

          <Pressable onPress={onContinueGuest} style={{ marginTop: 14 }}>
            <Text style={{ textAlign: "center", color: colors.muted, fontSize: 14 }}>Continue as Guest</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={isModalMounted} transparent animationType="none" onRequestClose={closePopup}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.38)", opacity: sheetAnim }} />
          <Pressable onPress={closePopup} style={{ ...StyleSheet.absoluteFillObject }} />

          <Animated.View style={{
              transform: [{ translateY: sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [480, 0] }) }],
              opacity: sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
              borderTopLeftRadius: palette.radius.lg,
              borderTopRightRadius: palette.radius.lg,
              backgroundColor: colors.panel,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 20,
              minHeight: "62%",
              maxHeight: "78%",
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <View style={{ width: 52, height: 5, borderRadius: 999, backgroundColor: colors.border }} />
            </View>

            <Text style={{ textAlign: "center", color: colors.text, fontSize: 36, fontWeight: "800", marginBottom: 24 }}>
              {submitLabel}
            </Text>

            {!isLogin ? (
              <>
                <TextInput value={name} onChangeText={(v) => { setName(v); setErrors((p) => ({ ...p, name: "" })); }}
                  placeholder="User Name" placeholderTextColor={colors.muted}
                  style={inputStyle(colors, errors.name)} />
                {errors.name ? <Text style={{ color: colors.error, marginBottom: 8 }}>{errors.name}</Text> : null}
              </>
            ) : null}

            <TextInput value={email} onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: "" })); }}
              placeholder="Email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={colors.muted}
              style={inputStyle(colors, errors.email)} />
            {errors.email ? <Text style={{ color: colors.error, marginBottom: 8 }}>{errors.email}</Text> : null}

            <View style={{
                borderColor: errors.password ? colors.error : colors.border,
                borderWidth: 1, borderRadius: 16, backgroundColor: colors.bgElevated,
                flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8, minHeight: 50,
            }}>
              <TextInput value={password} onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: "" })); }}
                placeholder="Password" secureTextEntry={!showPassword} placeholderTextColor={colors.muted}
                style={{ flex: 1, color: colors.text, paddingVertical: 12, fontSize: 16 }} />
              <Pressable onPress={() => setShowPassword((p) => !p)}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>{showPassword ? "Hide" : "Show"}</Text>
              </Pressable>
            </View>
            {errors.password ? <Text style={{ color: colors.error, marginBottom: 8 }}>{errors.password}</Text> : null}

            {!isLogin ? (
              <>
                <View style={{
                    borderColor: errors.confirmPassword ? colors.error : colors.border,
                    borderWidth: 1, borderRadius: 16, backgroundColor: colors.bgElevated,
                    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8, minHeight: 50,
                }}>
                  <TextInput value={confirmPassword} onChangeText={(v) => { setConfirmPassword(v); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                    placeholder="Confirm Password" secureTextEntry={!showConfirmPassword} placeholderTextColor={colors.muted}
                    style={{ flex: 1, color: colors.text, paddingVertical: 12, fontSize: 16 }} />
                  <Pressable onPress={() => setShowConfirmPassword((p) => !p)}>
                    <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>{showConfirmPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                </View>
                {errors.confirmPassword ? <Text style={{ color: colors.error, marginBottom: 8 }}>{errors.confirmPassword}</Text> : null}
              </>
            ) : null}

            {formError ? <Text style={{ color: colors.error, marginTop: 4, marginBottom: 8 }}>{formError}</Text> : null}
            {statusMessage ? <Text style={{ color: colors.muted, marginBottom: 8 }}>{statusMessage}</Text> : null}

            <Pressable disabled={isSubmitting} onPress={handleSubmit} style={{
                backgroundColor: palette.gradient.top, borderRadius: 16, minHeight: 48,
                justifyContent: "center", marginTop: 16, opacity: isSubmitting ? 0.7 : 1,
            }}>
              <Text style={{ textAlign: "center", color: colors.buttonText, fontSize: 17, fontWeight: "800" }}>
                {isSubmitting ? "Please wait..." : submitLabel}
              </Text>
            </Pressable>

            <Pressable onPress={isLogin ? () => setMode("register") : () => setMode("login")} style={{ marginTop: 18 }}>
              <Text style={{ textAlign: "center", color: colors.primary, fontSize: 14 }}>
                {isLogin ? "Don't have an account? Become a collector" : "Already have an account? Login"}
              </Text>
            </Pressable>

            {isLogin ? (
              <Pressable style={{ marginTop: 8 }}>
                <Text style={{ textAlign: "center", color: colors.primary, fontSize: 14 }}>Forgot your password?</Text>
              </Pressable>
            ) : null}

            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              {["user", "admin", "guest"].map((quickRole) => (
                <Pressable key={quickRole} onPress={() => onQuickLogin(quickRole)}
                  style={{ flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingVertical: 10 }}>
                  <Text style={{ textAlign: "center", color: colors.muted, fontSize: 12, textTransform: "capitalize" }}>{quickRole}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ color: colors.muted, marginTop: 10, fontSize: 11 }}>
              Test users: {users.map((u) => u.email).filter(Boolean).join(" | ") || "Use a valid API account."}
            </Text>

            <Pressable onPress={closePopup} style={{ marginTop: 10, marginBottom: 8 }}>
              <Text style={{ textAlign: "center", color: colors.muted, fontSize: 14 }}>Close</Text>
            </Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
    );
}

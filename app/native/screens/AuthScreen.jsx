import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { getShadow } from "../brand";
import { Atmosphere } from "../components/Atmosphere";
import { GradientButton } from "../components/GradientButton";
import { styles } from "../styles";
import { requiredText, validateEmail, validatePassword } from "../validation";

export function AuthScreen({
  colors,
  statusMessage,
  onLogin,
  onRegister,
  onContinueGuest,
  onQuickLogin,
}) {
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

  const isLogin = mode === "login";
  const submitLabel = isLogin ? "Login" : "Create account";
  const compact = height < 780;
  const heroSize = Math.min(width * 0.72, compact ? 240 : 320);

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
      return undefined;
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

    return undefined;
  }, [isPopupOpen, sheetAnim]);

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
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
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
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
      ])
    );
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

    if (!isLogin) {
      const nameError = requiredText(name, "Name");
      if (nameError) {
        nextErrors.name = nameError;
      }
      if (confirmPassword !== password) {
        nextErrors.confirmPassword = "Passwords must match.";
      }
    }

    if (emailError) {
      nextErrors.email = emailError;
    }
    if (passwordError) {
      nextErrors.password = passwordError;
    }

    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = ({
    label,
    value,
    onChangeText,
    error,
    placeholder,
    secureTextEntry = false,
    autoCapitalize = "sentences",
    keyboardType,
    showToggle = false,
    onToggle,
    isVisible,
  }) => (
    <View style={{ marginTop: 12 }}>
      <Text style={[styles.inputLabel, { color: colors.muted }]}>{label}</Text>
      <View
        style={[
          styles.singleInput,
          {
            marginBottom: 0,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.panelSoft,
            borderColor: error ? colors.destructive : colors.border,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={{ flex: 1, color: colors.text, paddingVertical: 0 }}
        />
        {showToggle ? (
          <Pressable onPress={onToggle} style={{ marginLeft: 12, paddingVertical: 4 }}>
            <Text style={[styles.metaText, { color: colors.primary }]}>{isVisible ? "Hide" : "Show"}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.inputError, { color: colors.destructive }]}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Atmosphere colors={colors} haloScale={1.15}>
        <Animated.View
          style={{
            position: "absolute",
            right: -56,
            top: compact ? 82 : 110,
            width: 240,
            height: 240,
            borderRadius: 999,
            backgroundColor: colors.haloSoft,
            opacity: glowPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.85],
            }),
            transform: [
              {
                scale: glowPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1.1],
                }),
              },
            ],
          }}
        />

        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: compact ? 26 : 34, paddingBottom: 24 }}>
          <View style={[styles.hero, getShadow("dark", "card"), { backgroundColor: colors.panel, borderColor: colors.border, marginBottom: 0, flex: 1 }]}> 
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.accent }]}>Collector vault</Text>
                <Image
                  source={require("../../../assets/images/prototypes/profile/Logo.png")}
                  style={{ width: 164, height: 70, resizeMode: "contain" }}
                />
                <Text style={[styles.heroTitle, { color: colors.text, marginTop: 12, maxWidth: compact ? "94%" : "78%" }]}>A warm digital vault for lighter collectors.</Text>
                <Text style={[styles.heroCopy, { color: colors.muted, marginTop: 14, maxWidth: compact ? "96%" : "82%" }]}>Document rare pieces, reveal the right ones publicly, and explore other collectors through a native app designed with restraint instead of noise.</Text>
              </View>

              <Animated.View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: compact ? 12 : 20,
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
                        outputRange: ["-3deg", "3deg"],
                      }),
                    },
                  ],
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    width: heroSize * 0.72,
                    height: heroSize * 0.72,
                    borderRadius: 42,
                    backgroundColor: colors.elevated,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
                <Image
                  source={require("../../../assets/images/prototypes/lighterpng.png")}
                  style={{ width: heroSize, height: heroSize, resizeMode: "contain" }}
                />
              </Animated.View>

              <View>
                <GradientButton title="Open login" onPress={() => openPopup("login")} colors={colors} theme="dark" />
                <Pressable onPress={onContinueGuest} style={[styles.ghostBtn, { marginTop: 12, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                  <Text style={[styles.ghostBtnText, { color: colors.text }]}>Continue as guest</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <Modal visible={isModalMounted} transparent animationType="none" onRequestClose={closePopup}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Animated.View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: colors.modalBackdrop,
                opacity: sheetAnim,
              }}
            />

            <Pressable onPress={closePopup} style={{ ...StyleSheet.absoluteFillObject }} />

            <Animated.View
              style={{
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
                  outputRange: [0.65, 1],
                }),
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                backgroundColor: colors.panel,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 18,
                paddingTop: 18,
                paddingBottom: 20,
                minHeight: "62%",
                maxHeight: "84%",
              }}
            >
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
              <Text style={[styles.sectionTitle, { color: colors.text, textAlign: "center" }]}>{isLogin ? "Connect to your vault" : "Create your collector account"}</Text>
              <Text style={[styles.bodyText, { color: colors.muted, textAlign: "center", marginTop: 10 }]}>Use your email for full access, or move quickly with guest and quick-demo entry points while you prepare the API account.</Text>

              <View style={[styles.segmentedWrap, { marginTop: 18, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                <Pressable onPress={() => switchMode("login")} style={[styles.segmentedOption, isLogin && { backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border }]}> 
                  <Text style={[styles.segmentedText, { color: isLogin ? colors.text : colors.muted }]}>Login</Text>
                </Pressable>
                <Pressable onPress={() => switchMode("register")} style={[styles.segmentedOption, !isLogin && { backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border }]}> 
                  <Text style={[styles.segmentedText, { color: !isLogin ? colors.text : colors.muted }]}>Register</Text>
                </Pressable>
              </View>

              {!isLogin
                ? renderInput({
                    label: "Name",
                    value: name,
                    onChangeText: (value) => {
                      setName(value);
                      setErrors((prev) => ({ ...prev, name: "" }));
                    },
                    error: errors.name,
                    placeholder: "Collector name",
                  })
                : null}

              {renderInput({
                label: "Email",
                value: email,
                onChangeText: (value) => {
                  setEmail(value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                },
                error: errors.email,
                placeholder: "Email address",
                autoCapitalize: "none",
                keyboardType: "email-address",
              })}

              {renderInput({
                label: "Password",
                value: password,
                onChangeText: (value) => {
                  setPassword(value);
                  setErrors((prev) => ({ ...prev, password: "" }));
                },
                error: errors.password,
                placeholder: "Password",
                secureTextEntry: !showPassword,
                showToggle: true,
                onToggle: () => setShowPassword((prev) => !prev),
                isVisible: showPassword,
              })}

              {!isLogin
                ? renderInput({
                    label: "Confirm password",
                    value: confirmPassword,
                    onChangeText: (value) => {
                      setConfirmPassword(value);
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    },
                    error: errors.confirmPassword,
                    placeholder: "Confirm password",
                    secureTextEntry: !showConfirmPassword,
                    showToggle: true,
                    onToggle: () => setShowConfirmPassword((prev) => !prev),
                    isVisible: showConfirmPassword,
                  })
                : null}

              {formError ? <Text style={[styles.inputError, { color: colors.destructive, marginTop: 12 }]}>{formError}</Text> : null}

              {statusMessage ? (
                <View style={[styles.formCard, { marginTop: 14, backgroundColor: colors.panelSoft, borderColor: colors.border, padding: 14 }]}> 
                  <Text style={[styles.bodyText, { color: colors.muted }]}>{statusMessage}</Text>
                </View>
              ) : null}

              <GradientButton
                title={isSubmitting ? "Please wait..." : submitLabel}
                onPress={handleSubmit}
                disabled={isSubmitting}
                colors={colors}
                theme="dark"
                style={{ marginTop: 18 }}
              />

              <View style={{ marginTop: 14, gap: 10 }}>
                <Pressable onPress={onContinueGuest} style={[styles.ghostBtn, { borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                  <Text style={[styles.ghostBtnText, { color: colors.text }]}>Continue as guest</Text>
                </Pressable>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable onPress={() => onQuickLogin("user")} style={[styles.ghostBtn, { flex: 1, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                    <Text style={[styles.ghostBtnText, { color: colors.text, fontSize: 14 }]}>Quick user</Text>
                  </Pressable>
                  <Pressable onPress={() => onQuickLogin("admin")} style={[styles.ghostBtn, { flex: 1, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                    <Text style={[styles.ghostBtnText, { color: colors.text, fontSize: 14 }]}>Quick admin</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable onPress={closePopup} style={{ marginTop: 12, paddingVertical: 8 }}>
                <Text style={[styles.metaText, { color: colors.muted, textAlign: "center" }]}>Close</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Modal>
      </Atmosphere>
    </SafeAreaView>
  );
}
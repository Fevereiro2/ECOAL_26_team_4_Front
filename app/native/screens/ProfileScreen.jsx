import * as ImagePicker from "expo-image-picker";
import { SquarePen, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { apiRequest, ensureCollection, unwrapApiData } from "../../api/client";
import { mapApiItemToLighter, mapApiUserToAppUser } from "../../api/mappers";
import { DetailModal } from "../components/DetailModal";
import { palette } from "../palette";
import { styles } from "../styles";
import { requiredText, toSafeLighterPatch, validateEmail, validateLighterForm, validatePassword } from "../validation";
import { PublicProfileModal } from "../components/PublicProfileModal";

function toUserForm(user) {
    return {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
    };
}
function toLighterForm(lighter) {
    return {
        mechanism: lighter.mechanism,
        period: lighter.period,
        image: lighter.image,
        description: lighter.description,
        visibility: lighter.visibility,
    };
}
export function ProfileScreen({ shared }) {
    const { role, setRole, users, setUsers, lighters, setLighters, currentUserId, colors, theme, toggleTheme, authToken, refreshAppData, logout, } = shared;
    const myLighters = useMemo(() => lighters.filter((lighter) => lighter.ownerId === currentUserId), [lighters, currentUserId]);
    const currentUser = users.find((u) => u.id === currentUserId);
    const [selectedLighter, setSelectedLighter] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState(null);
    const [settingsErrors, setSettingsErrors] = useState({});
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState(null);
    const [userErrors, setUserErrors] = useState({});
    const [editingLighter, setEditingLighter] = useState(null);
    const [lighterForm, setLighterForm] = useState(null);
    const [lighterErrors, setLighterErrors] = useState({});
    const [pickerBusy, setPickerBusy] = useState(false);
    const roleText = role === "guest" ? "Guest" : role === "admin" ? "Admin Vault" : "Collector";
    const displayName = currentUser?.name ?? roleText;
    const displayBio = currentUser?.bio?.trim() || "Collector of Vintage and Rare Lighters";
    const openSettings = () => {
        setSettingsForm({
            name: currentUser?.name ?? "",
            email: currentUser?.email ?? "",
            avatar: currentUser?.avatar ?? "",
            bio: currentUser?.bio ?? "Collector of Vintage and Rare Lighters",
            password: "",
        });
        setSettingsErrors({});
        setIsSettingsOpen(true);
    };
    const saveSettings = () => {
        if (!settingsForm || !currentUser)
            return;
        const nextErrors = {};
        const nameError = requiredText(settingsForm.name, "Name");
        const emailError = validateEmail(settingsForm.email);
        if (nameError)
            nextErrors.name = nameError;
        if (emailError)
            nextErrors.email = emailError;
        if (settingsForm.password.trim().length > 0) {
            const passwordError = validatePassword(settingsForm.password);
            if (passwordError)
                nextErrors.password = passwordError;
        }
        const duplicateEmail = users.some((user) => user.id !== currentUser.id &&
            user.email &&
            user.email.toLowerCase() === settingsForm.email.trim().toLowerCase());
        if (duplicateEmail) {
            nextErrors.email = "Another user already has this email.";
        }
        setSettingsErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0)
            return;
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with your API account before updating your profile.");
            return;
        }
        apiRequest(`/users/${currentUser.id}`, {
            method: "PUT",
            token: authToken,
            body: JSON.stringify({
                name: settingsForm.name.trim(),
                email: settingsForm.email.trim().toLowerCase(),
                ...(settingsForm.password.trim() ? { password: settingsForm.password } : {}),
                avatar_url: settingsForm.avatar.trim(),
                nationality: settingsForm.bio.trim(),
            }),
        })
            .then((updated) => {
            const mapped = {
                ...mapApiUserToAppUser(unwrapApiData(updated)),
                bio: settingsForm.bio.trim(),
                avatar: settingsForm.avatar.trim(),
            };
            setUsers((prev) => prev.map((user) => (user.id === currentUser.id ? mapped : user)));
            setRole(mapped.role);
            setIsSettingsOpen(false);
            setSettingsForm(null);
            setSettingsErrors({});
            refreshAppData().catch(() => null);
        })
            .catch((error) => {
            const message = error instanceof Error ? error.message : "Unable to update your profile.";
            Alert.alert("Update failed", message);
        });
    };
    const pickPhotoFromLibrary = async () => {
        if (!settingsForm || pickerBusy)
            return;
        setPickerBusy(true);
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission needed", "Please allow gallery access to choose a profile photo.");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });
            if (!result.canceled && result.assets.length > 0) {
                setSettingsForm((prev) => (prev ? { ...prev, avatar: result.assets[0].uri } : prev));
                setSettingsErrors((prev) => ({ ...prev, avatar: "" }));
            }
        }
        finally {
            setPickerBusy(false);
        }
    };
    const takePhotoWithCamera = async () => {
        if (!settingsForm || pickerBusy)
            return;
        setPickerBusy(true);
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission needed", "Please allow camera access to take a profile photo.");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });
            if (!result.canceled && result.assets.length > 0) {
                setSettingsForm((prev) => (prev ? { ...prev, avatar: result.assets[0].uri } : prev));
                setSettingsErrors((prev) => ({ ...prev, avatar: "" }));
            }
        }
        finally {
            setPickerBusy(false);
        }
    };
    const openUserEditor = (user) => {
        setEditingUser(user);
        setUserForm(toUserForm(user));
        setUserErrors({});
    };

    const pickLighterPhoto = async () => {
        if (!lighterForm || pickerBusy) return;
        setPickerBusy(true);
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission needed", "Please allow gallery access to choose a photo.");
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });
            if (!result.canceled && result.assets.length > 0) {
                setLighterForm((prev) => (prev ? { ...prev, image: result.assets[0].uri } : prev));
                setLighterErrors((prev) => ({ ...prev, image: "" }));
            }
        } finally {
            setPickerBusy(false);
        }
    };

    const openLighterEditor = (lighter) => {
        setEditingLighter(lighter);
        setLighterForm(toLighterForm(lighter));
        setLighterErrors({});
    };
    const openCreateLighter = () => {
        setEditingLighter(null);
        setLighterForm({
            name: "",
            mechanism: "Spark wheel",
            period: "Vintage (1920-1970)",
            image: "",
            description: "",
            visibility: "private",
        });
        setLighterErrors({});
    };
    const saveUser = () => {
        if (!editingUser || !userForm)
            return;
        const errors = {};
        const nameError = requiredText(userForm.name, "Name");
        const emailError = validateEmail(userForm.email);
        const passwordError = validatePassword(userForm.password);
        if (nameError)
            errors.name = nameError;
        if (emailError)
            errors.email = emailError;
        if (passwordError)
            errors.password = passwordError;
        const duplicateEmail = users.some((user) => user.id !== editingUser.id &&
            user.email &&
            user.email.toLowerCase() === userForm.email.trim().toLowerCase());
        if (duplicateEmail) {
            errors.email = "Another user already has this email.";
        }
        setUserErrors(errors);
        if (Object.keys(errors).length > 0)
            return;
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with an authenticated account before editing users.");
            return;
        }
        apiRequest(`/users/${editingUser.id}`, {
            method: "PUT",
            token: authToken,
            body: JSON.stringify({
                name: userForm.name.trim(),
                email: userForm.email.trim().toLowerCase(),
                password: userForm.password,
                user_type: userForm.role === "admin" ? "admin" : "user",
            }),
        })
            .then((updated) => {
            const mapped = { ...mapApiUserToAppUser(unwrapApiData(updated)), password: userForm.password };
            setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? mapped : user)));
            setEditingUser(null);
            setUserForm(null);
            setUserErrors({});
            refreshAppData().catch(() => null);
        })
            .catch((error) => {
            const message = error instanceof Error ? error.message : "Unable to save this user.";
            Alert.alert("Save failed", message);
        });
    };
    const saveLighter = async () => {
        if (!lighterForm)
            return;
        const errors = validateLighterForm(lighterForm);
        setLighterErrors(errors);
        if (Object.keys(errors).length > 0)
            return;
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with your API account before editing items.");
            return;
        }
        const patch = toSafeLighterPatch(lighterForm);
        const isLocalImage = patch.image && (patch.image.startsWith("blob:") || patch.image.startsWith("file://"));
        
        let bodyPayload;
        if (isLocalImage) {
            bodyPayload = new FormData();
            bodyPayload.append("title", patch.name);
            bodyPayload.append("description", patch.description);
            bodyPayload.append("status", patch.visibility === "public" ? 1 : 0);
            bodyPayload.append("category1_id", 1); // Mocked for now

            // Fetch the blob to append as a file
            const imgRes = await fetch(patch.image);
            const imgBlob = await imgRes.blob();
            // Use a dummy filename, Laravel will rename it anyway
            bodyPayload.append("image", imgBlob, "upload.jpg"); 
            
            // To emulate PUT with FormData in Laravel, we need to POST and send _method=PUT
            if (editingLighter) {
                bodyPayload.append("_method", "PUT");
            }
        } else {
            bodyPayload = JSON.stringify({
                title: patch.name,
                description: patch.description,
                image_url: patch.image,
                status: patch.visibility === "public",
                category1_id: 1,
                category2_id: null,
            });
        }

        try {
            const { image: temporaryImage, ...safePatch } = patch;
            
            if (editingLighter) {
                const updated = await apiRequest(`/items/${editingLighter.id}`, {
                    method: isLocalImage ? "POST" : "PUT", // Laravel requires POST with _method=PUT for FormData
                    token: authToken,
                    body: bodyPayload,
                });
                const mapped = { ...mapApiItemToLighter(unwrapApiData(updated)), ownerId: editingLighter.ownerId, ...safePatch };
                setLighters((prev) => prev.map((lighter) => (lighter.id === editingLighter.id ? mapped : lighter)));
            }
            else {
                try {
                    const created = await apiRequest("/items", {
                        method: "POST",
                        token: authToken,
                        body: bodyPayload,
                    });
                    const mapped = { ...mapApiItemToLighter(unwrapApiData(created)), ownerId: currentUserId, ...safePatch };
                    setLighters((prev) => [mapped, ...prev]);
                } catch (firstError) {
                    if (firstError instanceof Error && firstError.status === 403) {
                        await ensureCollection(authToken);
                        const created = await apiRequest("/items", {
                            method: "POST",
                            token: authToken,
                            body: bodyPayload,
                        });
                        const mapped = { ...mapApiItemToLighter(unwrapApiData(created)), ownerId: currentUserId, ...safePatch };
                        setLighters((prev) => [mapped, ...prev]);
                    } else {
                        throw firstError;
                    }
                }
            }
            setEditingLighter(null);
            setLighterForm(null);
            setLighterErrors({});
            refreshAppData().catch(() => null);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to save this item.";
            Alert.alert("Save failed", message);
        }
    };
    const deleteUser = (id) => {
        if (id === currentUserId)
            return;
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with an authenticated account before deleting users.");
            return;
        }
        apiRequest(`/users/${id}`, {
            method: "DELETE",
            token: authToken,
        })
            .then(() => {
            setUsers((prev) => prev.filter((user) => user.id !== id));
            setLighters((prev) => prev.filter((lighter) => lighter.ownerId !== id));
            refreshAppData().catch(() => null);
        })
            .catch((error) => {
            const message = error instanceof Error ? error.message : "Unable to delete this user.";
            Alert.alert("Delete failed", message);
        });
    };
    const deleteLighter = (id) => {
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with your API account before deleting items.");
            return;
        }
        apiRequest(`/items/${id}`, {
            method: "DELETE",
            token: authToken,
        })
            .then(() => {
            setLighters((prev) => prev.filter((lighter) => lighter.id !== id));
            if (selectedLighter?.id === id)
                setSelectedLighter(null);
            refreshAppData().catch(() => null);
        })
            .catch((error) => {
            const message = error instanceof Error ? error.message : "Unable to delete this item.";
            Alert.alert("Delete failed", message);
        });
    };
    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* ── Profile header card ──────────── */}
        <View style={[styles.profileCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, width: "100%" }}>
            <Image
              source={currentUser?.avatar?.trim() ? { uri: currentUser.avatar } : require("../../../assets/images/prototypes/profile/posts.png")}
              style={[styles.profileAvatar, { borderWidth: 2, borderColor: colors.border }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.text, marginTop: 0 }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.72}>
                {displayName}
              </Text>
              <Text style={{ color: colors.accent, fontSize: 13, marginTop: 2, textTransform: "capitalize" }}>{roleText}</Text>
            </View>
            <Pressable onPress={openSettings} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>Settings</Text>
            </Pressable>
          </View>
          <Text style={{ color: colors.muted, marginTop: 12, lineHeight: 22, alignSelf: "flex-start" }}>{displayBio}</Text>
        </View>

        {/* ── Stat row ─────────────────── */}
        <View style={{ flexDirection: "row", marginBottom: 14 }}>
          <View style={[styles.stat, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Collection</Text>
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>{myLighters.length}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.panel, borderColor: colors.border, marginRight: 0 }]}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Public</Text>
            <Text style={{ color: colors.accent, fontSize: 20, fontWeight: "700" }}>
              {myLighters.filter((l) => l.visibility === "public").length}
            </Text>
          </View>
        </View>

        {/* ── Add lighter CTA ───────────── */}
        {role !== "guest" ? (
          <Pressable onPress={openCreateLighter} style={{ marginBottom: 12, borderRadius: 16, backgroundColor: palette.gradient.top, minHeight: 48, justifyContent: "center" }}>
            <Text style={{ textAlign: "center", color: colors.buttonText, fontSize: 16, fontWeight: "700" }}>Add Lighter to My Collection</Text>
          </Pressable>
        ) : null}

        {/* ── Empty state ───────────────── */}
        {myLighters.length === 0 ? (
          <View style={[styles.emptyWrap, { backgroundColor: colors.panel, borderColor: colors.border, margin: 0 }]}>
            <Text style={{ color: colors.muted, fontSize: 15, textAlign: "center" }}>
              No lighters found in this section yet.
            </Text>
          </View>
        ) : null}

        {/* ── Lighter list ──────────────── */}
        {myLighters.map((lighter) => (
          <View key={lighter.id} style={[styles.listRow, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Pressable onPress={() => setSelectedLighter(lighter)} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Image source={{ uri: lighter.image }} style={{ width: 48, height: 48, borderRadius: palette.radius.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }} numberOfLines={1}>{lighter.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{lighter.period} • {lighter.mechanism}</Text>
              </View>
            </Pressable>
            {lighter.ownerId === currentUserId ? (
              <View style={{ flexDirection: "row", gap: 12, marginLeft: 8 }}>
                <Pressable onPress={() => openLighterEditor(lighter)}>
                  <SquarePen color={colors.text} size={18} />
                </Pressable>
                <Pressable onPress={() => Alert.alert("Delete Lighter", "Are you sure you want to delete this lighter?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteLighter(lighter.id) },
                ])}>
                  <Trash2 color={colors.error} size={18} />
                </Pressable>
              </View>
            ) : null}
          </View>
        ))}

        {/* ── Admin: users + products ───── */}
        {role === "admin" ? (
          <>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", marginTop: 18, marginBottom: 10 }}>Admin Users</Text>
            {users.map((user) => (
              <View key={user.id} style={[styles.listRow, { backgroundColor: colors.panel, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{user.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>{user.email || "Public user record"}</Text>
                  <Text style={{ color: colors.accent, textTransform: "capitalize", fontSize: 12 }}>{user.role}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable onPress={() => openUserEditor(user)}>
                    <SquarePen color={colors.text} size={18} />
                  </Pressable>
                  <Pressable onPress={() => deleteUser(user.id)}>
                    <Trash2 color={colors.error} size={18} />
                  </Pressable>
                </View>
              </View>
            ))}

            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", marginTop: 12, marginBottom: 10 }}>Admin Products</Text>
            {lighters.map((lighter) => (
              <View key={lighter.id} style={[styles.listRow, { backgroundColor: colors.panel, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{lighter.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>{lighter.brand} • {lighter.year}</Text>
                  <Text style={{ color: colors.accent, fontSize: 12 }}>Owner: {lighter.ownerId}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable onPress={() => openLighterEditor(lighter)}>
                    <SquarePen color={colors.text} size={18} />
                  </Pressable>
                  <Pressable onPress={() => deleteLighter(lighter.id)}>
                    <Trash2 color={colors.error} size={18} />
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>

      {/* ── Settings modal ─────────────── */}
      <Modal visible={isSettingsOpen && !!settingsForm} transparent animationType="slide" onRequestClose={() => setIsSettingsOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => setIsSettingsOpen(false)} />
          <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800", marginBottom: 8 }}>Settings</Text>

            {settingsForm ? (
              <>
                {[
                  ["name", "Display Name"],
                  ["email", "Email"],
                  ["avatar", "Profile Photo URL"],
                  ["bio", "Bio"],
                  ["password", "New Password (optional)"],
                ].map(([field, label]) => (
                  <View key={field} style={{ marginTop: 10 }}>
                    <Text style={{ color: colors.muted, marginBottom: 4 }}>{label}</Text>
                    <TextInput
                      value={settingsForm[field]}
                      onChangeText={(value) => {
                        setSettingsForm((prev) => (prev ? { ...prev, [field]: value } : prev));
                        setSettingsErrors((prev) => ({ ...prev, [field]: "" }));
                      }}
                      autoCapitalize={field === "email" || field === "avatar" ? "none" : "sentences"}
                      secureTextEntry={field === "password"}
                      multiline={field === "bio"}
                      style={{
                        color: colors.text,
                        borderColor: settingsErrors[field] ? colors.error : colors.border,
                        borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, minHeight: 50,
                        backgroundColor: colors.bgElevated,
                        ...(field === "bio" ? { minHeight: 84, textAlignVertical: "top" } : {}),
                      }}
                    />
                    {settingsErrors[field] ? <Text style={{ color: colors.error, marginTop: 4 }}>{settingsErrors[field]}</Text> : null}
                  </View>
                ))}

                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.muted, marginBottom: 6 }}>Photo Picker</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable onPress={pickPhotoFromLibrary} style={{ flex: 1, borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border, minHeight: 48, justifyContent: "center", backgroundColor: colors.bgElevated }}>
                      <Text style={{ textAlign: "center", color: colors.text, fontWeight: "600" }}>
                        {pickerBusy ? "Opening..." : "Gallery"}
                      </Text>
                    </Pressable>
                    <Pressable onPress={takePhotoWithCamera} style={{ flex: 1, borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border, minHeight: 48, justifyContent: "center", backgroundColor: colors.bgElevated }}>
                      <Text style={{ textAlign: "center", color: colors.text, fontWeight: "600" }}>
                        {pickerBusy ? "Opening..." : "Camera"}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => setSettingsForm((prev) => (prev ? { ...prev, avatar: "" } : prev))} style={{ marginTop: 8, borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border, minHeight: 44, justifyContent: "center", backgroundColor: colors.bgElevated }}>
                    <Text style={{ textAlign: "center", color: colors.muted, fontWeight: "600" }}>Use Default Photo</Text>
                  </Pressable>
                </View>

                <View style={{ marginTop: 12, alignItems: "center" }}>
                  <Image
                    source={settingsForm.avatar.trim() ? { uri: settingsForm.avatar } : require("../../../assets/images/prototypes/profile/posts.png")}
                    style={[styles.profileAvatar, { borderWidth: 2, borderColor: colors.border }]}
                  />
                </View>

                <Pressable onPress={saveSettings} style={[styles.closeBtn, { backgroundColor: palette.gradient.top, marginTop: 14 }]}>
                  <Text style={{ color: colors.buttonText, fontWeight: "800", fontSize: 16 }}>Save Profile</Text>
                </Pressable>

                <Pressable onPress={toggleTheme} style={{ marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 16, minHeight: 48, justifyContent: "center" }}>
                  <Text style={{ textAlign: "center", color: colors.text, fontWeight: "700" }}>
                    {theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
                  </Text>
                </Pressable>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  {["guest", "user", "admin"].map((quickRole) => (
                    <Pressable key={quickRole} onPress={() => setRole(quickRole)} style={{
                      flex: 1, borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border,
                      paddingVertical: 10, backgroundColor: role === quickRole ? palette.gradient.top : "transparent",
                    }}>
                      <Text style={{ textAlign: "center", color: role === quickRole ? colors.buttonText : colors.text, textTransform: "capitalize" }}>{quickRole}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable onPress={logout} style={{ marginTop: 10, borderWidth: 1, borderColor: colors.error, borderRadius: 16, minHeight: 48, justifyContent: "center" }}>
                  <Text style={{ textAlign: "center", color: colors.error, fontWeight: "700" }}>Logout</Text>
                </Pressable>

                <Pressable onPress={() => setIsSettingsOpen(false)} style={{ marginTop: 10, marginBottom: 8 }}>
                  <Text style={{ textAlign: "center", color: colors.muted }}>Close</Text>
                </Pressable>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

      {/* ── Edit user modal (admin) ────── */}
      <Modal visible={!!editingUser && !!userForm} transparent animationType="slide" onRequestClose={() => setEditingUser(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => setEditingUser(null)} />
          <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800" }}>Edit User</Text>
            {userForm ? (
              <>
                {[["name", "Name"], ["email", "Email"], ["password", "Password"]].map(([field, label]) => (
                  <View key={field} style={{ marginTop: 10 }}>
                    <Text style={{ color: colors.muted, marginBottom: 4 }}>{label}</Text>
                    <TextInput
                      value={userForm[field]}
                      onChangeText={(v) => { setUserForm((p) => (p ? { ...p, [field]: v } : p)); setUserErrors((p) => ({ ...p, [field]: "" })); }}
                      secureTextEntry={field === "password"} autoCapitalize={field === "email" ? "none" : "sentences"}
                      style={{ color: colors.text, borderColor: userErrors[field] ? colors.error : colors.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, minHeight: 50, backgroundColor: colors.bgElevated }}
                    />
                    {userErrors[field] ? <Text style={{ color: colors.error, marginTop: 4 }}>{userErrors[field]}</Text> : null}
                  </View>
                ))}
                <Text style={{ color: colors.muted, marginTop: 10, marginBottom: 4 }}>Role</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["guest", "user", "admin"].map((candidateRole) => (
                    <Pressable key={candidateRole} onPress={() => setUserForm((p) => (p ? { ...p, role: candidateRole } : p))} style={{
                      flex: 1, borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border, paddingVertical: 10,
                      backgroundColor: userForm.role === candidateRole ? palette.gradient.top : "transparent",
                    }}>
                      <Text style={{ textAlign: "center", color: userForm.role === candidateRole ? colors.buttonText : colors.text, textTransform: "capitalize" }}>
                        {candidateRole}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={saveUser} style={[styles.closeBtn, { backgroundColor: palette.gradient.top }]}>
                  <Text style={{ textAlign: "center", color: colors.buttonText, fontWeight: "700" }}>Save User</Text>
                </Pressable>
                <Pressable onPress={() => setEditingUser(null)} style={[styles.closeBtn, { backgroundColor: colors.bgElevated }]}>
                  <Text style={{ textAlign: "center", color: colors.text, fontWeight: "700" }}>Cancel</Text>
                </Pressable>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

      <DetailModal 
        item={selectedLighter} 
        onClose={() => setSelectedLighter(null)} 
        colors={colors} 
        user={selectedLighter ? users.find((u) => u.id === selectedLighter.ownerId) : null}
        onViewUser={(user) => {
            setSelectedLighter(null);
            setViewingUser(user);
        }}
      />
      <PublicProfileModal
        user={viewingUser}
        lighters={lighters}
        onClose={() => setViewingUser(null)}
        colors={colors}
      />

      {/* ── Edit lighter modal ─────────── */}
      <Modal visible={!!lighterForm} transparent animationType="slide" onRequestClose={() => { setEditingLighter(null); setLighterForm(null); }}>
        <View style={styles.modalBackdrop}>
          <Pressable style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => { setEditingLighter(null); setLighterForm(null); }} />
          <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800" }}>{editingLighter ? "Edit Product" : "Add Product"}</Text>
            {lighterForm ? (
              <>
                {[
                  ["name", "Name"], ["description", "Description"],
                ].map(([field, label]) => (
                  <View key={field} style={{ marginTop: 10 }}>
                    <Text style={{ color: colors.muted, marginBottom: 4 }}>{label}</Text>
                    <TextInput
                      value={lighterForm[field]}
                      onChangeText={(v) => { setLighterForm((p) => (p ? { ...p, [field]: v } : p)); setLighterErrors((p) => ({ ...p, [field]: "" })); }}
                      multiline={field === "description"}
                      style={{
                        color: colors.text, borderColor: lighterErrors[field] ? colors.error : colors.border,
                        borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, minHeight: 50, backgroundColor: colors.bgElevated,
                        ...(field === "description" ? { minHeight: 90, textAlignVertical: "top" } : {}),
                      }}
                    />
                    {lighterErrors[field] ? <Text style={{ color: colors.error, marginTop: 4 }}>{lighterErrors[field]}</Text> : null}
                  </View>
                ))}

                <View style={{ marginTop: 12 }}>
                    <Text style={{ color: colors.muted, marginBottom: 4 }}>Period</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {["Antique (Pre-1920)", "Vintage (1920-1970)", "Modern (1970+)"].map(opt => (
                            <Pressable key={opt} onPress={() => setLighterForm(p => p ? { ...p, period: opt } : p)}
                              style={{ borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: lighterForm.period === opt ? palette.gradient.top : "transparent" }}>
                                <Text style={{ color: lighterForm.period === opt ? colors.buttonText : colors.text }}>{opt}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={{ marginTop: 12 }}>
                    <Text style={{ color: colors.muted, marginBottom: 4 }}>Mechanism</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {["Spark wheel", "Piezoelectric", "Electric arc", "Friction"].map(opt => (
                            <Pressable key={opt} onPress={() => setLighterForm(p => p ? { ...p, mechanism: opt } : p)}
                              style={{ borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: lighterForm.mechanism === opt ? palette.gradient.top : "transparent" }}>
                                <Text style={{ color: lighterForm.mechanism === opt ? colors.buttonText : colors.text }}>{opt}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.muted, marginBottom: 4 }}>Image</Text>
                  <Pressable onPress={pickLighterPhoto} style={{ borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border, minHeight: 48, justifyContent: "center", backgroundColor: colors.bgElevated }}>
                    <Text style={{ textAlign: "center", color: colors.text, fontWeight: "600" }}>
                      {lighterForm.image ? "Change Image" : "Select Image from Gallery"}
                    </Text>
                  </Pressable>
                  {lighterForm.image ? (
                      <Image source={{ uri: lighterForm.image }} style={{ width: "100%", height: 160, borderRadius: 12, marginTop: 8 }} />
                  ) : null}
                  {lighterErrors.image ? <Text style={{ color: colors.error, marginTop: 4 }}>{lighterErrors.image}</Text> : null}
                </View>

                <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
                  {["private", "public"].map((vis) => (
                    <Pressable key={vis} onPress={() => setLighterForm((p) => (p ? { ...p, visibility: vis } : p))} style={{
                      flex: 1, borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border,
                      backgroundColor: lighterForm.visibility === vis ? palette.gradient.top : "transparent", paddingVertical: 10,
                    }}>
                      <Text style={{ textAlign: "center", color: lighterForm.visibility === vis ? colors.buttonText : colors.text, textTransform: "capitalize" }}>{vis}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable onPress={saveLighter} style={[styles.closeBtn, { backgroundColor: palette.gradient.top }]}>
                  <Text style={{ textAlign: "center", color: colors.buttonText, fontWeight: "700" }}>{editingLighter ? "Save Changes" : "Create Lighter"}</Text>
                </Pressable>
                <Pressable onPress={() => { setEditingLighter(null); setLighterForm(null); }} style={[styles.closeBtn, { backgroundColor: colors.bgElevated }]}>
                  <Text style={{ textAlign: "center", color: colors.text, fontWeight: "700" }}>Cancel</Text>
                </Pressable>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
    );
}

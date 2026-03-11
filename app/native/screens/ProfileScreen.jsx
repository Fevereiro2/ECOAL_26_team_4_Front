import * as ImagePicker from "expo-image-picker";
import { SquarePen, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { apiRequest, unwrapApiData } from "../../api/client";
import { mapApiItemToLighter, mapApiUserToAppUser } from "../../api/mappers";
import { DetailModal } from "../components/DetailModal";
import { requiredText, toSafeLighterPatch, validateEmail, validateLighterForm, validatePassword, } from "../validation";
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
        name: lighter.name,
        brand: lighter.brand,
        year: String(lighter.year),
        country: lighter.country,
        mechanism: lighter.mechanism,
        period: lighter.period,
        image: lighter.image,
        description: lighter.description,
        visibility: lighter.visibility,
    };
}
export function ProfileScreen({ shared }) {
    const { role, setRole, users, setUsers, lighters, setLighters, currentUserId, colors, theme, toggleTheme, authToken, refreshAppData, logout, } = shared;
    const [tab, setTab] = useState("collection");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState(null);
    const [settingsErrors, setSettingsErrors] = useState({});
    const [pickerBusy, setPickerBusy] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingLighter, setEditingLighter] = useState(null);
    const [selectedLighter, setSelectedLighter] = useState(null);
    const [userForm, setUserForm] = useState(null);
    const [lighterForm, setLighterForm] = useState(null);
    const [userErrors, setUserErrors] = useState({});
    const [lighterErrors, setLighterErrors] = useState({});
    const currentUser = users.find((user) => user.id === currentUserId);
    const myLighters = useMemo(() => lighters.filter((lighter) => lighter.ownerId === currentUserId), [lighters, currentUserId]);
    const mostWanted = useMemo(() => lighters.filter((lighter) => lighter.ownerId !== currentUserId && lighter.visibility === "public"), [lighters, currentUserId]);
    const listToRender = tab === "collection" ? myLighters : mostWanted;
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
    const openLighterEditor = (lighter) => {
        setEditingLighter(lighter);
        setLighterForm(toLighterForm(lighter));
        setLighterErrors({});
    };
    const openCreateLighter = () => {
        setEditingLighter(null);
        setLighterForm({
            name: "",
            brand: "",
            year: `${new Date().getFullYear()}`,
            country: "",
            mechanism: "",
            period: "",
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
        const payload = {
            title: patch.name,
            description: patch.description,
            image_url: patch.image,
            status: patch.visibility === "public",
            category1_id: 1,
            category2_id: null,
        };
        try {
            if (editingLighter) {
                const updated = await apiRequest(`/items/${editingLighter.id}`, {
                    method: "PUT",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                const mapped = { ...mapApiItemToLighter(unwrapApiData(updated)), ownerId: editingLighter.ownerId, ...patch };
                setLighters((prev) => prev.map((lighter) => (lighter.id === editingLighter.id ? mapped : lighter)));
            }
            else {
                const created = await apiRequest("/items", {
                    method: "POST",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                const mapped = { ...mapApiItemToLighter(unwrapApiData(created)), ownerId: currentUserId, ...patch };
                setLighters((prev) => [mapped, ...prev]);
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
    return (<SafeAreaView style={{ flex: 1, backgroundColor: "#ececec" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ marginHorizontal: -16, marginTop: -16, backgroundColor: "#b8121c", padding: 18, paddingBottom: 64 }}>
          <View style={{ alignItems: "flex-end" }}>
            <Pressable onPress={openSettings}>
              <Text style={{ color: "#fff", fontSize: 32, fontWeight: "500" }}>Settings</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 16, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <Image source={currentUser?.avatar?.trim() ? { uri: currentUser.avatar } : require("../../../assets/images/prototypes/profile/posts.png")} style={{ width: 160, height: 160, borderRadius: 999, borderWidth: 3, borderColor: "#fff", marginBottom: -78 }}/>
            <Text style={{
            color: "#fff",
            fontSize: 44,
            fontWeight: "800",
            lineHeight: 46,
            textAlign: "right",
            maxWidth: "56%",
            flexShrink: 1,
        }} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.72}>
              {displayName}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", marginTop: 34, marginBottom: 18 }}>
          <Text style={{ color: "#111", fontSize: 27, fontWeight: "600", lineHeight: 32, textAlign: "right", maxWidth: "78%" }}>
            {displayBio}
          </Text>
        </View>

        <View style={{ borderRadius: 999, borderWidth: 1, borderColor: "#dbdbdb", backgroundColor: "#e6e6e6", padding: 3, flexDirection: "row", marginBottom: 16 }}>
          <Pressable onPress={() => setTab("collection")} style={{ flex: 1, borderRadius: 999, paddingVertical: 12, backgroundColor: tab === "collection" ? "#f7f7f7" : "transparent", borderWidth: tab === "collection" ? 1 : 0, borderColor: "#c81e1e" }}>
            <Text style={{ textAlign: "center", color: tab === "collection" ? "#c81e1e" : "#a3a3a3", fontSize: 18, fontWeight: "700" }}>
              My Collection
            </Text>
          </Pressable>
          <Pressable onPress={() => setTab("wanted")} style={{ flex: 1, borderRadius: 999, paddingVertical: 12, backgroundColor: tab === "wanted" ? "#f7f7f7" : "transparent" }}>
            <Text style={{ textAlign: "center", color: tab === "wanted" ? "#8b5e43" : "#a3a3a3", fontSize: 18, fontWeight: "700" }}>
              Most Wanted
            </Text>
          </Pressable>
        </View>

        {tab === "collection" && role !== "guest" ? (<Pressable onPress={openCreateLighter} style={{ marginBottom: 12, borderRadius: 999, backgroundColor: "#8b5e43", paddingVertical: 12 }}>
            <Text style={{ textAlign: "center", color: "#fff", fontSize: 17, fontWeight: "700" }}>Add Lighter to My Collection</Text>
          </Pressable>) : null}

        {listToRender.length === 0 ? (<View style={{ borderRadius: 18, backgroundColor: "#f8f8f8", borderWidth: 1, borderColor: "#dfdfdf", padding: 20 }}>
            <Text style={{ color: "#737373", fontSize: 16, textAlign: "center" }}>
              No lighters found in this section yet.
            </Text>
          </View>) : null}

        {listToRender.map((lighter) => (<View key={lighter.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: "#dfdfdf", backgroundColor: "#f8f8f8", padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Pressable onPress={() => setSelectedLighter(lighter)} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <Image source={{ uri: lighter.image }} style={{ width: 42, height: 42, borderRadius: 6, marginRight: 12 }}/>
              <Text style={{ color: "#111", fontSize: 19, fontWeight: "700", flex: 1 }} numberOfLines={1}>
                {lighter.name}
              </Text>
            </Pressable>

            {tab === "collection" && lighter.ownerId === currentUserId ? (<View style={{ flexDirection: "row", gap: 12, marginLeft: 8 }}>
                <Pressable onPress={() => openLighterEditor(lighter)}>
                  <SquarePen color="#111" size={18}/>
                </Pressable>
                <Pressable onPress={() => Alert.alert("Delete Lighter", "Are you sure you want to delete this lighter?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteLighter(lighter.id) },
                ])}>
                  <Trash2 color="#ef4444" size={18}/>
                </Pressable>
              </View>) : null}
          </View>))}

        {role === "admin" ? (<>
            <Text style={{ color: "#111", fontSize: 22, fontWeight: "800", marginTop: 18, marginBottom: 10 }}>Admin Users</Text>
            {users.map((user) => (<View key={user.id} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, marginBottom: 10, backgroundColor: colors.panel, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{user.name}</Text>
                  <Text style={{ color: colors.muted }}>{user.email || "Public user record"}</Text>
                  <Text style={{ color: colors.primary, textTransform: "capitalize" }}>{user.role}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable onPress={() => openUserEditor(user)}>
                    <SquarePen color={colors.text} size={18}/>
                  </Pressable>
                  <Pressable onPress={() => deleteUser(user.id)}>
                    <Trash2 color="#ef4444" size={18}/>
                  </Pressable>
                </View>
              </View>))}

            <Text style={{ color: "#111", fontSize: 22, fontWeight: "800", marginTop: 12, marginBottom: 10 }}>Admin Products</Text>
            {lighters.map((lighter) => (<View key={lighter.id} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, marginBottom: 10, backgroundColor: colors.panel, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{lighter.name}</Text>
                  <Text style={{ color: colors.muted }}>{lighter.brand} • {lighter.year}</Text>
                  <Text style={{ color: colors.primary }}>Owner: {lighter.ownerId}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable onPress={() => openLighterEditor(lighter)}>
                    <SquarePen color={colors.text} size={18}/>
                  </Pressable>
                  <Pressable onPress={() => deleteLighter(lighter.id)}>
                    <Trash2 color="#ef4444" size={18}/>
                  </Pressable>
                </View>
              </View>))}
          </>) : null}
      </ScrollView>

      <Modal visible={isSettingsOpen && !!settingsForm} transparent animationType="slide" onRequestClose={() => setIsSettingsOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" }}>
          <ScrollView style={{ maxHeight: "84%", backgroundColor: "#f4f4f5", borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
            <Text style={{ color: "#111", fontSize: 30, fontWeight: "800", marginBottom: 8 }}>Settings</Text>

            {settingsForm ? (<>
                {[
                ["name", "Display Name"],
                ["email", "Email"],
                ["avatar", "Profile Photo URL"],
                ["bio", "Bio"],
                ["password", "New Password (optional)"],
            ].map(([field, label]) => (<View key={field} style={{ marginTop: 10 }}>
                    <Text style={{ color: "#52525b", marginBottom: 4 }}>{label}</Text>
                    <TextInput value={settingsForm[field]} onChangeText={(value) => {
                    setSettingsForm((prev) => (prev ? { ...prev, [field]: value } : prev));
                    setSettingsErrors((prev) => ({ ...prev, [field]: "" }));
                }} autoCapitalize={field === "email" || field === "avatar" ? "none" : "sentences"} secureTextEntry={field === "password"} multiline={field === "bio"} style={{ color: "#111", borderColor: settingsErrors[field] ? "#ef4444" : "#d4d4d8", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fdfdfd", minHeight: field === "bio" ? 84 : undefined, textAlignVertical: field === "bio" ? "top" : "center" }}/>
                    {settingsErrors[field] ? <Text style={{ color: "#dc2626", marginTop: 4 }}>{settingsErrors[field]}</Text> : null}
                  </View>))}

                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: "#52525b", marginBottom: 6 }}>Photo Picker</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable onPress={pickPhotoFromLibrary} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: "#d4d4d8", paddingVertical: 10, backgroundColor: "#fff" }}>
                      <Text style={{ textAlign: "center", color: "#111", fontWeight: "600" }}>
                        {pickerBusy ? "Opening..." : "Choose from Gallery"}
                      </Text>
                    </Pressable>
                    <Pressable onPress={takePhotoWithCamera} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: "#d4d4d8", paddingVertical: 10, backgroundColor: "#fff" }}>
                      <Text style={{ textAlign: "center", color: "#111", fontWeight: "600" }}>
                        {pickerBusy ? "Opening..." : "Take Photo"}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => setSettingsForm((prev) => (prev ? { ...prev, avatar: "" } : prev))} style={{ marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: "#d4d4d8", paddingVertical: 10, backgroundColor: "#fff" }}>
                    <Text style={{ textAlign: "center", color: "#52525b", fontWeight: "600" }}>Use Default Photo</Text>
                  </Pressable>
                </View>

                <View style={{ marginTop: 10, alignItems: "center" }}>
                  <Image source={settingsForm.avatar.trim() ? { uri: settingsForm.avatar } : require("../../../assets/images/prototypes/profile/posts.png")} style={{ width: 104, height: 104, borderRadius: 999, borderWidth: 2, borderColor: "#d4d4d8" }}/>
                </View>

                <Pressable onPress={saveSettings} style={{ marginTop: 14, backgroundColor: "#b8121c", borderRadius: 999, paddingVertical: 13 }}>
                  <Text style={{ textAlign: "center", color: "#fff", fontWeight: "800", fontSize: 18 }}>Save Profile</Text>
                </Pressable>

                <Pressable onPress={toggleTheme} style={{ marginTop: 10, borderWidth: 1, borderColor: "#d4d4d8", borderRadius: 999, paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", color: "#111", fontWeight: "700" }}>
                    {theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
                  </Text>
                </Pressable>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  {["guest", "user", "admin"].map((quickRole) => (<Pressable key={quickRole} onPress={() => setRole(quickRole)} style={{ flex: 1, borderRadius: 999, borderWidth: 1, borderColor: "#d4d4d8", paddingVertical: 10, backgroundColor: role === quickRole ? "#b8121c" : "transparent" }}>
                      <Text style={{ textAlign: "center", color: role === quickRole ? "#fff" : "#111", textTransform: "capitalize" }}>{quickRole}</Text>
                    </Pressable>))}
                </View>

                <Pressable onPress={logout} style={{ marginTop: 10, borderWidth: 1, borderColor: "#ef4444", borderRadius: 999, paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", color: "#ef4444", fontWeight: "700" }}>Logout</Text>
                </Pressable>

                <Pressable onPress={() => setIsSettingsOpen(false)} style={{ marginTop: 10 }}>
                  <Text style={{ textAlign: "center", color: "#52525b" }}>Close</Text>
                </Pressable>
              </>) : null}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={!!editingUser && !!userForm} transparent animationType="slide" onRequestClose={() => setEditingUser(null)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" }}>
          <ScrollView style={{ maxHeight: "84%", backgroundColor: colors.panel, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>Edit User</Text>
            {userForm ? (<>
                {[
                ["name", "Name"],
                ["email", "Email"],
                ["password", "Password"],
            ].map(([field, label]) => (<View key={field} style={{ marginTop: 10 }}>
                    <Text style={{ color: colors.muted, marginBottom: 4 }}>{label}</Text>
                    <TextInput value={userForm[field]} onChangeText={(value) => {
                    setUserForm((prev) => (prev ? { ...prev, [field]: value } : prev));
                    setUserErrors((prev) => ({ ...prev, [field]: "" }));
                }} secureTextEntry={field === "password"} autoCapitalize={field === "email" ? "none" : "sentences"} style={{ color: colors.text, borderColor: userErrors[field] ? "#ef4444" : colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}/>
                    {userErrors[field] ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{userErrors[field]}</Text> : null}
                  </View>))}

                <Text style={{ color: colors.muted, marginTop: 10, marginBottom: 4 }}>Role</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["guest", "user", "admin"].map((candidateRole) => (<Pressable key={candidateRole} onPress={() => setUserForm((prev) => (prev ? { ...prev, role: candidateRole } : prev))} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, backgroundColor: userForm.role === candidateRole ? colors.primary : "transparent" }}>
                      <Text style={{ textAlign: "center", color: userForm.role === candidateRole ? "#111" : colors.text }}>
                        {candidateRole}
                      </Text>
                    </Pressable>))}
                </View>

                <Pressable onPress={saveUser} style={{ marginTop: 12, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", color: "#111", fontWeight: "700" }}>Save User</Text>
                </Pressable>
                <Pressable onPress={() => setEditingUser(null)} style={{ marginTop: 8, backgroundColor: colors.border, borderRadius: 10, paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", color: colors.text, fontWeight: "700" }}>Cancel</Text>
                </Pressable>
              </>) : null}
          </ScrollView>
        </View>
      </Modal>

      <DetailModal item={selectedLighter} onClose={() => setSelectedLighter(null)} colors={colors}/>

      <Modal visible={!!lighterForm} transparent animationType="slide" onRequestClose={() => { setEditingLighter(null); setLighterForm(null); }}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" }}>
          <ScrollView style={{ maxHeight: "84%", backgroundColor: colors.panel, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>{editingLighter ? "Edit Product" : "Add Product"}</Text>
            {lighterForm ? (<>
                {[
                ["name", "Name"],
                ["brand", "Brand"],
                ["year", "Year"],
                ["country", "Country"],
                ["mechanism", "Mechanism"],
                ["period", "Period"],
                ["image", "Image URL"],
                ["description", "Description"],
            ].map(([field, label]) => (<View key={field} style={{ marginTop: 10 }}>
                    <Text style={{ color: colors.muted, marginBottom: 4 }}>{label}</Text>
                    <TextInput value={lighterForm[field]} onChangeText={(value) => {
                    setLighterForm((prev) => (prev ? { ...prev, [field]: value } : prev));
                    setLighterErrors((prev) => ({ ...prev, [field]: "" }));
                }} multiline={field === "description"} style={{ color: colors.text, borderColor: lighterErrors[field] ? "#ef4444" : colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minHeight: field === "description" ? 90 : undefined, textAlignVertical: field === "description" ? "top" : "center" }}/>
                    {lighterErrors[field] ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{lighterErrors[field]}</Text> : null}
                  </View>))}

                <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
                  <Pressable onPress={() => setLighterForm((prev) => (prev ? { ...prev, visibility: "private" } : prev))} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: lighterForm.visibility === "private" ? colors.primary : "transparent", paddingVertical: 10 }}>
                    <Text style={{ textAlign: "center", color: lighterForm.visibility === "private" ? "#111" : colors.text }}>
                      Private
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setLighterForm((prev) => (prev ? { ...prev, visibility: "public" } : prev))} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: lighterForm.visibility === "public" ? colors.primary : "transparent", paddingVertical: 10 }}>
                    <Text style={{ textAlign: "center", color: lighterForm.visibility === "public" ? "#111" : colors.text }}>
                      Public
                    </Text>
                  </Pressable>
                </View>

                <Pressable onPress={saveLighter} style={{ marginTop: 12, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", color: "#111", fontWeight: "700" }}>Save Product</Text>
                </Pressable>
                <Pressable onPress={() => { setEditingLighter(null); setLighterForm(null); }} style={{ marginTop: 8, backgroundColor: colors.border, borderRadius: 10, paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", color: colors.text, fontWeight: "700" }}>Cancel</Text>
                </Pressable>
              </>) : null}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>);
}

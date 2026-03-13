import * as ImagePicker from "expo-image-picker";
import { SquarePen, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiRequest, unwrapApiData } from "../../api/client";
import { mapApiItemToLighter, mapApiUserToAppUser } from "../../api/mappers";
import { resolveAvatarSource, storeAvatarLocally } from "../avatarStorage";
import { DetailModal } from "../components/DetailModal";
import { applyCriteriaValuesToLighter, buildItemPayload, createItemFormState, isPeriodCategory, syncItemCriteriaScores, validateItemMetadata } from "../itemForm";
import { requiredText, toSafeLighterPatch, validateEmail, validateLighterForm, validatePassword, } from "../validation";

const avatarPlaceholder = require("../../../assets/images/prototypes/profile/posts.png");
const sheetBackdropStyle = {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.38)",
};
const sheetCardStyle = {
    maxHeight: "84%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
};
function toUserForm(user) {
    return {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
    };
}
export function ProfileScreen({ shared }) {
    const { role, setRole, users, setUsers, collections, setCollections, lighters, setLighters, currentUserId, colors, theme, toggleTheme, authToken, refreshAppData, logout, localAvatarMap, setLocalAvatarMap, categories, criteriaCatalog, } = shared;
    const [tab, setTab] = useState("collection");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [settingsForm, setSettingsForm] = useState(null);
    const [settingsErrors, setSettingsErrors] = useState({});
    const [pickerBusy, setPickerBusy] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingLighter, setEditingLighter] = useState(null);
    const [editorCollection, setEditorCollection] = useState(null);
    const [selectedLighter, setSelectedLighter] = useState(null);
    const [userForm, setUserForm] = useState(null);
    const [lighterForm, setLighterForm] = useState(null);
    const [userErrors, setUserErrors] = useState({});
    const [lighterErrors, setLighterErrors] = useState({});
    const currentUser = users.find((user) => user.id === currentUserId);
    const mostWanted = useMemo(() => lighters.filter((lighter) => lighter.ownerId !== currentUserId && lighter.visibility === "public"), [lighters, currentUserId]);
    const mechanismCategories = useMemo(() => categories.filter((category) => !isPeriodCategory(category)), [categories]);
    const periodCategories = useMemo(() => categories.filter((category) => isPeriodCategory(category)), [categories]);
    const myCollections = useMemo(() => collections.filter((collection) => {
        if (collection.ownerId === currentUserId) {
            return true;
        }
        if (!collection.ownerId || collection.ownerId === "0") {
            return lighters.some((lighter) => lighter.ownerId === currentUserId && lighter.collectionId === collection.id);
        }
        return false;
    }), [collections, currentUserId, lighters]);
    const selectedCollectionItems = useMemo(() => {
        if (!selectedCollection) {
            return [];
        }
        return lighters.filter((lighter) => lighter.collectionId === selectedCollection.id);
    }, [lighters, selectedCollection]);
    const listToRender = tab === "collection" ? myCollections : mostWanted;
    const roleText = role === "guest" ? "Guest" : role === "admin" ? "Admin Vault" : "Collector";
    const displayName = currentUser?.name ?? roleText;
    const displayBio = currentUser?.bio?.trim() || "Collector of Vintage and Rare Lighters";
    const currentAvatarSource = resolveAvatarSource(currentUser, localAvatarMap);
    const settingsAvatarSource = settingsForm
        ? resolveAvatarSource({
            avatarHash: settingsForm.avatarHash,
            avatarUrl: settingsForm.avatarUrl,
        }, localAvatarMap)
        : { type: "placeholder", uri: null };
    const openSettings = () => {
        setSettingsForm({
            name: currentUser?.name ?? "",
            email: currentUser?.email ?? "",
            avatarHash: currentUser?.avatarHash ?? "",
            avatarUrl: currentUser?.avatarUrl ?? currentUser?.avatar ?? "",
            bio: currentUser?.bio ?? "Collector of Vintage and Rare Lighters",
            password: "",
        });
        setSettingsErrors({});
        setIsSettingsOpen(true);
    };
    const saveSettings = async () => {
        if (!settingsForm || !currentUser)
            return;
        const nextErrors = {};
        const nameError = requiredText(settingsForm.name, "Name");
        if (nameError)
            nextErrors.name = nameError;
        if (settingsForm.password.trim().length > 0) {
            const passwordError = validatePassword(settingsForm.password);
            if (passwordError)
                nextErrors.password = passwordError;
        }
        setSettingsErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0)
            return;
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with your API account before updating your profile.");
            return;
        }
        try {
            const updated = await apiRequest(`/users/${currentUser.id}`, {
                method: "PUT",
                token: authToken,
                body: JSON.stringify({
                    name: settingsForm.name.trim(),
                    email: currentUser.email?.trim().toLowerCase() ?? "",
                    ...(settingsForm.password.trim() ? { password: settingsForm.password } : {}),
                    avatar_hash: settingsForm.avatarHash.trim() || null,
                    nationality: settingsForm.bio.trim(),
                }),
            });
            const apiUser = mapApiUserToAppUser(unwrapApiData(updated));
            const avatarHash = settingsForm.avatarHash.trim();
            const avatarUrl = avatarHash ? apiUser.avatarUrl ?? currentUser.avatarUrl ?? "" : "";
            const mapped = {
                ...currentUser,
                ...apiUser,
                name: settingsForm.name.trim(),
                bio: settingsForm.bio.trim(),
                avatar: avatarUrl,
                avatarUrl,
                avatarHash,
            };
            setUsers((prev) => prev.map((user) => (user.id === currentUser.id ? mapped : user)));
            setRole(mapped.role);
            setIsSettingsOpen(false);
            setSettingsForm(null);
            setSettingsErrors({});
            refreshAppData().catch(() => null);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to update your profile.";
            Alert.alert("Update failed", message);
        }
    };
    const applyPickedAvatar = async (sourceUri) => {
        const storedAvatar = await storeAvatarLocally(sourceUri, localAvatarMap);
        setLocalAvatarMap(storedAvatar.localAvatarMap);
        setSettingsForm((prev) => (prev
            ? {
                ...prev,
                avatarHash: storedAvatar.avatarHash,
            }
            : prev));
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
                await applyPickedAvatar(result.assets[0].uri ?? "");
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to save the selected photo on this device.";
            Alert.alert("Photo not saved", message);
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
                await applyPickedAvatar(result.assets[0].uri ?? "");
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to save the captured photo on this device.";
            Alert.alert("Photo not saved", message);
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
        const collectionForEditor = selectedCollection ?? collections.find((collection) => collection.id === lighter.collectionId) ?? null;
        setEditingLighter(lighter);
        setEditorCollection(collectionForEditor);
        setLighterForm(createItemFormState(lighter, criteriaCatalog));
        setLighterErrors({});
        setSelectedCollection(null);
    };
    const openCreateLighter = (collection) => {
        setEditingLighter(null);
        setEditorCollection(collection);
        setLighterForm(createItemFormState(null, criteriaCatalog));
        setLighterErrors({});
        setSelectedCollection(null);
    };
    const openCollection = (collection) => {
        setSelectedLighter(null);
        setEditingLighter(null);
        setLighterForm(null);
        setLighterErrors({});
        setEditorCollection(null);
        setSelectedCollection(collection);
    };
    const closeLighterEditor = () => {
        setEditingLighter(null);
        setLighterForm(null);
        setLighterErrors({});
        setSelectedCollection((prev) => prev ?? editorCollection);
        setEditorCollection(null);
    };
    const confirmLogout = () => {
        Alert.alert("Logout", "Do you really want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: logout },
        ]);
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
        const errors = {
            ...validateLighterForm(lighterForm),
            ...validateItemMetadata(lighterForm, criteriaCatalog),
        };
        setLighterErrors(errors);
        if (Object.keys(errors).length > 0)
            return;
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with your API account before editing items.");
            return;
        }
        const patch = toSafeLighterPatch(lighterForm);
        const payload = buildItemPayload(patch, lighterForm, editorCollection?.id ? { collection_id: Number(editorCollection.id) || editorCollection.id } : {});
        try {
            if (editingLighter) {
                const updated = await apiRequest(`/items/${editingLighter.id}`, {
                    method: "PUT",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                await syncItemCriteriaScores({
                    itemId: editingLighter.id,
                    criteriaCatalog,
                    criteriaValues: lighterForm.criteriaValues,
                    authToken,
                });
                const mapped = applyCriteriaValuesToLighter({
                    ...mapApiItemToLighter(unwrapApiData(updated)),
                    ownerId: editingLighter.ownerId,
                    collectionId: editorCollection?.id ?? editingLighter.collectionId ?? "",
                    categoryIds: lighterForm.categoryIds,
                    ...patch,
                }, criteriaCatalog, lighterForm.criteriaValues);
                setLighters((prev) => prev.map((lighter) => (lighter.id === editingLighter.id ? mapped : lighter)));
            }
            else {
                const created = await apiRequest("/items", {
                    method: "POST",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                const createdItem = mapApiItemToLighter(unwrapApiData(created));
                await syncItemCriteriaScores({
                    itemId: createdItem.id,
                    criteriaCatalog,
                    criteriaValues: lighterForm.criteriaValues,
                    authToken,
                });
                const mapped = applyCriteriaValuesToLighter({
                    ...createdItem,
                    ownerId: currentUserId,
                    collectionId: editorCollection?.id ?? "",
                    categoryIds: lighterForm.categoryIds,
                    ...patch,
                }, criteriaCatalog, lighterForm.criteriaValues);
                setLighters((prev) => [mapped, ...prev]);
                if (editorCollection?.id) {
                    setCollections((prev) => prev.map((collection) => (collection.id === editorCollection.id
                        ? {
                            ...collection,
                            itemCount: collection.itemCount + 1,
                        }
                        : collection)));
                    setSelectedCollection((prev) => (prev && prev.id === editorCollection.id
                        ? {
                            ...prev,
                            itemCount: prev.itemCount + 1,
                        }
                        : prev));
                }
            }
            setEditingLighter(null);
            setLighterForm(null);
            setLighterErrors({});
            setSelectedCollection((prev) => prev ?? editorCollection);
            setEditorCollection(null);
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
            setCollections((prev) => prev.filter((collection) => collection.ownerId !== id));
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
            const lighterToDelete = lighters.find((lighter) => lighter.id === id);
            setLighters((prev) => prev.filter((lighter) => lighter.id !== id));
            if (lighterToDelete?.collectionId) {
                setCollections((prev) => prev.map((collection) => (collection.id === lighterToDelete.collectionId
                    ? {
                        ...collection,
                        itemCount: Math.max(0, collection.itemCount - 1),
                    }
                    : collection)));
                setSelectedCollection((prev) => (prev && prev.id === lighterToDelete.collectionId
                    ? {
                        ...prev,
                        itemCount: Math.max(0, prev.itemCount - 1),
                    }
                    : prev));
            }
            if (selectedLighter?.id === id)
                setSelectedLighter(null);
            refreshAppData().catch(() => null);
        })
            .catch((error) => {
            const message = error instanceof Error ? error.message : "Unable to delete this item.";
            Alert.alert("Delete failed", message);
        });
    };
    return (<SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ marginHorizontal: -16, marginTop: -16, backgroundColor: colors.panelSoft, borderBottomWidth: 1, borderBottomColor: colors.border, padding: 18, paddingBottom: 64 }}>
          <View style={{ alignItems: "flex-end" }}>
            <Pressable onPress={openSettings}>
              <Text style={{ color: colors.accent, fontSize: 28, fontWeight: "800", letterSpacing: 0.4 }}>Settings</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 16, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <Image source={currentAvatarSource.uri ? { uri: currentAvatarSource.uri } : avatarPlaceholder} style={{ width: 160, height: 160, borderRadius: 999, borderWidth: 3, borderColor: colors.accent, marginBottom: -78 }}/>
            <Text style={{
            color: colors.text,
            fontSize: 44,
            fontWeight: "900",
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
          <Text style={{ color: colors.muted, fontSize: 24, fontWeight: "700", lineHeight: 31, textAlign: "right", maxWidth: "78%" }}>
            {displayBio}
          </Text>
        </View>

        <View style={{ borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panelSoft, padding: 3, flexDirection: "row", marginBottom: 16 }}>
          <Pressable onPress={() => setTab("collection")} style={{ flex: 1, borderRadius: 999, paddingVertical: 12, backgroundColor: tab === "collection" ? colors.panel : "transparent", borderWidth: tab === "collection" ? 1 : 0, borderColor: colors.primary }}>
            <Text style={{ textAlign: "center", color: tab === "collection" ? colors.primary : colors.muted, fontSize: 18, fontWeight: "800" }}>
              My Collection
            </Text>
          </Pressable>
          <Pressable onPress={() => setTab("wanted")} style={{ flex: 1, borderRadius: 999, paddingVertical: 12, backgroundColor: tab === "wanted" ? colors.panel : "transparent", borderWidth: tab === "wanted" ? 1 : 0, borderColor: colors.accent }}>
            <Text style={{ textAlign: "center", color: tab === "wanted" ? colors.accent : colors.muted, fontSize: 18, fontWeight: "800" }}>
              Most Wanted
            </Text>
          </Pressable>
        </View>

        {tab === "collection" && role !== "guest" ? (<View style={{ marginBottom: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, padding: 14 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>My Collections</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              Collections created in the `New` tab appear here.
            </Text>
          </View>) : null}

        {listToRender.length === 0 ? (<View style={{ borderRadius: 18, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
            <Text style={{ color: colors.muted, fontSize: 16, textAlign: "center" }}>
              {tab === "collection" ? "No collections created yet." : "No lighters found in this section yet."}
            </Text>
          </View>) : null}

        {tab === "collection"
            ? listToRender.map((collection) => (<View key={collection.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, padding: 14, marginBottom: 10 }}>
                <Text style={{ color: colors.text, fontSize: 19, fontWeight: "800" }} numberOfLines={1}>
                  {collection.title}
                </Text>
                <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>
                  {collection.description}
                </Text>
                <Text style={{ color: colors.primary, marginTop: 8, fontWeight: "700" }}>
                  {collection.itemCount} items
                </Text>
                <Pressable onPress={() => openCollection(collection)} style={{ marginTop: 10, alignSelf: "flex-start", borderRadius: 999, borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 14, paddingVertical: 8 }}>
                  <Text style={{ color: colors.accent, fontWeight: "700" }}>
                    Open collection
                  </Text>
                </Pressable>
              </View>))
            : listToRender.map((lighter) => (<View key={lighter.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Pressable onPress={() => setSelectedLighter(lighter)} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                  <Image source={{ uri: lighter.image }} style={{ width: 42, height: 42, borderRadius: 6, marginRight: 12 }}/>
                  <Text style={{ color: colors.text, fontSize: 19, fontWeight: "800", flex: 1 }} numberOfLines={1}>
                    {lighter.name}
                  </Text>
                </Pressable>

                {lighter.ownerId === currentUserId ? (<View style={{ flexDirection: "row", gap: 12, marginLeft: 8 }}>
                    <Pressable onPress={() => openLighterEditor(lighter)}>
                      <SquarePen color={colors.text} size={18}/>
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
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 18, marginBottom: 10 }}>Admin Users</Text>
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

            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "900", marginTop: 12, marginBottom: 10 }}>Admin Products</Text>
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

        {role !== "guest" ? (<Pressable onPress={confirmLogout} style={{ marginTop: 12, borderWidth: 1, borderColor: "#ef4444", borderRadius: 999, paddingVertical: 14, backgroundColor: colors.panel }}>
            <Text style={{ textAlign: "center", color: "#ef4444", fontWeight: "800" }}>Logout</Text>
          </Pressable>) : null}
      </ScrollView>

      <Modal visible={isSettingsOpen && !!settingsForm} transparent animationType="slide" onRequestClose={() => setIsSettingsOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.bg }}>
          <Pressable onPress={() => setIsSettingsOpen(false)} style={{ ...StyleSheet.absoluteFillObject }}/>
          <ScrollView style={{ maxHeight: "84%", backgroundColor: "#f4f4f5", borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
            <Text style={{ color: "#111", fontSize: 30, fontWeight: "800", marginBottom: 8 }}>Settings</Text>
            {settingsForm ? (<>
                {[
                ["name", "Display Name"],
                ["email", "Email"],
                ["bio", "Bio"],
                ["password", "New Password (optional)"],
            ].map(([field, label]) => (<View key={field} style={{ marginTop: 10 }}>
                    <Text style={{ color: "#52525b", marginBottom: 4 }}>{label}</Text>
                    <TextInput value={settingsForm[field]} onChangeText={(value) => {
                    if (field === "email")
                        return;
                    setSettingsForm((prev) => (prev ? { ...prev, [field]: value } : prev));
                    setSettingsErrors((prev) => ({ ...prev, [field]: "" }));
                }} autoCapitalize={field === "email" ? "none" : "sentences"} secureTextEntry={field === "password"} multiline={field === "bio"} editable={field !== "email"} selectTextOnFocus={field !== "email"} style={{ color: field === "email" ? "#71717a" : "#111", borderColor: settingsErrors[field] ? "#ef4444" : "#d4d4d8", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: field === "email" ? "#f4f4f5" : "#fdfdfd", minHeight: field === "bio" ? 84 : undefined, textAlignVertical: field === "bio" ? "top" : "center" }}/>
                    {field === "email" ? <Text style={{ color: "#71717a", marginTop: 4 }}>The email is fixed and cannot be changed here.</Text> : null}
                    {settingsErrors[field] ? <Text style={{ color: "#dc2626", marginTop: 4 }}>{settingsErrors[field]}</Text> : null}
                  </View>))}

                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: "#52525b", marginBottom: 6 }}>Photo Picker</Text>
                  <Text style={{ color: "#71717a", marginBottom: 8, lineHeight: 19 }}>
                    The app stores the selected photo locally, generates an `avatar_hash`, and only sends that hash to the API.
                  </Text>
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
                  <Pressable onPress={() => setSettingsForm((prev) => (prev ? { ...prev, avatarHash: "", avatarUrl: "" } : prev))} style={{ marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: "#d4d4d8", paddingVertical: 10, backgroundColor: "#fff" }}>
                    <Text style={{ textAlign: "center", color: "#52525b", fontWeight: "600" }}>Use Default Photo</Text>
                  </Pressable>
                  <Text style={{ color: "#71717a", marginTop: 8 }}>
                    {settingsForm.avatarHash
                        ? `avatar_hash: ${settingsForm.avatarHash}`
                        : settingsForm.avatarUrl
                            ? "No local match. The profile will fall back to the remote avatar URL."
                            : "No avatar selected. The profile will use the placeholder."}
                  </Text>
                </View>

                <View style={{ marginTop: 10, alignItems: "center" }}>
                  <Image source={settingsAvatarSource.uri ? { uri: settingsAvatarSource.uri } : avatarPlaceholder} style={{ width: 104, height: 104, borderRadius: 999, borderWidth: 2, borderColor: "#d4d4d8" }}/>
                </View>

                <Pressable onPress={saveSettings} style={{ marginTop: 14, backgroundColor: "#b8121c", borderRadius: 999, paddingVertical: 13 }}>
                  <Text style={{ textAlign: "center", color: "#fff", fontWeight: "800", fontSize: 18 }}>Save Profile</Text>
                </Pressable>

                <Pressable onPress={toggleTheme} style={{ marginTop: 10, borderWidth: 1, borderColor: "#d4d4d8", borderRadius: 999, paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", color: "#111", fontWeight: "700" }}>
                    {theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
                  </Text>
                </Pressable>
              </>) : null}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={!!selectedCollection} transparent animationType="slide" onRequestClose={() => setSelectedCollection(null)}>
        <View style={sheetBackdropStyle}>
          <Pressable onPress={() => setSelectedCollection(null)} style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" }}/>
          <View style={{ ...sheetCardStyle, backgroundColor: colors.panel, borderColor: colors.border }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
            {selectedCollection ? (<>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800" }}>{selectedCollection.title}</Text>
                <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>{selectedCollection.description}</Text>

                <Pressable onPress={() => openCreateLighter(selectedCollection)} style={{ marginTop: 14, borderRadius: 999, backgroundColor: colors.primary, paddingVertical: 13 }}>
                  <Text style={{ textAlign: "center", color: "#111", fontWeight: "900" }}>Create Item In This Collection</Text>
                </Pressable>

                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", marginTop: 18 }}>Items</Text>
                {selectedCollectionItems.length === 0 ? (<View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panelSoft, padding: 16, marginTop: 10 }}>
                    <Text style={{ color: colors.muted, textAlign: "center" }}>No items in this collection yet.</Text>
                  </View>) : null}

                {selectedCollectionItems.map((lighter) => (<View key={lighter.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panelSoft, padding: 12, flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                    <Pressable onPress={() => setSelectedLighter(lighter)} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                      <Image source={{ uri: lighter.image }} style={{ width: 42, height: 42, borderRadius: 6, marginRight: 12 }}/>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }} numberOfLines={1}>
                          {lighter.name}
                        </Text>
                        <Text style={{ color: colors.muted }} numberOfLines={1}>
                          {lighter.brand} • {lighter.year}
                        </Text>
                      </View>
                    </Pressable>
                    <View style={{ flexDirection: "row", gap: 12, marginLeft: 8 }}>
                      <Pressable onPress={() => openLighterEditor(lighter)}>
                        <SquarePen color={colors.text} size={18}/>
                      </Pressable>
                      <Pressable onPress={() => Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => deleteLighter(lighter.id) },
                        ])}>
                        <Trash2 color="#ef4444" size={18}/>
                      </Pressable>
                    </View>
                  </View>))}

                <Pressable onPress={() => setSelectedCollection(null)} style={{ marginTop: 16 }}>
                  <Text style={{ textAlign: "center", color: colors.muted }}>Close</Text>
                </Pressable>
              </>) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!editingUser && !!userForm} transparent animationType="slide" onRequestClose={() => setEditingUser(null)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.bg }}>
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

      <Modal visible={!!lighterForm} transparent animationType="slide" onRequestClose={closeLighterEditor}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.bg }}>
          <ScrollView style={{ maxHeight: "84%", backgroundColor: colors.panel, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800" }}>{editingLighter ? "Edit Product" : "Add Product"}</Text>
            {editorCollection ? <Text style={{ color: colors.muted, marginTop: 4 }}>Collection: {editorCollection.title}</Text> : null}
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

                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.muted, marginBottom: 6 }}>Ignition Category</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {mechanismCategories.map((category) => {
                    const selectedMechanismId = lighterForm.categoryIds.find((id) => mechanismCategories.some((option) => option.id === id)) ?? "";
                    const isSelected = selectedMechanismId === category.id;
                    return (<Pressable key={category.id} onPress={() => {
                            setLighterForm((prev) => {
                                if (!prev)
                                    return prev;
                                const currentPeriodId = prev.categoryIds.find((id) => periodCategories.some((option) => option.id === id));
                                const nextMechanismId = prev.categoryIds.includes(category.id) ? "" : category.id;
                                const nextIds = [nextMechanismId, currentPeriodId].filter(Boolean);
                                return { ...prev, categoryIds: nextIds };
                            });
                            setLighterErrors((prev) => ({ ...prev, categoryIds: "" }));
                        }} style={{
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary : "transparent",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                        }}>
                        <Text style={{ color: isSelected ? "#111" : colors.text, fontWeight: "700" }}>{category.title}</Text>
                      </Pressable>);
                })}
                  </View>
                  <Text style={{ color: colors.muted, marginTop: 12, marginBottom: 6 }}>Period Category</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {periodCategories.map((category) => {
                    const selectedPeriodId = lighterForm.categoryIds.find((id) => periodCategories.some((option) => option.id === id)) ?? "";
                    const isSelected = selectedPeriodId === category.id;
                    return (<Pressable key={category.id} onPress={() => {
                            setLighterForm((prev) => {
                                if (!prev)
                                    return prev;
                                const currentMechanismId = prev.categoryIds.find((id) => mechanismCategories.some((option) => option.id === id));
                                const nextPeriodId = prev.categoryIds.includes(category.id) ? "" : category.id;
                                const nextIds = [currentMechanismId, nextPeriodId].filter(Boolean);
                                return { ...prev, categoryIds: nextIds };
                            });
                            setLighterErrors((prev) => ({ ...prev, categoryIds: "" }));
                        }} style={{
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary : "transparent",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                        }}>
                        <Text style={{ color: isSelected ? "#111" : colors.text, fontWeight: "700" }}>{category.title}</Text>
                      </Pressable>);
                })}
                  </View>
                  {lighterErrors.categoryIds ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{lighterErrors.categoryIds}</Text> : null}
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.muted, marginBottom: 6 }}>Criteria Scores</Text>
                  {criteriaCatalog.map((criterion) => {
                    const errorKey = `criteria:${criterion.id}`;
                    return (<View key={criterion.id} style={{ marginTop: 8 }}>
                        <Text style={{ color: colors.text, marginBottom: 4 }}>{criterion.name}</Text>
                        <TextInput value={lighterForm.criteriaValues[String(criterion.id)] ?? ""} onChangeText={(value) => {
                            const sanitized = value.replace(/[^0-9]/g, "");
                            setLighterForm((prev) => (prev
                                ? {
                                    ...prev,
                                    criteriaValues: {
                                        ...prev.criteriaValues,
                                        [String(criterion.id)]: sanitized,
                                    },
                                }
                                : prev));
                            setLighterErrors((prev) => ({ ...prev, [errorKey]: "" }));
                        }} keyboardType="number-pad" style={{ color: colors.text, borderColor: lighterErrors[errorKey] ? "#ef4444" : colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}/>
                        {lighterErrors[errorKey] ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{lighterErrors[errorKey]}</Text> : null}
                      </View>);
                })}
                </View>

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
                <Pressable onPress={closeLighterEditor} style={{ marginTop: 8, backgroundColor: colors.border, borderRadius: 10, paddingVertical: 12 }}>
                  <Text style={{ textAlign: "center", color: colors.text, fontWeight: "700" }}>Cancel</Text>
                </Pressable>
              </>) : null}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>);
}

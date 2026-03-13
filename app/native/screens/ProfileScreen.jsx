import * as ImagePicker from "expo-image-picker";
import { SquarePen, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { apiRequest, unwrapApiData } from "../../api/client";
import { mapApiItemToLighter, mapApiUserToAppUser } from "../../api/mappers";
import { getBodyTextStyle, getEyebrowStyle, getPageShellStyle, getPanelStyle } from "../artDirection";
import { resolveAvatarSource, storeAvatarLocally } from "../avatarStorage";
import { AmbientBackground } from "../components/AmbientBackground";
import { BrandButton, IconCircleButton, SelectionChip } from "../components/BrandButton";
import { DetailModal } from "../components/DetailModal";
import { TopBar } from "../components/TopBar";
import { applyCriteriaValuesToLighter, buildItemPayload, createItemFormState, criterionLevelOptions, getCriterionLevelVisuals, isPeriodCategory, syncItemCriteriaScores, validateItemMetadata } from "../itemForm";
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
    const { width } = useWindowDimensions();
    const currentUser = users.find((user) => user.id === currentUserId);
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
    const roleText = role === "guest" ? "Guest" : role === "admin" ? "Admin Vault" : "Collector";
    const displayName = currentUser?.name ?? roleText;
    const displayBio = currentUser?.nationality?.trim() || currentUser?.bio?.trim() || "Collector of Vintage and Rare Lighters";
    const ownedItemsCount = lighters.filter((lighter) => lighter.ownerId === currentUserId).length;
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
            nationality: currentUser?.nationality ?? currentUser?.bio ?? "",
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
                    nationality: settingsForm.nationality.trim(),
                }),
            });
            const apiUser = mapApiUserToAppUser(unwrapApiData(updated));
            const avatarHash = settingsForm.avatarHash.trim();
            const avatarUrl = avatarHash ? apiUser.avatarUrl ?? currentUser.avatarUrl ?? "" : "";
            const mapped = {
                ...currentUser,
                ...apiUser,
                name: settingsForm.name.trim(),
                bio: settingsForm.nationality.trim(),
                nationality: settingsForm.nationality.trim(),
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
      <AmbientBackground colors={colors}/>
      <ScrollView contentContainerStyle={getPageShellStyle(width)}>
        <TopBar colors={colors} activeRoute="Profile" onToggleTheme={toggleTheme} compact={width < 700}/>

        <View style={[getPanelStyle(colors, { radius: 30, padding: 22 }), { overflow: "hidden" }]}>
          <View style={{ flexDirection: width >= 700 ? "row" : "column", gap: 18 }}>
            <View style={{ flexDirection: width >= 700 ? "row" : "column", alignItems: width >= 700 ? "center" : "flex-start", gap: 18, flex: 1 }}>
              <Image source={currentAvatarSource.uri ? { uri: currentAvatarSource.uri } : avatarPlaceholder} style={{ width: 96, height: 96, borderRadius: 28, borderWidth: 2, borderColor: colors.accent }}/>
              <View style={{ flex: 1 }}>
                <Text style={getEyebrowStyle(colors)}>Profile</Text>
                <Text style={{ color: colors.text, fontSize: width < 420 ? 36 : 44, fontWeight: "700", lineHeight: width < 420 ? 38 : 46, maxWidth: "100%" }}>
                  {displayName}
                </Text>
                <Text style={[getBodyTextStyle(colors, true), { fontSize: 16, marginTop: 10, maxWidth: width >= 700 ? "82%" : "100%" }]}>
                  {displayBio}
                </Text>
              </View>
            </View>

            <BrandButton colors={colors} variant="ghost" onPress={openSettings} style={{ alignSelf: width >= 700 ? "flex-start" : "stretch" }}>
              Settings
            </BrandButton>
          </View>

          <View style={{ flexDirection: width < 700 ? "column" : "row", gap: 12, marginTop: 22 }}>
            <View style={[getPanelStyle(colors, { elevated: true, padding: 14 }), { flex: 1 }]}>
              <Text style={getEyebrowStyle(colors)}>Collections</Text>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}>{myCollections.length}</Text>
            </View>
            <View style={[getPanelStyle(colors, { elevated: true, padding: 14 }), { flex: 1 }]}>
              <Text style={getEyebrowStyle(colors)}>Items</Text>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}>{ownedItemsCount}</Text>
            </View>
            <View style={[getPanelStyle(colors, { elevated: true, padding: 14 }), { flex: 1 }]}>
              <Text style={getEyebrowStyle(colors)}>Access</Text>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700" }}>{roleText}</Text>
            </View>
          </View>
        </View>

        <View style={[getPanelStyle(colors, { padding: 14 }), { marginTop: 24, marginBottom: 12 }]}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>My Collections</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              Collections created in the `New` tab appear here.
            </Text>
          </View>

        {myCollections.length === 0 ? (<View style={{ borderRadius: 18, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
            <Text style={{ color: colors.muted, fontSize: 16, textAlign: "center" }}>
              No collections created yet.
            </Text>
          </View>) : null}

        {myCollections.map((collection) => (<View key={collection.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, padding: 14, marginBottom: 10 }}>
                <Text style={{ color: colors.text, fontSize: 19, fontWeight: "800" }} numberOfLines={1}>
                  {collection.title}
                </Text>
                <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>
                  {collection.description}
                </Text>
                <Text style={{ color: colors.primary, marginTop: 8, fontWeight: "700" }}>
                  {collection.itemCount} items
                </Text>
                <BrandButton colors={colors} variant="ghost" onPress={() => openCollection(collection)} style={{ marginTop: 10, alignSelf: "flex-start" }}>
                  Open collection
                </BrandButton>
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
                  <IconCircleButton colors={colors} onPress={() => openUserEditor(user)}>
                    <SquarePen color={colors.text} size={18}/>
                  </IconCircleButton>
                  <IconCircleButton colors={colors} danger onPress={() => deleteUser(user.id)}>
                    <Trash2 color="#ef4444" size={18}/>
                  </IconCircleButton>
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
                  <IconCircleButton colors={colors} onPress={() => openLighterEditor(lighter)}>
                    <SquarePen color={colors.text} size={18}/>
                  </IconCircleButton>
                  <IconCircleButton colors={colors} danger onPress={() => deleteLighter(lighter.id)}>
                    <Trash2 color="#ef4444" size={18}/>
                  </IconCircleButton>
                </View>
              </View>))}
          </>) : null}

        {role !== "guest" ? (<BrandButton colors={colors} variant="danger" onPress={confirmLogout} style={{ marginTop: 12 }}>
            Logout
          </BrandButton>) : null}
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
                ["nationality", "Nationality"],
                ["password", "New Password (optional)"],
            ].map(([field, label]) => (<View key={field} style={{ marginTop: 10 }}>
                    <Text style={{ color: "#52525b", marginBottom: 4 }}>{label}</Text>
                    <TextInput value={settingsForm[field]} onChangeText={(value) => {
                    if (field === "email")
                        return;
                    setSettingsForm((prev) => (prev ? { ...prev, [field]: value } : prev));
                    setSettingsErrors((prev) => ({ ...prev, [field]: "" }));
                }} autoCapitalize={field === "email" ? "none" : "sentences"} secureTextEntry={field === "password"} multiline={false} editable={field !== "email"} selectTextOnFocus={field !== "email"} style={{ color: field === "email" ? "#71717a" : "#111", borderColor: settingsErrors[field] ? "#ef4444" : "#d4d4d8", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: field === "email" ? "#f4f4f5" : "#fdfdfd", textAlignVertical: "center" }}/>
                    {field === "email" ? <Text style={{ color: "#71717a", marginTop: 4 }}>The email is fixed and cannot be changed here.</Text> : null}
                    {settingsErrors[field] ? <Text style={{ color: "#dc2626", marginTop: 4 }}>{settingsErrors[field]}</Text> : null}
                  </View>))}

                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: "#52525b", marginBottom: 6 }}>Photo Picker</Text>
                  <Text style={{ color: "#71717a", marginBottom: 8, lineHeight: 19 }}>
                    The app stores the selected photo locally, generates an `avatar_hash`, and only sends that hash to the API.
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <BrandButton colors={colors} variant="secondary" onPress={pickPhotoFromLibrary} style={{ flex: 1 }}>
                      {pickerBusy ? "Opening..." : "Choose from gallery"}
                    </BrandButton>
                    <BrandButton colors={colors} variant="secondary" onPress={takePhotoWithCamera} style={{ flex: 1 }}>
                      {pickerBusy ? "Opening..." : "Take photo"}
                    </BrandButton>
                  </View>
                  <BrandButton colors={colors} variant="ghost" onPress={() => setSettingsForm((prev) => (prev ? { ...prev, avatarHash: "", avatarUrl: "" } : prev))} style={{ marginTop: 8 }}>
                    Use default photo
                  </BrandButton>
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

                <BrandButton colors={colors} onPress={saveSettings} style={{ marginTop: 14 }}>
                  Save profile
                </BrandButton>

                <BrandButton colors={colors} variant="secondary" onPress={toggleTheme} style={{ marginTop: 10 }}>
                  {theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                </BrandButton>
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

                <BrandButton colors={colors} onPress={() => openCreateLighter(selectedCollection)} style={{ marginTop: 14 }}>
                  Create item in this collection
                </BrandButton>

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
                      <IconCircleButton colors={colors} onPress={() => openLighterEditor(lighter)}>
                        <SquarePen color={colors.text} size={18}/>
                      </IconCircleButton>
                      <IconCircleButton colors={colors} danger onPress={() => Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => deleteLighter(lighter.id) },
                        ])}>
                        <Trash2 color="#ef4444" size={18}/>
                      </IconCircleButton>
                    </View>
                  </View>))}

                <BrandButton colors={colors} variant="secondary" onPress={() => setSelectedCollection(null)} style={{ marginTop: 16 }}>
                  Close
                </BrandButton>
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
                  {["guest", "user", "admin"].map((candidateRole) => (<SelectionChip key={candidateRole} colors={colors} label={candidateRole} selected={userForm.role === candidateRole} onPress={() => setUserForm((prev) => (prev ? { ...prev, role: candidateRole } : prev))} style={{ flex: 1 }}/>))}
                </View>

                <BrandButton colors={colors} onPress={saveUser} style={{ marginTop: 12 }}>
                  Save user
                </BrandButton>
                <BrandButton colors={colors} variant="secondary" onPress={() => setEditingUser(null)} style={{ marginTop: 8 }}>
                  Cancel
                </BrandButton>
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
                    return (<SelectionChip key={category.id} colors={colors} label={category.title} selected={isSelected} onPress={() => {
                            setLighterForm((prev) => {
                                if (!prev)
                                    return prev;
                                const currentPeriodId = prev.categoryIds.find((id) => periodCategories.some((option) => option.id === id));
                                const nextMechanismId = prev.categoryIds.includes(category.id) ? "" : category.id;
                                const nextIds = [nextMechanismId, currentPeriodId].filter(Boolean);
                                return { ...prev, categoryIds: nextIds };
                            });
                            setLighterErrors((prev) => ({ ...prev, categoryIds: "" }));
                        }}/>);
                })}
                  </View>
                  <Text style={{ color: colors.muted, marginTop: 12, marginBottom: 6 }}>Period Category</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {periodCategories.map((category) => {
                    const selectedPeriodId = lighterForm.categoryIds.find((id) => periodCategories.some((option) => option.id === id)) ?? "";
                    const isSelected = selectedPeriodId === category.id;
                    return (<SelectionChip key={category.id} colors={colors} label={category.title} selected={isSelected} onPress={() => {
                            setLighterForm((prev) => {
                                if (!prev)
                                    return prev;
                                const currentMechanismId = prev.categoryIds.find((id) => mechanismCategories.some((option) => option.id === id));
                                const nextPeriodId = prev.categoryIds.includes(category.id) ? "" : category.id;
                                const nextIds = [currentMechanismId, nextPeriodId].filter(Boolean);
                                return { ...prev, categoryIds: nextIds };
                            });
                            setLighterErrors((prev) => ({ ...prev, categoryIds: "" }));
                        }}/>);
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
                        <View style={{
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: lighterErrors[errorKey] ? "#ef4444" : colors.border,
                            backgroundColor: colors.panelSoft,
                            padding: 12,
                        }}>
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>{criterion.name}</Text>
                            <Text style={{ color: colors.muted, fontSize: 12 }}>1 Low • 2 Medium • 3 High</Text>
                          </View>
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            {criterionLevelOptions.map((option) => {
                            const selectedValue = lighterForm.criteriaValues[String(criterion.id)] ?? "1";
                            const isSelected = selectedValue === option.value;
                            const visuals = getCriterionLevelVisuals(option.value, isSelected, colors);
                            return (<SelectionChip key={option.value} colors={colors} label={`${option.value} ${option.label}`} selected={isSelected} compact onPress={() => {
                                    setLighterForm((prev) => (prev
                                        ? {
                                            ...prev,
                                            criteriaValues: {
                                                ...prev.criteriaValues,
                                                [String(criterion.id)]: option.value,
                                            },
                                        }
                                        : prev));
                                    setLighterErrors((prev) => ({ ...prev, [errorKey]: "" }));
                                }} style={{ flex: 1, borderColor: visuals.borderColor, backgroundColor: visuals.backgroundColor }}/>);
                        })}
                          </View>
                        </View>
                        {lighterErrors[errorKey] ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{lighterErrors[errorKey]}</Text> : null}
                      </View>);
                })}
                </View>

                <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
                  <SelectionChip colors={colors} label="Private" selected={lighterForm.visibility === "private"} onPress={() => setLighterForm((prev) => (prev ? { ...prev, visibility: "private" } : prev))} style={{ flex: 1 }}/>
                  <SelectionChip colors={colors} label="Public" selected={lighterForm.visibility === "public"} onPress={() => setLighterForm((prev) => (prev ? { ...prev, visibility: "public" } : prev))} style={{ flex: 1 }}/>
                </View>

                <BrandButton colors={colors} onPress={saveLighter} style={{ marginTop: 12 }}>
                  Save product
                </BrandButton>
                <BrandButton colors={colors} variant="secondary" onPress={closeLighterEditor} style={{ marginTop: 8 }}>
                  Cancel
                </BrandButton>
              </>) : null}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>);
}

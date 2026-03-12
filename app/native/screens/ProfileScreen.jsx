import * as ImagePicker from "expo-image-picker";
import { SquarePen, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiRequest, unwrapApiData } from "../../api/client";
import { mapApiItemToLighter, mapApiUserToAppUser } from "../../api/mappers";
import { resolveAvatarSource, storeAvatarLocally } from "../avatarStorage";
import { getShadow } from "../brand";
import { Atmosphere } from "../components/Atmosphere";
import { DetailModal } from "../components/DetailModal";
import { GradientButton } from "../components/GradientButton";
import { styles } from "../styles";
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
    const { role, setRole, users, setUsers, collections, setCollections, lighters, setLighters, currentUserId, colors, theme, toggleTheme, authToken, refreshAppData, logout, localAvatarMap, setLocalAvatarMap, } = shared;
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
        setLighterForm(toLighterForm(lighter));
        setLighterErrors({});
        setSelectedCollection(null);
    };
    const openCreateLighter = (collection) => {
        setEditingLighter(null);
        setEditorCollection(collection);
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
            category_ids: [1],
            ...(editorCollection?.id ? { collection_id: Number(editorCollection.id) || editorCollection.id } : {}),
        };
        try {
            if (editingLighter) {
                const updated = await apiRequest(`/items/${editingLighter.id}`, {
                    method: "PUT",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                const mapped = {
                    ...mapApiItemToLighter(unwrapApiData(updated)),
                    ownerId: editingLighter.ownerId,
                    collectionId: editorCollection?.id ?? editingLighter.collectionId ?? "",
                    ...patch,
                };
                setLighters((prev) => prev.map((lighter) => (lighter.id === editingLighter.id ? mapped : lighter)));
            }
            else {
                const created = await apiRequest("/items", {
                    method: "POST",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                const mapped = {
                    ...mapApiItemToLighter(unwrapApiData(created)),
                    ownerId: currentUserId,
                    collectionId: editorCollection?.id ?? "",
                    ...patch,
                };
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
      <Atmosphere colors={colors}>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <View style={[styles.hero, getShadow(theme, "card"), { backgroundColor: colors.panel, borderColor: colors.border, paddingBottom: 28, marginBottom: 22 }]}>
          <View style={{ alignItems: "flex-end" }}>
            <Pressable onPress={openSettings} style={[styles.ghostBtn, { borderColor: colors.border, backgroundColor: colors.panelSoft, minHeight: 44, paddingHorizontal: 16 }]}>
              <Text style={[styles.ghostBtnText, { color: colors.text }]}>Settings</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 16, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <Image source={currentAvatarSource.uri ? { uri: currentAvatarSource.uri } : avatarPlaceholder} style={{ width: 104, height: 104, borderRadius: 28, borderWidth: 1, borderColor: colors.border }}/>
            <Text style={{
            color: colors.text,
            fontSize: 40,
            fontFamily: "Syne_700Bold",
            lineHeight: 38,
            textAlign: "right",
            maxWidth: "62%",
            flexShrink: 1,
        }} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.72}>
              {displayName}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.stat, { marginRight: 0, backgroundColor: colors.panelSoft, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Role</Text>
              <Text style={[styles.statValue, { color: colors.primary, fontSize: 20, lineHeight: 20 }]}>{roleText}</Text>
            </View>
            <View style={[styles.stat, { marginRight: 0, backgroundColor: colors.panelSoft, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Collections</Text>
              <Text style={[styles.statValue, { color: colors.accent }]}>{myCollections.length}</Text>
            </View>
            <View style={[styles.stat, { marginRight: 0, backgroundColor: colors.panelSoft, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Wanted</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{mostWanted.length}</Text>
            </View>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", marginTop: 0, marginBottom: 18 }}>
          <Text style={[styles.bodyText, { color: colors.muted, fontSize: 18, lineHeight: 28, textAlign: "right", maxWidth: "86%" }]}>
            {displayBio}
          </Text>
        </View>

        <View style={[styles.segmentedWrap, { borderColor: colors.border, backgroundColor: colors.panelSoft, marginBottom: 16 }]}>
          <Pressable onPress={() => setTab("collection")} style={[styles.segmentedOption, tab === "collection" && { backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.segmentedText, { color: tab === "collection" ? colors.text : colors.muted }]}>
              My Collection
            </Text>
          </Pressable>
          <Pressable onPress={() => setTab("wanted")} style={[styles.segmentedOption, tab === "wanted" && { backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.segmentedText, { color: tab === "wanted" ? colors.text : colors.muted }]}>
              Most Wanted
            </Text>
          </Pressable>
        </View>

        {tab === "collection" && role !== "guest" ? (<View style={[styles.formCard, getShadow(theme, "card"), { marginBottom: 12, borderColor: colors.border, backgroundColor: colors.panel, padding: 14 }]}>
            <Text style={[styles.cardTitle, { color: colors.text, fontSize: 18, lineHeight: 18 }]}>My Collections</Text>
            <Text style={[styles.bodyText, { color: colors.muted, marginTop: 4 }]}>
              Collections created in the `New` tab appear here.
            </Text>
          </View>) : null}

        {listToRender.length === 0 ? (<View style={[styles.formCard, { borderColor: colors.border, backgroundColor: colors.panel, padding: 20 }]}>
            <Text style={[styles.bodyText, { color: colors.muted, textAlign: "center" }]}>
              {tab === "collection" ? "No collections created yet." : "No lighters found in this section yet."}
            </Text>
          </View>) : null}

        {tab === "collection"
            ? listToRender.map((collection) => (<View key={collection.id} style={[styles.formCard, getShadow(theme, "card"), { borderColor: colors.border, backgroundColor: colors.panel, padding: 14, marginBottom: 10 }]}>
                <Text style={[styles.cardTitle, { color: colors.text, fontSize: 20, lineHeight: 20 }]} numberOfLines={1}>
                  {collection.title}
                </Text>
                <Text style={[styles.bodyText, { color: colors.muted, marginTop: 6 }]}>
                  {collection.description}
                </Text>
                <Text style={[styles.metaText, { color: colors.primary, marginTop: 8 }]}>
                  {collection.itemCount} items
                </Text>
                <Pressable onPress={() => openCollection(collection)} style={[styles.ghostBtn, { marginTop: 10, alignSelf: "flex-start", minHeight: 42, borderColor: colors.border, backgroundColor: colors.panelSoft }]}>
                  <Text style={[styles.ghostBtnText, { color: colors.text }]}>
                    Open collection
                  </Text>
                </Pressable>
              </View>))
            : listToRender.map((lighter) => (<View key={lighter.id} style={[styles.listRow, getShadow(theme, "card"), { borderColor: colors.border, backgroundColor: colors.panel }]}>
                <Pressable onPress={() => setSelectedLighter(lighter)} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                  <Image source={{ uri: lighter.image }} style={{ width: 64, height: 64, borderRadius: 18, marginRight: 12 }}/>
                  <Text style={[styles.cardTitle, { color: colors.text, fontSize: 18, lineHeight: 18, flex: 1 }]} numberOfLines={1}>
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
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 28, lineHeight: 28, marginTop: 18, marginBottom: 10 }]}>Admin Users</Text>
            {users.map((user) => (<View key={user.id} style={[styles.listRow, { borderColor: colors.border, backgroundColor: colors.panel, justifyContent: "space-between" }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.cardTitle, { color: colors.text, fontSize: 18, lineHeight: 18 }]}>{user.name}</Text>
                  <Text style={[styles.bodyText, { color: colors.muted }]}>{user.email || "Public user record"}</Text>
                  <Text style={[styles.metaText, { color: colors.primary, textTransform: "capitalize" }]}>{user.role}</Text>
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

            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 28, lineHeight: 28, marginTop: 12, marginBottom: 10 }]}>Admin Products</Text>
            {lighters.map((lighter) => (<View key={lighter.id} style={[styles.listRow, { borderColor: colors.border, backgroundColor: colors.panel, justifyContent: "space-between" }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.cardTitle, { color: colors.text, fontSize: 18, lineHeight: 18 }]}>{lighter.name}</Text>
                  <Text style={[styles.bodyText, { color: colors.muted }]}>{lighter.brand} • {lighter.year}</Text>
                  <Text style={[styles.metaText, { color: colors.primary }]}>Owner: {lighter.ownerId}</Text>
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

        {role !== "guest" ? (<Pressable onPress={confirmLogout} style={[styles.ghostBtn, { marginTop: 12, borderColor: colors.destructive, backgroundColor: colors.panel }]}>
            <Text style={[styles.ghostBtnText, { color: colors.destructive }]}>Logout</Text>
          </Pressable>) : null}
      </ScrollView>
      </Atmosphere>

      <Modal visible={isSettingsOpen && !!settingsForm} transparent animationType="slide" onRequestClose={() => setIsSettingsOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.modalBackdrop }}>
          <Pressable onPress={() => setIsSettingsOpen(false)} style={{ ...StyleSheet.absoluteFillObject }}/>
          <ScrollView style={{ maxHeight: "84%", backgroundColor: colors.panel, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]}/>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Settings</Text>
            {settingsForm ? (<>
                {[
                ["name", "Display Name"],
                ["email", "Email"],
                ["bio", "Bio"],
                ["password", "New Password (optional)"],
            ].map(([field, label]) => (<View key={field} style={{ marginTop: 10 }}>
                    <Text style={[styles.inputLabel, { color: colors.muted }]}>{label}</Text>
                    <TextInput value={settingsForm[field]} onChangeText={(value) => {
                    if (field === "email")
                        return;
                    setSettingsForm((prev) => (prev ? { ...prev, [field]: value } : prev));
                    setSettingsErrors((prev) => ({ ...prev, [field]: "" }));
                }} autoCapitalize={field === "email" ? "none" : "sentences"} secureTextEntry={field === "password"} multiline={field === "bio"} editable={field !== "email"} selectTextOnFocus={field !== "email"} style={{ color: field === "email" ? colors.muted : colors.text, borderColor: settingsErrors[field] ? colors.destructive : colors.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: field === "email" ? colors.elevated : colors.panelSoft, minHeight: field === "bio" ? 84 : undefined, textAlignVertical: field === "bio" ? "top" : "center" }}/>
                    {field === "email" ? <Text style={[styles.metaText, { color: colors.muted, marginTop: 4 }]}>The email is fixed and cannot be changed here.</Text> : null}
                    {settingsErrors[field] ? <Text style={[styles.inputError, { color: colors.destructive }]}>{settingsErrors[field]}</Text> : null}
                  </View>))}

                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.inputLabel, { color: colors.muted, marginBottom: 6 }]}>Photo Picker</Text>
                  <Text style={[styles.bodyText, { color: colors.muted, marginBottom: 8 }]}>
                    The app stores the selected photo locally, generates an `avatar_hash`, and only sends that hash to the API.
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable onPress={pickPhotoFromLibrary} style={[styles.ghostBtn, { flex: 1, minHeight: 44, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                      <Text style={[styles.ghostBtnText, { color: colors.text, fontSize: 13 }]}> 
                        {pickerBusy ? "Opening..." : "Choose from Gallery"}
                      </Text>
                    </Pressable>
                    <Pressable onPress={takePhotoWithCamera} style={[styles.ghostBtn, { flex: 1, minHeight: 44, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                      <Text style={[styles.ghostBtnText, { color: colors.text, fontSize: 13 }]}> 
                        {pickerBusy ? "Opening..." : "Take Photo"}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => setSettingsForm((prev) => (prev ? { ...prev, avatarHash: "", avatarUrl: "" } : prev))} style={[styles.ghostBtn, { marginTop: 8, minHeight: 44, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                    <Text style={[styles.ghostBtnText, { color: colors.text, fontSize: 13 }]}>Use Default Photo</Text>
                  </Pressable>
                  <Text style={[styles.metaText, { color: colors.muted, marginTop: 8 }]}> 
                    {settingsForm.avatarHash
                        ? `avatar_hash: ${settingsForm.avatarHash}`
                        : settingsForm.avatarUrl
                            ? "No local match. The profile will fall back to the remote avatar URL."
                            : "No avatar selected. The profile will use the placeholder."}
                  </Text>
                </View>

                <View style={{ marginTop: 10, alignItems: "center" }}>
                  <Image source={settingsAvatarSource.uri ? { uri: settingsAvatarSource.uri } : avatarPlaceholder} style={{ width: 104, height: 104, borderRadius: 28, borderWidth: 1, borderColor: colors.border }}/>
                </View>

                <GradientButton onPress={saveSettings} colors={colors} theme={theme} title="Save profile" style={{ marginTop: 14 }}/>

                <Pressable onPress={toggleTheme} style={[styles.ghostBtn, { marginTop: 10, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                  <Text style={[styles.ghostBtnText, { color: colors.text }]}> 
                    {theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
                  </Text>
                </Pressable>
              </>) : null}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={!!selectedCollection} transparent animationType="slide" onRequestClose={() => setSelectedCollection(null)}>
        <View style={[sheetBackdropStyle, { backgroundColor: colors.modalBackdrop }]}>
          <Pressable onPress={() => setSelectedCollection(null)} style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" }}/>
          <View style={{ ...sheetCardStyle, backgroundColor: colors.panel, borderColor: colors.border }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
            {selectedCollection ? (<>
                <View style={[styles.modalHandle, { backgroundColor: colors.border }]}/>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 28, lineHeight: 28 }]}>{selectedCollection.title}</Text>
                <Text style={[styles.bodyText, { color: colors.muted, marginTop: 8 }]}>{selectedCollection.description}</Text>

                <GradientButton onPress={() => openCreateLighter(selectedCollection)} colors={colors} theme={theme} title="Create item in this collection" style={{ marginTop: 14 }}/>

                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 24, lineHeight: 24, marginTop: 18 }]}>Items</Text>
                {selectedCollectionItems.length === 0 ? (<View style={[styles.formCard, { borderColor: colors.border, backgroundColor: colors.panelSoft, padding: 16, marginTop: 10 }]}>
                    <Text style={[styles.bodyText, { color: colors.muted, textAlign: "center" }]}>No items in this collection yet.</Text>
                  </View>) : null}

                {selectedCollectionItems.map((lighter) => (<View key={lighter.id} style={[styles.listRow, { borderColor: colors.border, backgroundColor: colors.panelSoft, marginTop: 10 }]}>
                    <Pressable onPress={() => setSelectedLighter(lighter)} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                      <Image source={{ uri: lighter.image }} style={{ width: 64, height: 64, borderRadius: 18, marginRight: 12 }}/>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: colors.text, fontSize: 18, lineHeight: 18 }]} numberOfLines={1}>
                          {lighter.name}
                        </Text>
                        <Text style={[styles.bodyText, { color: colors.muted }]} numberOfLines={1}>
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
                  <Text style={[styles.metaText, { textAlign: "center", color: colors.muted }]}>Close</Text>
                </Pressable>
              </>) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!editingUser && !!userForm} transparent animationType="slide" onRequestClose={() => setEditingUser(null)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.modalBackdrop }}>
          <ScrollView style={{ maxHeight: "84%", backgroundColor: colors.panel, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]}/>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 24, lineHeight: 24 }]}>Edit User</Text>
            {userForm ? (<>
                {[
                ["name", "Name"],
                ["email", "Email"],
                ["password", "Password"],
            ].map(([field, label]) => (<View key={field} style={{ marginTop: 10 }}>
                    <Text style={[styles.inputLabel, { color: colors.muted }]}>{label}</Text>
                    <TextInput value={userForm[field]} onChangeText={(value) => {
                    setUserForm((prev) => (prev ? { ...prev, [field]: value } : prev));
                    setUserErrors((prev) => ({ ...prev, [field]: "" }));
                }} secureTextEntry={field === "password"} autoCapitalize={field === "email" ? "none" : "sentences"} style={{ color: colors.text, borderColor: userErrors[field] ? colors.destructive : colors.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.panelSoft }}/>
                    {userErrors[field] ? <Text style={[styles.inputError, { color: colors.destructive }]}>{userErrors[field]}</Text> : null}
                  </View>))}

                <Text style={[styles.inputLabel, { color: colors.muted, marginTop: 10, marginBottom: 4 }]}>Role</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["guest", "user", "admin"].map((candidateRole) => (<Pressable key={candidateRole} onPress={() => setUserForm((prev) => (prev ? { ...prev, role: candidateRole } : prev))} style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, backgroundColor: userForm.role === candidateRole ? colors.elevated : colors.panelSoft }}>
                      <Text style={[styles.ghostBtnText, { textAlign: "center", color: colors.text, fontSize: 13 }]}>
                        {candidateRole}
                      </Text>
                    </Pressable>))}
                </View>

                <GradientButton onPress={saveUser} colors={colors} theme={theme} title="Save user" style={{ marginTop: 12 }}/>
                <Pressable onPress={() => setEditingUser(null)} style={[styles.ghostBtn, { marginTop: 8, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                  <Text style={[styles.ghostBtnText, { color: colors.text }]}>Cancel</Text>
                </Pressable>
              </>) : null}
          </ScrollView>
        </View>
      </Modal>

      <DetailModal item={selectedLighter} onClose={() => setSelectedLighter(null)} colors={colors} theme={theme}/>

      <Modal visible={!!lighterForm} transparent animationType="slide" onRequestClose={closeLighterEditor}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: colors.modalBackdrop }}>
          <ScrollView style={{ maxHeight: "84%", backgroundColor: colors.panel, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]}/>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 24, lineHeight: 24 }]}>{editingLighter ? "Edit Product" : "Add Product"}</Text>
            {editorCollection ? <Text style={[styles.bodyText, { color: colors.muted, marginTop: 4 }]}>Collection: {editorCollection.title}</Text> : null}
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
                    <Text style={[styles.inputLabel, { color: colors.muted }]}>{label}</Text>
                    <TextInput value={lighterForm[field]} onChangeText={(value) => {
                    setLighterForm((prev) => (prev ? { ...prev, [field]: value } : prev));
                    setLighterErrors((prev) => ({ ...prev, [field]: "" }));
                }} multiline={field === "description"} style={{ color: colors.text, borderColor: lighterErrors[field] ? colors.destructive : colors.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, minHeight: field === "description" ? 90 : undefined, textAlignVertical: field === "description" ? "top" : "center", backgroundColor: colors.panelSoft }}/>
                    {lighterErrors[field] ? <Text style={[styles.inputError, { color: colors.destructive }]}>{lighterErrors[field]}</Text> : null}
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

                <GradientButton onPress={saveLighter} colors={colors} theme={theme} title="Save product" style={{ marginTop: 12 }}/>
                <Pressable onPress={closeLighterEditor} style={[styles.ghostBtn, { marginTop: 8, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
                  <Text style={[styles.ghostBtnText, { color: colors.text }]}>Cancel</Text>
                </Pressable>
              </>) : null}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>);
}

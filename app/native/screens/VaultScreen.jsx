import { Plus, Shield, SquarePen, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { apiRequest, ensureCollection, unwrapApiData } from "../../api/client";
import { mapApiItemToLighter } from "../../api/mappers";
import { DetailModal } from "../components/DetailModal";
import { palette } from "../palette";
import { styles } from "../styles";
import { toSafeLighterPatch, validateLighterForm } from "../validation";
function toFormState(lighter) {
    if (!lighter) {
        return {
            name: "",
            brand: "",
            year: `${new Date().getFullYear()}`,
            country: "",
            mechanism: "",
            period: "",
            image: "",
            description: "",
            visibility: "private",
        };
    }
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
export function VaultScreen({ shared }) {
    const { role, colors, lighters, setLighters, currentUserId, authToken, refreshAppData } = shared;
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState(toFormState());
    const [errors, setErrors] = useState({});
    const myLighters = useMemo(() => lighters.filter((lighter) => lighter.ownerId === currentUserId &&
        lighter.name.toLowerCase().includes(query.toLowerCase())), [currentUserId, lighters, query]);
    const avgValue = myLighters.length
        ? (myLighters.reduce((acc, lighter) => acc + lighter.criteria.value, 0) / myLighters.length).toFixed(1)
        : "0";
    if (role === "guest") {
        return (<SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={[styles.emptyWrap, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Shield color={colors.accent} size={28}/>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Vault Locked</Text>
          <Text style={{ color: colors.muted, textAlign: "center" }}>
            Sign in from Profile to manage your private collection.
          </Text>
        </View>
      </SafeAreaView>);
    }
    const openCreateForm = () => {
        setEditing(null);
        setFormData(toFormState());
        setErrors({});
        setFormOpen(true);
    };
    const openEditForm = (lighter) => {
        setEditing(lighter);
        setFormData(toFormState(lighter));
        setErrors({});
        setFormOpen(true);
    };
    const saveForm = async () => {
        const formErrors = validateLighterForm(formData);
        setErrors(formErrors);
        if (Object.keys(formErrors).length > 0)
            return;
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with your API account before changing your vault.");
            return;
        }
        const patch = toSafeLighterPatch(formData);
        const payload = {
            title: patch.name,
            description: patch.description,
            image_url: patch.image,
            status: patch.visibility === "public",
            category1_id: 1,
            category2_id: null,
        };
        try {
            if (editing) {
                const updated = await apiRequest(`/items/${editing.id}`, {
                    method: "PUT",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                const mapped = { ...mapApiItemToLighter(unwrapApiData(updated)), ownerId: currentUserId, ...patch };
                setLighters((prev) => prev.map((lighter) => (lighter.id === editing.id ? mapped : lighter)));
            }
            else {
                try {
                    const created = await apiRequest("/items", {
                        method: "POST",
                        token: authToken,
                        body: JSON.stringify(payload),
                    });
                    const mapped = { ...mapApiItemToLighter(unwrapApiData(created)), ownerId: currentUserId, ...patch };
                    setLighters((prev) => [mapped, ...prev]);
                } catch (firstError) {
                    if (firstError instanceof Error && firstError.status === 403) {
                        await ensureCollection(authToken);
                        const created = await apiRequest("/items", {
                            method: "POST",
                            token: authToken,
                            body: JSON.stringify(payload),
                        });
                        const mapped = { ...mapApiItemToLighter(unwrapApiData(created)), ownerId: currentUserId, ...patch };
                        setLighters((prev) => [mapped, ...prev]);
                    } else {
                        throw firstError;
                    }
                }
            }
            setFormOpen(false);
            setEditing(null);
            setErrors({});
            refreshAppData().catch(() => null);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to save this item.";
            Alert.alert("Save failed", message);
        }
    };
    const deleteLighter = async (id) => {
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with your API account before deleting items.");
            return;
        }
        try {
            await apiRequest(`/items/${id}`, {
                method: "DELETE",
                token: authToken,
            });
            setLighters((prev) => prev.filter((lighter) => lighter.id !== id));
            if (selected?.id === id)
                setSelected(null);
            refreshAppData().catch(() => null);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to delete this item.";
            Alert.alert("Delete failed", message);
        }
    };
    return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.screenPad}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Vault</Text>
        <View style={styles.rowBetween}>
          <View style={[styles.stat, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Pieces</Text>
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>{myLighters.length}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Avg Value</Text>
            <Text style={{ color: colors.accent, fontSize: 20, fontWeight: "700" }}>{avgValue}/10</Text>
          </View>
        </View>

        <TextInput
          placeholder="Search your collection"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={[styles.singleInput, { color: colors.text, backgroundColor: colors.panel, borderColor: colors.border }]}
        />

        <Pressable onPress={openCreateForm} style={{
            marginTop: 6, borderRadius: 16, backgroundColor: palette.gradient.top, minHeight: 48,
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <Plus color={colors.buttonText} size={18} />
          <Text style={{ color: colors.buttonText, fontWeight: "800" }}>Add New Lighter</Text>
        </Pressable>
      </View>

      <FlatList
        data={myLighters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={[styles.listRow, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Pressable onPress={() => setSelected(item)} style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 14 }}>
              <Image source={{ uri: item.image }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "700" }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{item.brand} • {item.year}</Text>
                <Text style={{ color: colors.accent, fontSize: 12 }}>{item.mechanism}</Text>
              </View>
            </Pressable>
            <View style={{ gap: 8 }}>
              <Pressable onPress={() => openEditForm(item)}>
                <SquarePen color={colors.text} size={18} />
              </Pressable>
              <Pressable onPress={() => deleteLighter(item.id)}>
                <Trash2 color={colors.error} size={18} />
              </Pressable>
            </View>
          </View>
        )}
      />

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors} />

      <Modal visible={formOpen} transparent animationType="slide" onRequestClose={() => setFormOpen(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{editing ? "Edit Lighter" : "Add Lighter"}</Text>

            {[
              ["name", "Name"], ["brand", "Brand"], ["year", "Year"], ["country", "Country"],
              ["mechanism", "Mechanism"], ["period", "Period"], ["image", "Image URL"], ["description", "Description"],
            ].map(([field, label]) => (
              <View key={field} style={{ marginTop: 10 }}>
                <Text style={{ color: colors.muted, marginBottom: 4 }}>{label}</Text>
                <TextInput
                  value={formData[field]}
                  onChangeText={(v) => { setFormData((p) => ({ ...p, [field]: v })); setErrors((p) => ({ ...p, [field]: "" })); }}
                  multiline={field === "description"}
                  style={{
                    color: colors.text, borderColor: errors[field] ? colors.error : colors.border,
                    borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, minHeight: 50, backgroundColor: colors.bgElevated,
                    ...(field === "description" ? { minHeight: 90, textAlignVertical: "top" } : {}),
                  }}
                />
                {errors[field] ? <Text style={{ color: colors.error, marginTop: 4 }}>{errors[field]}</Text> : null}
              </View>
            ))}

            <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
              {["private", "public"].map((vis) => (
                <Pressable key={vis} onPress={() => setFormData((p) => ({ ...p, visibility: vis }))} style={{
                  flex: 1, borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border,
                  backgroundColor: formData.visibility === vis ? palette.gradient.top : "transparent", paddingVertical: 10,
                }}>
                  <Text style={{ textAlign: "center", color: formData.visibility === vis ? colors.buttonText : colors.text, textTransform: "capitalize" }}>{vis}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={saveForm} style={[styles.closeBtn, { backgroundColor: palette.gradient.top }]}>
              <Text style={[styles.actionBtnText, { color: colors.buttonText }]}>{editing ? "Save Changes" : "Create Lighter"}</Text>
            </Pressable>
            <Pressable onPress={() => setFormOpen(false)} style={[styles.closeBtn, { backgroundColor: colors.bgElevated }]}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
    );
}

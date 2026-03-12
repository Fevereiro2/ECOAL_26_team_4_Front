import { Plus, Shield, SquarePen, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View, } from "react-native";
import { apiRequest, unwrapApiData } from "../../api/client";
import { mapApiItemToLighter } from "../../api/mappers";
import { getShadow } from "../brand";
import { Atmosphere } from "../components/Atmosphere";
import { DetailModal } from "../components/DetailModal";
import { GradientButton } from "../components/GradientButton";
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
  const { role, colors, lighters, setLighters, currentUserId, authToken, refreshAppData, theme } = shared;
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
        <Atmosphere colors={colors}>
        <View style={[styles.emptyWrap, getShadow(theme, "card"), { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Shield color={colors.accent} size={28}/>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Vault Locked</Text>
          <Text style={[styles.bodyText, { color: colors.muted, textAlign: "center" }]}>
            Sign in from Profile to manage your private collection.
          </Text>
        </View>
        </Atmosphere>
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
            category_ids: [1],
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
                const created = await apiRequest("/items", {
                    method: "POST",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                const mapped = { ...mapApiItemToLighter(unwrapApiData(created)), ownerId: currentUserId, ...patch };
                setLighters((prev) => [mapped, ...prev]);
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
    return (<SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <Atmosphere colors={colors}>
      <View style={styles.screenPad}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>Private vault</Text>
        <Text style={[styles.screenTitle, { color: colors.text, marginTop: 6 }]}>Shape your personal archive.</Text>
        <Text style={[styles.bodyText, { color: colors.muted, marginBottom: 14, maxWidth: "92%" }]}>This is the quiet side of Light It: your own pieces, your notes, your publishing choices, and a cleaner command of the collection.</Text>
        <View style={styles.rowBetween}>
          <View style={[styles.stat, getShadow(theme, "card"), { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Pieces</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{myLighters.length}</Text>
          </View>
          <View style={[styles.stat, getShadow(theme, "card"), { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Average value</Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>{avgValue}/10</Text>
          </View>
        </View>
        <TextInput placeholder="Search your collection" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={[
            styles.singleInput,
            { color: colors.text, backgroundColor: colors.panel, borderColor: colors.border },
        ]}/>
        <GradientButton onPress={openCreateForm} colors={colors} theme={theme} title="Add new lighter" icon={<Plus color={colors.buttonText} size={18}/>}/>
      </View>

      <FlatList data={myLighters} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }} renderItem={({ item }) => (<View style={[styles.listRow, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Pressable onPress={() => setSelected(item)} style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 10 }}>
              <Image source={{ uri: item.image }} style={styles.thumb}/>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text, fontSize: 18, lineHeight: 18 }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.metaText, { color: colors.muted }]}>
                  {item.brand} • {item.year}
                </Text>
                <Text style={[styles.metaText, { color: colors.primary, textTransform: "uppercase" }]}>{item.mechanism}</Text>
              </View>
            </Pressable>

            <View style={{ gap: 8 }}>
              <Pressable onPress={() => openEditForm(item)}>
                <SquarePen color={colors.text} size={18}/>
              </Pressable>
              <Pressable onPress={() => deleteLighter(item.id)}>
                <Trash2 color="#ef4444" size={18}/>
              </Pressable>
            </View>
          </View>)}/>

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors} theme={theme}/>

      <Modal visible={formOpen} transparent animationType="slide" onRequestClose={() => setFormOpen(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]}> 
          <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}> 
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]}/>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{editing ? "Edit Lighter" : "Add Lighter"}</Text>

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
                <TextInput value={formData[field]} onChangeText={(value) => {
                setFormData((prev) => ({ ...prev, [field]: value }));
                setErrors((prev) => ({ ...prev, [field]: "" }));
            }} multiline={field === "description"} style={{
                color: colors.text,
                borderColor: errors[field] ? "#ef4444" : colors.border,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: field === "description" ? 90 : undefined,
                textAlignVertical: field === "description" ? "top" : "center",
                fontFamily: styles.singleInput.fontFamily,
            }}/>
                {errors[field] ? <Text style={[styles.inputError, { color: colors.destructive }]}>{errors[field]}</Text> : null}
              </View>))}

            <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
              <Pressable onPress={() => setFormData((prev) => ({ ...prev, visibility: "private" }))} style={{
            flex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: formData.visibility === "private" ? colors.primary : "transparent",
            paddingVertical: 10,
        }}>
                <Text style={{ textAlign: "center", color: formData.visibility === "private" ? "#111" : colors.text }}>Private</Text>
              </Pressable>
              <Pressable onPress={() => setFormData((prev) => ({ ...prev, visibility: "public" }))} style={{
            flex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: formData.visibility === "public" ? colors.primary : "transparent",
            paddingVertical: 10,
        }}>
                <Text style={{ textAlign: "center", color: formData.visibility === "public" ? "#111" : colors.text }}>Public</Text>
              </Pressable>
            </View>

            <GradientButton onPress={saveForm} colors={colors} theme={theme} title={editing ? "Save changes" : "Create lighter"} style={{ marginTop: 12 }}/>
            <Pressable onPress={() => setFormOpen(false)} style={[styles.ghostBtn, { marginTop: 10, borderColor: colors.border, backgroundColor: colors.panelSoft }]}> 
              <Text style={[styles.ghostBtnText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
      </Atmosphere>
    </SafeAreaView>);
}

import { Shield, SquarePen, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View, useWindowDimensions, } from "react-native";
import { apiRequest, unwrapApiData } from "../../api/client";
import { mapApiItemToLighter } from "../../api/mappers";
import { getBodyTextStyle, getEyebrowStyle, getPageShellStyle, getPanelStyle } from "../artDirection";
import { AmbientBackground } from "../components/AmbientBackground";
import { BrandButton, IconCircleButton, SelectionChip } from "../components/BrandButton";
import { DetailModal } from "../components/DetailModal";
import { TopBar } from "../components/TopBar";
import { applyCriteriaValuesToLighter, buildItemPayload, createItemFormState, criterionLevelOptions, getCriterionLevelVisuals, isPeriodCategory, syncItemCriteriaScores, validateItemMetadata } from "../itemForm";
import { styles } from "../styles";
import { toSafeLighterPatch, validateLighterForm } from "../validation";
export function VaultScreen({ shared }) {
    const { role, colors, lighters, setLighters, currentUserId, authToken, refreshAppData, categories, criteriaCatalog, } = shared;
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState(createItemFormState(null, criteriaCatalog));
    const [errors, setErrors] = useState({});
    const { width } = useWindowDimensions();
    const myLighters = useMemo(() => lighters.filter((lighter) => lighter.ownerId === currentUserId &&
        lighter.name.toLowerCase().includes(query.toLowerCase())), [currentUserId, lighters, query]);
    const mechanismCategories = useMemo(() => categories.filter((category) => !isPeriodCategory(category)), [categories]);
    const periodCategories = useMemo(() => categories.filter((category) => isPeriodCategory(category)), [categories]);
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
        setFormData(createItemFormState(null, criteriaCatalog));
        setErrors({});
        setFormOpen(true);
    };
    const openEditForm = (lighter) => {
        setEditing(lighter);
        setFormData(createItemFormState(lighter, criteriaCatalog));
        setErrors({});
        setFormOpen(true);
    };
    const saveForm = async () => {
        const formErrors = {
            ...validateLighterForm(formData),
            ...validateItemMetadata(formData, criteriaCatalog),
        };
        setErrors(formErrors);
        if (Object.keys(formErrors).length > 0)
            return;
        if (!authToken) {
            Alert.alert("Authentication required", "Log in with your API account before changing your vault.");
            return;
        }
        const patch = toSafeLighterPatch(formData);
        try {
            if (editing) {
                const payload = buildItemPayload(patch, formData);
                const updated = await apiRequest(`/items/${editing.id}`, {
                    method: "PUT",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                await syncItemCriteriaScores({
                    itemId: editing.id,
                    criteriaCatalog,
                    criteriaValues: formData.criteriaValues,
                    authToken,
                });
                const mapped = applyCriteriaValuesToLighter({
                    ...mapApiItemToLighter(unwrapApiData(updated)),
                    ownerId: currentUserId,
                    categoryIds: formData.categoryIds,
                    ...patch,
                }, criteriaCatalog, formData.criteriaValues);
                setLighters((prev) => prev.map((lighter) => (lighter.id === editing.id ? mapped : lighter)));
            }
            else {
                const payload = buildItemPayload(patch, formData);
                const created = await apiRequest("/items", {
                    method: "POST",
                    token: authToken,
                    body: JSON.stringify(payload),
                });
                const createdItem = mapApiItemToLighter(unwrapApiData(created));
                await syncItemCriteriaScores({
                    itemId: createdItem.id,
                    criteriaCatalog,
                    criteriaValues: formData.criteriaValues,
                    authToken,
                });
                const mapped = applyCriteriaValuesToLighter({
                    ...createdItem,
                    ownerId: currentUserId,
                    categoryIds: formData.categoryIds,
                    ...patch,
                }, criteriaCatalog, formData.criteriaValues);
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
      <AmbientBackground colors={colors}/>
      <View style={[styles.screenPad, getPageShellStyle(width)]}>
        <TopBar colors={colors} activeRoute="Vault" onToggleTheme={shared.toggleTheme} compact={width < 700} />
        <View style={[getPanelStyle(colors, { radius: 30, padding: 22 }), { marginBottom: 12 }]}>
          <Text style={getEyebrowStyle(colors)}>Private Vault</Text>
          <Text style={[styles.screenTitle, { color: colors.text, marginTop: 0 }]}>My Vault</Text>
          <Text style={[getBodyTextStyle(colors, true), { fontSize: 16, marginBottom: 14 }]}>
            Your private collection space for curated pieces, notes and internal comparisons.
          </Text>
          <View style={styles.rowBetween}>
            <View style={[styles.stat, { backgroundColor: colors.panelSoft, borderColor: colors.border }]}>
              <Text style={{ color: colors.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Pieces</Text>
              <Text style={{ color: colors.accent, fontSize: 22, fontWeight: "900" }}>{myLighters.length}</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: colors.panelSoft, borderColor: colors.border, marginRight: 0 }]}>
              <Text style={{ color: colors.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Value score</Text>
              <Text style={{ color: colors.highlight, fontSize: 22, fontWeight: "900" }}>{avgValue}/10</Text>
            </View>
          </View>
          <TextInput placeholder="Search your collection" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={[
              styles.singleInput,
              { color: colors.text, backgroundColor: colors.panelSoft, borderColor: colors.border },
          ]}/>
          <BrandButton colors={colors} onPress={openCreateForm} style={{ marginTop: 8 }}>
            Add new item
          </BrandButton>
        </View>
      </View>

      <FlatList data={myLighters} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }} renderItem={({ item }) => (<View style={[styles.listRow, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Pressable onPress={() => setSelected(item)} style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 10 }}>
              <Image source={{ uri: item.image }} style={styles.thumb}/>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "700" }} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {item.brand} • {item.year}
                </Text>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800", textTransform: "uppercase" }}>{item.mechanism}</Text>
              </View>
            </Pressable>

            <View style={{ gap: 8 }}>
              <IconCircleButton colors={colors} onPress={() => openEditForm(item)}>
                <SquarePen color={colors.text} size={18}/>
              </IconCircleButton>
              <IconCircleButton colors={colors} danger onPress={() => deleteLighter(item.id)}>
                <Trash2 color="#ef4444" size={18}/>
              </IconCircleButton>
            </View>
          </View>)}/>

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors}/>

      <Modal visible={formOpen} transparent animationType="slide" onRequestClose={() => setFormOpen(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}> 
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
                <Text style={{ color: colors.muted, marginBottom: 4 }}>{label}</Text>
                <TextInput value={formData[field]} onChangeText={(value) => {
                setFormData((prev) => ({ ...prev, [field]: value }));
                setErrors((prev) => ({ ...prev, [field]: "" }));
            }} multiline={field === "description"} style={{
                color: colors.text,
                borderColor: errors[field] ? "#ef4444" : colors.border,
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: field === "description" ? 90 : undefined,
                textAlignVertical: field === "description" ? "top" : "center",
            }}/>
                {errors[field] ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{errors[field]}</Text> : null}
              </View>))}

            <View style={{ marginTop: 12 }}>
              <Text style={{ color: colors.muted, marginBottom: 6 }}>Ignition Category</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {mechanismCategories.map((category) => {
                const selectedMechanismId = formData.categoryIds.find((id) => mechanismCategories.some((option) => option.id === id)) ?? "";
                const isSelected = selectedMechanismId === category.id;
                return (<SelectionChip key={category.id} colors={colors} label={category.title} selected={isSelected} onPress={() => {
                        setFormData((prev) => {
                            const currentPeriodId = prev.categoryIds.find((id) => periodCategories.some((option) => option.id === id));
                            const nextMechanismId = prev.categoryIds.includes(category.id) ? "" : category.id;
                            const nextIds = [nextMechanismId, currentPeriodId].filter(Boolean);
                            return { ...prev, categoryIds: nextIds };
                        });
                        setErrors((prev) => ({ ...prev, categoryIds: "" }));
                    }}/>);
            })}
              </View>
              <Text style={{ color: colors.muted, marginTop: 12, marginBottom: 6 }}>Period Category</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {periodCategories.map((category) => {
                const selectedPeriodId = formData.categoryIds.find((id) => periodCategories.some((option) => option.id === id)) ?? "";
                const isSelected = selectedPeriodId === category.id;
                return (<SelectionChip key={category.id} colors={colors} label={category.title} selected={isSelected} onPress={() => {
                        setFormData((prev) => {
                            const currentMechanismId = prev.categoryIds.find((id) => mechanismCategories.some((option) => option.id === id));
                            const nextPeriodId = prev.categoryIds.includes(category.id) ? "" : category.id;
                            const nextIds = [currentMechanismId, nextPeriodId].filter(Boolean);
                            return { ...prev, categoryIds: nextIds };
                        });
                        setErrors((prev) => ({ ...prev, categoryIds: "" }));
                    }}/>);
            })}
              </View>
              {errors.categoryIds ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{errors.categoryIds}</Text> : null}
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ color: colors.muted, marginBottom: 6 }}>Criteria Scores</Text>
              {criteriaCatalog.map((criterion) => {
                const errorKey = `criteria:${criterion.id}`;
                const selectedValue = formData.criteriaValues[String(criterion.id)] ?? "1";
                return (<View key={criterion.id} style={{ marginTop: 8 }}>
                    <View style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: errors[errorKey] ? "#ef4444" : colors.border,
                        backgroundColor: colors.panelSoft,
                        padding: 12,
                    }}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>{criterion.name}</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>1 Low • 2 Medium • 3 High</Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                      {criterionLevelOptions.map((option) => {
                        const isSelected = selectedValue === option.value;
                        const visuals = getCriterionLevelVisuals(option.value, isSelected, colors);
                        return (<SelectionChip key={option.value} colors={colors} label={`${option.value} ${option.label}`} selected={isSelected} compact onPress={() => {
                                setFormData((prev) => ({
                                    ...prev,
                                    criteriaValues: {
                                        ...prev.criteriaValues,
                                        [String(criterion.id)]: option.value,
                                    },
                                }));
                                setErrors((prev) => ({ ...prev, [errorKey]: "" }));
                            }} style={{ flex: 1, borderColor: visuals.borderColor, backgroundColor: visuals.backgroundColor }}/>
                        );
                    })}
                      </View>
                    </View>
                    {errors[errorKey] ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{errors[errorKey]}</Text> : null}
                  </View>);
            })}
            </View>

            <View style={{ marginTop: 12, flexDirection: "row", gap: 10 }}>
              <SelectionChip colors={colors} label="Private" selected={formData.visibility === "private"} onPress={() => setFormData((prev) => ({ ...prev, visibility: "private" }))} style={{ flex: 1 }}/>
              <SelectionChip colors={colors} label="Public" selected={formData.visibility === "public"} onPress={() => setFormData((prev) => ({ ...prev, visibility: "public" }))} style={{ flex: 1 }}/>
            </View>

            <BrandButton colors={colors} onPress={saveForm} style={{ marginTop: 12 }}>
              {editing ? "Save changes" : "Create item"}
            </BrandButton>
            <BrandButton colors={colors} variant="secondary" onPress={() => setFormOpen(false)} style={{ marginTop: 8 }}>
              Cancel
            </BrandButton>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>);
}

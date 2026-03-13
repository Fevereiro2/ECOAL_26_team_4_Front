import { Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { apiRequest, unwrapApiData } from "../../api/client";
import { mapApiCollectionToAppCollection } from "../../api/mappers";
import { getBodyTextStyle, getEyebrowStyle, getPageShellStyle, getPanelStyle } from "../artDirection";
import { AmbientBackground } from "../components/AmbientBackground";
import { BrandButton } from "../components/BrandButton";
import { TopBar } from "../components/TopBar";
import { styles } from "../styles";
import { requiredText } from "../validation";

function createEmptyForm() {
  return {
    title: "",
    description: "",
  };
}

export function NewCollectionScreen({ shared }) {
  const { role, colors, authToken, refreshAppData, setCollections, currentUserId } = shared;
  const [formData, setFormData] = useState(createEmptyForm());
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const { width } = useWindowDimensions();

  const saveCollectionItem = async () => {
    const formErrors = {};
    const titleError = requiredText(formData.title, "Title");
    const descriptionError = requiredText(formData.description, "Description");
    if (titleError) formErrors.title = titleError;
    if (descriptionError) formErrors.description = descriptionError;
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    if (!authToken) {
      Alert.alert("Authentication required", "Log in with your API account before creating a new collection item.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    setIsSaving(true);
    try {
      const created = await apiRequest("/collections", {
        method: "POST",
        token: authToken,
        body: JSON.stringify(payload),
      });
      const mapped = {
        ...mapApiCollectionToAppCollection(unwrapApiData(created)),
        ownerId: currentUserId,
      };
      setCollections((prev) => {
        const withoutDuplicate = prev.filter((collection) => collection.id !== mapped.id);
        return [mapped, ...withoutDuplicate];
      });
      setFormData(createEmptyForm());
      setErrors({});
      refreshAppData().catch(() => null);
      Alert.alert("Collection created", "Your new collection was created successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create this collection.";
      Alert.alert("Create failed", message);
    } finally {
      setIsSaving(false);
    }
  };

  if (role === "guest") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={[styles.emptyWrap, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Sparkles color={colors.accent} size={28} />
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Create a New Collection</Text>
          <Text style={{ color: colors.muted, textAlign: "center" }}>
            Log in first to create a collection.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <AmbientBackground colors={colors} />
      <ScrollView contentContainerStyle={getPageShellStyle(width)}>
        <TopBar colors={colors} activeRoute="New" onToggleTheme={shared.toggleTheme} compact={width < 700} />
        <View style={[styles.hero, getPanelStyle(colors, { radius: 30, padding: 22 })]}>
          <Text style={getEyebrowStyle(colors)}>New Collection</Text>
          <Text style={[styles.screenTitle, { color: colors.text, marginTop: 0 }]}>Create a new collection</Text>
          <Text style={[getBodyTextStyle(colors, true), { fontSize: 16 }]}>
            Build a collection page with the two required fields and the official LightIt visual direction.
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: colors.muted, marginBottom: 4 }}>Title</Text>
          <TextInput
            value={formData.title}
            onChangeText={(value) => {
              setFormData((prev) => ({ ...prev, title: value }));
              setErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="Collection title"
            placeholderTextColor={colors.muted}
            style={[
              styles.singleInput,
              {
                color: colors.text,
                backgroundColor: colors.panel,
                borderColor: errors.title ? "#ef4444" : colors.border,
              },
            ]}
          />
          {errors.title ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{errors.title}</Text> : null}
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.muted, marginBottom: 4 }}>Description</Text>
          <TextInput
            value={formData.description}
            onChangeText={(value) => {
              setFormData((prev) => ({ ...prev, description: value }));
              setErrors((prev) => ({ ...prev, description: "" }));
            }}
            placeholder="Describe the collection"
            placeholderTextColor={colors.muted}
            multiline
            style={[
              styles.singleInput,
              {
                color: colors.text,
                backgroundColor: colors.panel,
                borderColor: errors.description ? "#ef4444" : colors.border,
                minHeight: 120,
                textAlignVertical: "top",
              },
            ]}
          />
          {errors.description ? <Text style={{ color: "#ef4444", marginTop: 4 }}>{errors.description}</Text> : null}
        </View>

        <BrandButton colors={colors} onPress={saveCollectionItem} disabled={isSaving}>
          {isSaving ? "Creating..." : "Create Collection"}
        </BrandButton>

        <BrandButton
          colors={colors}
          variant="secondary"
          onPress={() => {
            setFormData(createEmptyForm());
            setErrors({});
          }}
          style={{ marginTop: 10 }}
        >
          Reset form
        </BrandButton>
      </ScrollView>
    </SafeAreaView>
  );
}

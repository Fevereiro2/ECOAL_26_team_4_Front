import { Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { apiRequest, unwrapApiData } from "../../api/client";
import { mapApiCollectionToAppCollection } from "../../api/mappers";
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
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.panel,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.4 }}>
            Fresh drop
          </Text>
          <Text style={[styles.screenTitle, { color: colors.text, marginTop: 6 }]}>New Collection</Text>
          <Text style={{ color: colors.muted, lineHeight: 19 }}>
            Create a collection with only the two required fields.
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

        <Pressable
          onPress={saveCollectionItem}
          disabled={isSaving}
          style={{
            borderRadius: 999,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          <Text style={{ textAlign: "center", color: "#111", fontSize: 16, fontWeight: "900" }}>
            {isSaving ? "Creating..." : "Create Collection"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setFormData(createEmptyForm());
            setErrors({});
          }}
          style={{
            marginTop: 10,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.panel,
            paddingVertical: 13,
          }}
        >
          <Text style={{ textAlign: "center", color: colors.text, fontWeight: "700" }}>Reset Form</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

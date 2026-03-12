import { Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { apiRequest, unwrapApiData } from "../../api/client";
import { mapApiCollectionToAppCollection } from "../../api/mappers";
import { getShadow } from "../brand";
import { Atmosphere } from "../components/Atmosphere";
import { GradientButton } from "../components/GradientButton";
import { styles } from "../styles";
import { requiredText } from "../validation";

function createEmptyForm() {
  return {
    title: "",
    description: "",
  };
}

export function NewCollectionScreen({ shared }) {
  const { role, colors, authToken, refreshAppData, setCollections, currentUserId, theme } = shared;
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
        <Atmosphere colors={colors}>
        <View style={[styles.emptyWrap, getShadow(theme, "card"), { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Sparkles color={colors.accent} size={28} />
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Create a New Collection</Text>
          <Text style={[styles.bodyText, { color: colors.muted, textAlign: "center" }]}>
            Log in first to create a collection.
          </Text>
        </View>
        </Atmosphere>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <Atmosphere colors={colors}>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <View
          style={[
            styles.hero,
            getShadow(theme, "card"),
            {
              backgroundColor: colors.panel,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.eyebrow, { color: colors.accent }]}>Fresh drop</Text>
          <Text style={[styles.screenTitle, { color: colors.text, marginTop: 6 }]}>New Collection</Text>
          <Text style={[styles.bodyText, { color: colors.muted }]}>
            Create a collection with only the two required fields.
          </Text>
        </View>

        <View style={[styles.formCard, getShadow(theme, "card"), { backgroundColor: colors.panel, borderColor: colors.border }]}> 
        <View style={{ marginBottom: 10 }}>
          <Text style={[styles.inputLabel, { color: colors.muted }]}>Title</Text>
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
          {errors.title ? <Text style={[styles.inputError, { color: colors.destructive }]}>{errors.title}</Text> : null}
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.inputLabel, { color: colors.muted }]}>Description</Text>
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
          {errors.description ? <Text style={[styles.inputError, { color: colors.destructive }]}>{errors.description}</Text> : null}
        </View>

        <GradientButton onPress={saveCollectionItem} disabled={isSaving} colors={colors} theme={theme} title={isSaving ? "Creating..." : "Create collection"} />

        <Pressable
          onPress={() => {
            setFormData(createEmptyForm());
            setErrors({});
          }}
          style={[styles.ghostBtn, { marginTop: 10, borderColor: colors.border, backgroundColor: colors.panelSoft }]}
        >
          <Text style={[styles.ghostBtnText, { color: colors.text }]}>Reset form</Text>
        </Pressable>
        </View>
      </ScrollView>
      </Atmosphere>
    </SafeAreaView>
  );
}

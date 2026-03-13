function toRole(user) {
    const normalized = user.user_type?.toLowerCase();
    if (normalized === "admin" || normalized === "editor")
        return "admin";
    return "user";
}
function parseScore(raw, fallback) {
    const value = Number(raw);
    if (Number.isFinite(value) && value >= 0) {
        return Math.max(0, Math.min(10, value));
    }
    return fallback;
}
export function mapCriterionToAppKey(rawCriterion) {
    const id = String(rawCriterion?.id_criteria ?? rawCriterion?.id ?? "");
    const normalizedName = rawCriterion?.name?.toLowerCase?.() ?? "";
    if (normalizedName.includes("dur"))
        return "durability";
    if (normalizedName.includes("price") || normalizedName.includes("value"))
        return "value";
    if (normalizedName.includes("rar"))
        return "rarity";
    if (normalizedName.includes("auto"))
        return "autonomy";
    if (id === "1")
        return "durability";
    if (id === "2")
        return "value";
    if (id === "3")
        return "rarity";
    if (id === "4")
        return "autonomy";
    return null;
}
export function mapApiUserToAppUser(user) {
    const avatarUrl = user.avatar_url ?? "";
    const avatarHash = user.avatar_hash ?? "";
    const nationality = user.nationality ?? user.bio ?? user.collection?.description ?? "";
    return {
        id: String(user.id),
        name: user.name,
        email: user.email ?? "",
        password: "",
        role: toRole(user),
        avatar: avatarUrl,
        avatarUrl,
        avatarHash,
        bio: nationality,
        nationality,
    };
}
export function mapApiCollectionToAppCollection(collection) {
    return {
        id: String(collection.id),
        ownerId: String(collection.user_id ?? collection.user?.id ?? collection.owner_id ?? collection.collection?.user_id ?? "0"),
        title: collection.title?.trim() || collection.name?.trim() || "Untitled collection",
        description: collection.description?.trim() || "No description provided.",
        itemCount: Number(collection.items_count ?? collection.items?.length ?? 0),
        createdAt: collection.created_at ?? "",
    };
}
export function mapApiItemToLighter(item) {
    const criteria = item.criteria ?? [];
    const publicStatus = typeof item.status === "boolean" ? item.status : Boolean(item.status ?? true);
    const rawCategories = item.categories?.length
        ? item.categories
        : [item.category1, item.category2].filter(Boolean);
    const categoryNames = rawCategories.map((category) => category?.name ?? category?.title).filter(Boolean);
    const collectionId = item.collection?.id ?? item.collection_id ?? null;
    const criteriaValues = Object.fromEntries(criteria
        .map((criterion) => [String(criterion?.id_criteria ?? criterion?.id ?? ""), criterion?.pivot?.score ?? criterion?.score ?? criterion?.value])
        .filter(([id, value]) => Boolean(id) && value != null)
        .map(([id, value]) => [id, parseScore(value, 0)]));
    const baseCriteria = {
        durability: 5,
        value: 5,
        rarity: 5,
        autonomy: 5,
    };
    for (const criterion of criteria) {
        const key = mapCriterionToAppKey(criterion);
        if (!key)
            continue;
        baseCriteria[key] = parseScore(criterion?.pivot?.score ?? criterion?.score ?? criterion?.value, baseCriteria[key]);
    }
    return {
        id: String(item.id),
        ownerId: String(item.collection?.user_id ?? item.collection_id ?? "0"),
        collectionId: collectionId == null ? "" : String(collectionId),
        name: item.title,
        brand: item.category1?.name ?? item.category1?.title ?? "Uncategorized",
        year: new Date().getFullYear(),
        country: item.category2?.name ?? item.category2?.title ?? "Unknown",
        mechanism: categoryNames[0] ?? "Unknown",
        period: categoryNames[1] ?? "Unknown",
        categoryIds: rawCategories.map((category) => String(category?.id)).filter(Boolean),
        image: item.image_url?.trim() || "https://via.placeholder.com/512x512.png?text=Light+It",
        description: item.description?.trim() || "No description provided.",
        visibility: publicStatus ? "public" : "private",
        criteria: baseCriteria,
        criteriaValues,
    };
}

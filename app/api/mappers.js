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
export function mapApiUserToAppUser(user) {
    const avatarUrl = user.avatar_url ?? "";
    const avatarHash = user.avatar_hash ?? "";
    return {
        id: String(user.id),
        name: user.name,
        email: user.email ?? "",
        password: "",
        role: toRole(user),
        avatar: avatarUrl,
        avatarUrl,
        avatarHash,
        bio: user.bio ?? user.nationality ?? user.collection?.description ?? "",
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
    const categoryNames = [item.category1?.name, item.category1?.title, item.category2?.name, item.category2?.title].filter(Boolean);
    const collectionId = item.collection?.id ?? item.collection_id ?? null;
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
        image: item.image_url?.trim() || "https://via.placeholder.com/512x512.png?text=Light+It",
        description: item.description?.trim() || "No description provided.",
        visibility: publicStatus ? "public" : "private",
        criteria: {
            durability: parseScore(criteria[0]?.pivot?.score ?? criteria[0]?.score, 5),
            value: parseScore(criteria[1]?.pivot?.score ?? criteria[1]?.score, 5),
            rarity: parseScore(criteria[2]?.pivot?.score ?? criteria[2]?.score, 5),
            autonomy: parseScore(criteria[3]?.pivot?.score ?? criteria[3]?.score, 5),
        },
    };
}

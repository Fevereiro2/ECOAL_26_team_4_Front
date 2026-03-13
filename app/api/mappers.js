function toRole(user) {
    const normalized = user.user_type?.toLowerCase();
    if (normalized === "admin" || normalized === "editor")
        return "admin";
    return "user";
}
function parseScore(raw, fallback) {
    const value = Number(raw);
    if (Number.isFinite(value) && value >= 0) {
        return Math.max(0, Math.min(2, value));
    }
    return fallback;
}
export function mapApiUserToAppUser(user) {
    return {
        id: String(user.id),
        name: user.name,
        email: user.email ?? "",
        password: "",
        role: toRole(user),
        avatar: user.avatar_url ?? "",
        bio: user.bio ?? user.nationality ?? user.collection?.description ?? "",
    };
}
function findCriterionScore(criteria, ...names) {
    const match = criteria.find((c) => {
        const label = (c.name ?? c.criteria?.name ?? "").toLowerCase();
        return names.some((n) => label.includes(n));
    });
    return match ? (match.pivot?.score ?? match.score) : undefined;
}

export function mapApiItemToLighter(item) {
    const criteria = item.criteria ?? [];
    const publicStatus = typeof item.status === "boolean" ? item.status : Boolean(item.status ?? true);
    const linkedCategories = Array.isArray(item.categories)
        ? item.categories.map((category) => category?.name ?? category?.title).filter(Boolean)
        : [];
    const primaryCategory = item.category1?.name ?? item.category1?.title ?? linkedCategories[0] ?? null;
    const secondaryCategory = item.category2?.name ?? item.category2?.title ?? linkedCategories[1] ?? null;
    return {
        id: String(item.id),
        ownerId: String(item.collection?.user_id ?? item.collection_id ?? "0"),
        name: item.title,
        brand: primaryCategory ?? "Uncategorized",
        year: new Date().getFullYear(),
        country: secondaryCategory ?? "Unknown",
        mechanism: primaryCategory ?? "Unknown",
        period: secondaryCategory ?? "Unknown",
        image: item.image_url?.trim() || "https://via.placeholder.com/512x512.png?text=Light+It",
        description: item.description?.trim() || "No description provided.",
        visibility: publicStatus ? "public" : "private",
        criteria: {
            durability: parseScore(findCriterionScore(criteria, "durability", "durab"), 1),
            value: parseScore(findCriterionScore(criteria, "price", "value", "prix"), 1),
            rarity: parseScore(findCriterionScore(criteria, "rarity", "rareté", "rare"), 1),
            autonomy: parseScore(findCriterionScore(criteria, "autonomy", "autonomie", "auto"), 1),
        },
    };
}

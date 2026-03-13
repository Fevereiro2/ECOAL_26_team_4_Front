import { apiRequest } from "../api/client";
import { mapCriterionToAppKey } from "../api/mappers";

export function isPeriodCategory(category) {
    const title = category?.title?.toLowerCase?.() ?? "";
    return title.includes("antique") || title.includes("vintage") || title.includes("modern");
}

export function createItemFormState(lighter, criteriaCatalog = []) {
    const criteriaValues = Object.fromEntries(criteriaCatalog.map((criterion) => {
        const criterionId = String(criterion.id);
        const criterionKey = mapCriterionToAppKey({
            id_criteria: criterionId,
            name: criterion.name,
        });
        const existingValue = lighter?.criteriaValues?.[criterionId];
        const fallbackValue = criterionKey ? lighter?.criteria?.[criterionKey] : undefined;
        return [criterionId, String(existingValue ?? fallbackValue ?? 0)];
    }));
    return {
        name: lighter?.name ?? "",
        brand: lighter?.brand ?? "",
        year: String(lighter?.year ?? new Date().getFullYear()),
        country: lighter?.country ?? "",
        mechanism: lighter?.mechanism ?? "",
        period: lighter?.period ?? "",
        image: lighter?.image ?? "",
        description: lighter?.description ?? "",
        visibility: lighter?.visibility ?? "private",
        categoryIds: lighter?.categoryIds?.map(String) ?? [],
        criteriaValues,
    };
}

export function validateItemMetadata(formData, criteriaCatalog = []) {
    const errors = {};
    if (!Array.isArray(formData.categoryIds) || formData.categoryIds.length === 0) {
        errors.categoryIds = "Choose at least one category.";
    }
    else if (formData.categoryIds.length > 2) {
        errors.categoryIds = "Choose at most two categories.";
    }
    for (const criterion of criteriaCatalog) {
        const criterionId = String(criterion.id);
        const rawValue = formData.criteriaValues?.[criterionId] ?? "";
        if (!String(rawValue).trim()) {
            errors[`criteria:${criterionId}`] = `${criterion.name} is required.`;
            continue;
        }
        const numericValue = Number(rawValue);
        if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 10) {
            errors[`criteria:${criterionId}`] = `${criterion.name} must be between 0 and 10.`;
        }
    }
    return errors;
}

export function buildItemPayload(patch, formData, extra = {}) {
    const categoryIds = (formData.categoryIds ?? [])
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));
    return {
        title: patch.name,
        description: patch.description,
        image_url: patch.image,
        status: patch.visibility === "public",
        category_ids: categoryIds,
        category1_id: categoryIds[0] ?? null,
        category2_id: categoryIds[1] ?? null,
        ...extra,
    };
}

export function applyCriteriaValuesToLighter(lighter, criteriaCatalog, criteriaValues) {
    const nextCriteria = { ...lighter.criteria };
    for (const criterion of criteriaCatalog) {
        const criterionId = String(criterion.id);
        const criterionKey = mapCriterionToAppKey({
            id_criteria: criterionId,
            name: criterion.name,
        });
        if (!criterionKey) {
            continue;
        }
        nextCriteria[criterionKey] = Number(criteriaValues?.[criterionId] ?? 0);
    }
    return {
        ...lighter,
        criteria: nextCriteria,
        criteriaValues: {
            ...lighter.criteriaValues,
            ...criteriaValues,
        },
    };
}

export async function syncItemCriteriaScores({ itemId, criteriaCatalog, criteriaValues, authToken, }) {
    await Promise.all(criteriaCatalog.map(async (criterion) => {
        const criterionId = Number(criterion.id);
        const value = Number(criteriaValues?.[String(criterion.id)] ?? 0);
        const body = JSON.stringify({ value });
        try {
            await apiRequest(`/items/${itemId}/criteria/${criterionId}`, {
                method: "PUT",
                token: authToken,
                body,
            });
            return;
        }
        catch {
        }
        await apiRequest("/item-criteria", {
            method: "POST",
            token: authToken,
            body: JSON.stringify({
                id_item: Number(itemId),
                id_criteria: criterionId,
                value,
            }),
        });
    }));
}

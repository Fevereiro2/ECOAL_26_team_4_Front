export class ApiError extends Error {
    constructor(message, status, payload) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;
    }
}
export const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
export function unwrapApiData(payload) {
    return payload?.data ?? payload;
}
function getErrorMessage(payload, fallback) {
    if (typeof payload === "string" && payload.trim())
        return payload;
    if (payload && typeof payload === "object") {
        const candidate = payload;
        const firstValidationMessage = candidate.errors
            ? Object.values(candidate.errors).flat().find((value) => value?.trim())
            : null;
        if (firstValidationMessage)
            return firstValidationMessage;
        if (candidate.message?.trim())
            return candidate.message;
    }
    return fallback;
}
export async function apiRequest(path, options = {}) {
    const { token, headers, body, ...rest } = options;
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: {
            Accept: "application/json",
            ...(body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body,
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) {
        throw new ApiError(getErrorMessage(payload, "Request failed."), response.status, payload);
    }
    return payload;
}

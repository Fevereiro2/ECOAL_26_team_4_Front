import * as FileSystem from "expo-file-system/legacy";

const AVATAR_DIR = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}avatars` : null;
const AVATAR_MAP_FILE = AVATAR_DIR ? `${AVATAR_DIR}/avatar-map.json` : null;

function normalizeAvatarMap(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    return Object.fromEntries(Object.entries(value).filter((entry) => {
        const [key, uri] = entry;
        return typeof key === "string" && Boolean(key.trim()) && typeof uri === "string" && Boolean(uri.trim());
    }));
}

function getFileExtension(uri) {
    const cleanUri = uri.split("?")[0] ?? "";
    const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
    const extension = match?.[1]?.toLowerCase();
    return extension && extension.length <= 5 ? extension : "jpg";
}

async function ensureAvatarDirectory() {
    if (!AVATAR_DIR) {
        throw new Error("Local avatar storage is unavailable on this device.");
    }
    await FileSystem.makeDirectoryAsync(AVATAR_DIR, { intermediates: true });
    return AVATAR_DIR;
}

export async function loadLocalAvatarMap() {
    if (!AVATAR_MAP_FILE) {
        return {};
    }
    await ensureAvatarDirectory();
    const info = await FileSystem.getInfoAsync(AVATAR_MAP_FILE);
    if (!info.exists) {
        return {};
    }
    try {
        const raw = await FileSystem.readAsStringAsync(AVATAR_MAP_FILE);
        return normalizeAvatarMap(JSON.parse(raw));
    }
    catch {
        return {};
    }
}

export async function saveLocalAvatarMap(localAvatarMap) {
    if (!AVATAR_MAP_FILE) {
        return {};
    }
    await ensureAvatarDirectory();
    const normalizedMap = normalizeAvatarMap(localAvatarMap);
    await FileSystem.writeAsStringAsync(AVATAR_MAP_FILE, JSON.stringify(normalizedMap, null, 2));
    return normalizedMap;
}

export async function storeAvatarLocally(sourceUri, currentMap = {}) {
    if (!sourceUri?.trim()) {
        throw new Error("Missing source image URI.");
    }
    const avatarDirectory = await ensureAvatarDirectory();
    const normalizedMap = normalizeAvatarMap(currentMap);
    const extension = getFileExtension(sourceUri);
    const tempUri = `${avatarDirectory}/pending-${Date.now()}.${extension}`;
    await FileSystem.copyAsync({ from: sourceUri, to: tempUri });
    const fileInfo = await FileSystem.getInfoAsync(tempUri, { md5: true });
    const avatarHash = fileInfo.md5 ?? globalThis.crypto?.randomUUID?.() ?? `avatar-${Date.now()}`;
    const targetUri = normalizedMap[avatarHash] ?? `${avatarDirectory}/${avatarHash}.${extension}`;
    if (tempUri !== targetUri) {
        const targetInfo = await FileSystem.getInfoAsync(targetUri);
        if (!targetInfo.exists) {
            await FileSystem.moveAsync({ from: tempUri, to: targetUri });
        }
        else {
            await FileSystem.deleteAsync(tempUri, { idempotent: true });
        }
    }
    const nextMap = { ...normalizedMap, [avatarHash]: targetUri };
    await saveLocalAvatarMap(nextMap);
    return {
        avatarHash,
        fileUri: targetUri,
        localAvatarMap: nextMap,
    };
}

export function resolveAvatarSource(user, localAvatarMap) {
    const avatarHash = user?.avatarHash?.trim?.() ?? "";
    const avatarUrl = user?.avatarUrl?.trim?.() ?? user?.avatar?.trim?.() ?? "";
    if (avatarHash && localAvatarMap?.[avatarHash]) {
        return { type: "local", uri: localAvatarMap[avatarHash] };
    }
    if (avatarUrl) {
        return { type: "remote", uri: avatarUrl };
    }
    return { type: "placeholder", uri: null };
}

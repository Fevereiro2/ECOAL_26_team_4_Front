import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  /* ── Layout ───────────────────── */
  safe: { flex: 1 },
  screenPad: { padding: 16, paddingBottom: 26 },

  /* ── Hero ──────────────────────── */
  hero: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 18,
    marginBottom: 20,
  },
  heroTitle: { fontSize: 28, fontWeight: "800", lineHeight: 30 },

  /* ── Typography ────────────────── */
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  sectionSubtitle: { marginTop: 4, fontSize: 13, lineHeight: 21 },
  screenTitle: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2.2,
    marginBottom: 10,
  },

  /* ── Card ──────────────────────── */
  card: {
    borderWidth: 1,
    borderRadius: 22,
    marginBottom: 14,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 220, borderRadius: 18 },
  cardBody: { padding: 18 },
  cardTitle: { fontSize: 17, fontWeight: "800" },
  cardMeta: { fontSize: 13, marginTop: 2 },

  /* ── Rows / Actions ────────────── */
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  actionBtn: {
    borderRadius: 16,
    minHeight: 48,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: { fontWeight: "700" },
  iconBtn: {
    borderWidth: 1,
    borderRadius: 14,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Badge ─────────────────────── */
  badge: {
    position: "absolute",
    left: 10,
    top: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  /* ── Search ────────────────────── */
  searchWrap: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    minHeight: 50,
  },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8 },
  switchRow: { flexDirection: "row", alignItems: "center" },

  /* ── Empty state ───────────────── */
  emptyWrap: {
    margin: 16,
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Stat pill ─────────────────── */
  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginRight: 8,
    marginBottom: 10,
  },

  /* ── Form input ────────────────── */
  singleInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 50,
    justifyContent: "center",
    marginBottom: 8,
  },

  /* ── List row ──────────────────── */
  listRow: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  thumb: { width: 64, height: 64, borderRadius: 14 },

  /* ── Profile ───────────────────── */
  profileCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    marginBottom: 14,
  },
  profileName: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 28,
  },

  /* ── Action group ──────────────── */
  actionGroup: { borderWidth: 1, borderRadius: 22, marginBottom: 12 },
  actionRow: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  /* ── Role button ───────────────── */
  roleBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  /* ── Modal ─────────────────────── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 22,
    maxHeight: "86%",
  },
  modalImage: { width: "100%", height: 220, borderRadius: 18 },
  closeBtn: {
    marginTop: 12,
    borderRadius: 16,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Compare bars ──────────────── */
  compareRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  compareBar: { flex: 1, height: 8, borderRadius: 99, overflow: "hidden" },
  compareFill: { height: "100%", borderRadius: 99 },
});

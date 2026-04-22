import { StyleSheet } from "react-native";
import { C } from "./grammar_constants";

export const S = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.bg },
  center: { justifyContent: "center", alignItems: "center", gap: 10 },
  softText: { color: C.textSoft, fontSize: 14 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  backBtnText: { color: C.textMid, fontSize: 13, fontWeight: "600" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  headerSub: { fontSize: 12, color: C.textLight, marginTop: 2 },

  // Topic list
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  topicIndex: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  topicIndexText: { color: C.primary, fontWeight: "700", fontSize: 13 },
  topicName: { fontSize: 14, fontWeight: "600", color: C.text, flex: 1 },
  topicSub: { fontSize: 12, color: C.textSoft, marginTop: 2 },

  // List card (lessons / exercises)
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  listCardText: { flex: 1, fontSize: 14, fontWeight: "600", color: C.text },
  listCardSub: { fontSize: 12, color: C.textSoft, marginTop: 2 },

  // Question card
  qCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  qTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  qNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  qNumText: { color: C.primary, fontSize: 11, fontWeight: "700" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: C.badge,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: C.badgeText },
  qText: { fontSize: 15, color: C.text, lineHeight: 22, marginBottom: 12 },
  blank: { color: C.primary, fontWeight: "700" },

  // Fill input
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 8,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "500",
  },

  // Multi choice
  optBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  optLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optLetterText: { color: C.white, fontSize: 11, fontWeight: "700" },
  optText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Hint
  hint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: C.successLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 4,
  },
  hintLabel: { fontSize: 12, color: C.textSoft },
  hintVal: { fontSize: 13, fontWeight: "700", color: "#15803D" },

  // Result bar
  resultBar: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 4,
    gap: 12,
  },
  resultLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  resultScore: { fontSize: 36 },
  resultNum: { fontSize: 36, fontWeight: "800", color: C.primary },
  resultDenom: { fontSize: 18, color: C.textLight },
  resultMsg: { fontSize: 14, fontWeight: "600", color: C.text },
  resultPct: { fontSize: 12, color: C.textSoft, marginTop: 2 },

  // Submit
  submitWrap: {
    alignItems: "center",
    marginTop: 8,
    gap: 10,
  },
  submitHint: { fontSize: 13, color: C.textSoft },
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 48,
  },
  submitBtnText: { color: C.white, fontSize: 15, fontWeight: "700" },

  // Buttons
  btn: {
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  btnText: { color: C.white, fontSize: 13, fontWeight: "600" },
  btnOutline: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: C.white,
  },
  btnOutlineText: { color: C.textMid, fontSize: 13, fontWeight: "600" },
});
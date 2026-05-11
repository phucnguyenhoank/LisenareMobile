import colors from "@/theme/colors";
import {
  GrammarPoint,
  SentenceFunction,
  SentenceStructure,
  UnitType,
} from "@/types/brick";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GrammarPointSelector } from "./GrammarPointSelector";

type MetadataState = {
  unitType: UnitType;
  structure: SentenceStructure | null;
  func: SentenceFunction | null;
  selectedGrammarPoints: GrammarPoint[];
};

type Props = {
  state: MetadataState;
  onChange: (newState: Partial<MetadataState>) => void;
  readOnly?: boolean;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldCard}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export function BrickMetadataSelector({ state, onChange, readOnly }: Props) {
  const [showMetadata, setShowMetadata] = useState(false);

  const toggleGrammarPoint = (point: GrammarPoint) => {
    if (readOnly) return;
    const { selectedGrammarPoints } = state;
    const next = selectedGrammarPoints.includes(point)
      ? selectedGrammarPoints.filter((p) => p !== point)
      : [...selectedGrammarPoints, point];
    onChange({ selectedGrammarPoints: next });
  };

  return (
    <View>
      <Pressable
        style={styles.metadataToggle}
        onPress={() => setShowMetadata(!showMetadata)}
      >
        <Text style={styles.metadataToggleText}>Chi tiết thêm</Text>
        <Ionicons
          name={showMetadata ? "chevron-up" : "chevron-down"}
          size={18}
          color="#888"
        />
      </Pressable>

      {showMetadata && (
        <View
          style={styles.metadataContainer}
          pointerEvents={readOnly ? "none" : "auto"}
        >
          <Field label="Loại đơn vị">
            <Picker
              selectedValue={state.unitType}
              onValueChange={(v) => onChange({ unitType: v })}
              enabled={!readOnly}
            >
              {Object.values(UnitType).map((v) => (
                <Picker.Item
                  key={v}
                  label={v.charAt(0).toUpperCase() + v.slice(1)}
                  value={v}
                />
              ))}
            </Picker>
          </Field>

          <Field label="Chủ điểm ngữ pháp">
            <GrammarPointSelector
              unitType={state.unitType}
              selectedPoints={state.selectedGrammarPoints}
              onToggle={toggleGrammarPoint}
              readOnly={readOnly}
            />
          </Field>

          {state.unitType === UnitType.sentence && (
            <>
              <Field label="Cấu trúc câu">
                <Picker
                  selectedValue={state.structure}
                  onValueChange={(v) => onChange({ structure: v })}
                  enabled={!readOnly}
                >
                  <Picker.Item label="Không xác định" value={null} />
                  {Object.values(SentenceStructure).map((v) => (
                    <Picker.Item key={v} label={v} value={v} />
                  ))}
                </Picker>
              </Field>

              <Field label="Chức năng giao tiếp">
                <Picker
                  selectedValue={state.func}
                  onValueChange={(v) => onChange({ func: v })}
                  enabled={!readOnly}
                >
                  <Picker.Item label="Không xác định" value={null} />
                  {Object.values(SentenceFunction).map((v) => (
                    <Picker.Item key={v} label={v} value={v} />
                  ))}
                </Picker>
              </Field>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EAEAEF",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.secondary2,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metadataToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  metadataToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  metadataContainer: {
    gap: 4,
  },
});

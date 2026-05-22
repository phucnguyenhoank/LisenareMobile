import colors from "@/theme/colors";
import {
  GrammarPoint,
  SentenceFunction,
  SentenceStructure,
  UnitType,
} from "@/types/brick";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
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
  subtitle,
  children,
}: {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldCard}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>

        {subtitle && <Text style={styles.fieldSubtitle}>{subtitle}</Text>}
      </View>

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

    onChange({
      selectedGrammarPoints: next,
    });
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setShowMetadata((prev) => !prev);
  };

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <Pressable style={styles.metadataToggle} onPress={toggleExpand}>
        <View style={styles.metadataContent}>
          <View style={styles.metadataIcon}>
            <Feather name="book-open" size={16} color={colors.secondary2} />
          </View>

          <View style={styles.metadataTextContainer}>
            <Text style={styles.metadataTitle}>Learning Metadata</Text>

            <Text style={styles.metadataSubtitle}>
              Grammar, structure, and speaking behavior
            </Text>
          </View>
        </View>

        <Ionicons
          name={showMetadata ? "chevron-up" : "chevron-down"}
          size={18}
          color="#888"
        />
      </Pressable>

      {/* CONTENT */}
      {showMetadata && (
        <View
          style={styles.metadataContainer}
          pointerEvents={readOnly ? "none" : "auto"}
        >
          {/* UNIT TYPE */}
          <Field label="Unit Type" subtitle="Defines how the brick is learned">
            <View style={styles.pickerWrapper}>
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
            </View>

            {/* NOTE */}
            <View style={styles.noteCard}>
              <Ionicons
                name="information-circle"
                size={18}
                color={colors.secondary2}
              />

              <Text style={styles.noteText}>
                Only bricks with unit type{" "}
                <Text style={styles.noteBold}>Sentence</Text> will be scheduled
                for speaking practice.
              </Text>
            </View>
          </Field>

          {/* GRAMMAR */}
          <Field
            label="Grammar Points"
            subtitle="Tag the grammar concepts used"
          >
            <GrammarPointSelector
              unitType={state.unitType}
              selectedPoints={state.selectedGrammarPoints}
              onToggle={toggleGrammarPoint}
              readOnly={readOnly}
            />
          </Field>

          {/* SENTENCE ONLY */}
          {state.unitType === UnitType.sentence && (
            <>
              <Field
                label="Sentence Structure"
                subtitle="Describe the sentence form"
              >
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={state.structure}
                    onValueChange={(v) => onChange({ structure: v })}
                    enabled={!readOnly}
                  >
                    <Picker.Item label="Unknown" value={null} />

                    {Object.values(SentenceStructure).map((v) => (
                      <Picker.Item key={v} label={v} value={v} />
                    ))}
                  </Picker>
                </View>
              </Field>

              <Field
                label="Communication Function"
                subtitle="What the sentence is used for"
              >
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={state.func}
                    onValueChange={(v) => onChange({ func: v })}
                    enabled={!readOnly}
                  >
                    <Picker.Item label="Unknown" value={null} />

                    {Object.values(SentenceFunction).map((v) => (
                      <Picker.Item key={v} label={v} value={v} />
                    ))}
                  </Picker>
                </View>
              </Field>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },

  // HEADER
  metadataToggle: {
    backgroundColor: "#FFF",

    borderRadius: 20,

    paddingHorizontal: 18,
    paddingVertical: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  metadataContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  metadataTextContainer: {
    flex: 1,
  },

  metadataIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,

    backgroundColor: "#F3F7FF",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  metadataTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
  },

  metadataSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#777",
  },

  metadataToggleExpanded: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },

  metadataLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.buttonBackground,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,
  },

  // CONTENT

  metadataContainer: {
    marginTop: 16,
    gap: 16,
  },

  // FIELD

  fieldCard: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 18,

    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  fieldHeader: {
    marginBottom: 14,
  },

  fieldLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
  },

  fieldSubtitle: {
    marginTop: 4,
    color: "#777",
    fontSize: 13,
    lineHeight: 18,
  },

  // PICKER

  pickerWrapper: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  // NOTE

  noteCard: {
    marginTop: 14,

    flexDirection: "row",
    alignItems: "flex-start",

    backgroundColor: colors.buttonBackground,

    borderRadius: 16,

    padding: 14,

    gap: 10,
  },

  noteText: {
    flex: 1,
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 20,
  },

  noteBold: {
    fontWeight: "800",
    color: colors.secondary2,
  },
});

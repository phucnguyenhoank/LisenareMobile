import { memo } from "react";
import { Text } from "react-native";
import { S } from "../../theme/grammar_styles";
interface Props {
  text: string;
}

export const QuestionText = memo(function QuestionText({ text }: Props) {
  const parts = text.split(/([….]{2,})/g);
  return (
    <Text style={S.qText}>
      {parts.map((part, i) =>
        /^[….]{2,}$/.test(part) ? (
          <Text key={i} style={S.blank}>
            {"  ______  "}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
});
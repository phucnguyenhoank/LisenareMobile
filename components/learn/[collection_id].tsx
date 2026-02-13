// import { Brick } from "@/types/brick";
// import { useLocalSearchParams } from "expo-router";
// import { useState } from "react";
// import { ActivityIndicator, View } from "react-native";

// export default function LearnScreen() {
//   const { collection_id } = useLocalSearchParams();
//   const [bricks, setBricks] = useState<Brick[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [step, setStep] = useState(1); // 1, 2, or 3

//   const currentBrick = bricks[currentIndex];

//   const next = () => {
//     if (step < 3) {
//       setStep(step + 1);
//     } else if (currentIndex < bricks.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//       setStep(1);
//     } else {
//       router.back(); // Or show "Completed" screen
//     }
//   };

//   if (!currentBrick) return <ActivityIndicator />;

//   // Render the correct component based on step state
//   return (
//     <View style={styles.container}>

//       {step === 1 && <StepListenSpeak brick={currentBrick} onComplete={next} />}
//       {step === 2 && <StepReadSpeak brick={currentBrick} onComplete={next} />}
//       {step === 3 && <StepListenWrite brick={currentBrick} onComplete={next} />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: "column",
//   },
//   contentContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     flexGrow: 1,
//   },
// });

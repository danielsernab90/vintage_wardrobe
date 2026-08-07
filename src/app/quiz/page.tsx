import type { Metadata } from "next";
import { QuizFlow } from "@/components/QuizFlow";

export const metadata: Metadata = {
  title: "Find Your Fit — Archive No.",
  description: "A short style quiz to recommend your starting capsule.",
};

export default function QuizPage() {
  return <QuizFlow />;
}

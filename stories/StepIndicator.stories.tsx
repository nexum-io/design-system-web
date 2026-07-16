import type { Meta, StoryObj } from "@storybook/react-vite";
import { Wallet, FileSignature, CheckCircle2 } from "lucide-react";
import { StepIndicator } from "../blocks/StepIndicator";

const meta: Meta<typeof StepIndicator> = {
  title: "Blocks/StepIndicator",
  component: StepIndicator,
};
export default meta;

type Story = StoryObj<typeof StepIndicator>;

export const Default: Story = {
  args: {
    ariaLabel: "flow",
    steps: [
      { id: "wallet", label: "Wallet", icon: Wallet, status: "completed" },
      { id: "sign", label: "Sign", icon: FileSignature, status: "active" },
      { id: "done", label: "Done", icon: CheckCircle2, status: "upcoming" },
    ],
  },
};

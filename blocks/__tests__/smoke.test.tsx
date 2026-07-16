import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Wallet } from "lucide-react";
import { StepIndicator } from "../StepIndicator";

describe("test harness", () => {
  it("renders a DS block under jsdom", () => {
    render(<StepIndicator ariaLabel="flow" steps={[{ id: "w", label: "Wallet", icon: Wallet, status: "active" }]} />);
    expect(screen.getByRole("list", { name: "flow" })).toBeInTheDocument();
  });
});

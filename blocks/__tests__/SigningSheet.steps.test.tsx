import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { deriveNodeStatuses, SigningSheet } from "../SigningSheet";

const opNodes = [{ id: "review" as const }, { id: "signing" as const }, { id: "completed" as const }];

describe("deriveNodeStatuses", () => {
  it("maps the operation happy path", () => {
    expect(deriveNodeStatuses(opNodes, "idle")).toEqual(["upcoming", "upcoming", "upcoming"]);
    expect(deriveNodeStatuses(opNodes, "review")).toEqual(["active", "upcoming", "upcoming"]);
    expect(deriveNodeStatuses(opNodes, "signing")).toEqual(["completed", "active", "upcoming"]);
    expect(deriveNodeStatuses(opNodes, "completed")).toEqual(["completed", "completed", "completed"]);
  });

  it("collapses executing onto the signing node (single-signer shortcut)", () => {
    expect(deriveNodeStatuses(opNodes, "executing")).toEqual(["completed", "active", "upcoming"]);
  });

  it("marks the active node as error when error is set", () => {
    expect(deriveNodeStatuses(opNodes, "signing", "user rejected")).toEqual(["completed", "error", "upcoming"]);
  });

  it("marks the pre-terminal node on step=failed, honouring failedStep", () => {
    expect(deriveNodeStatuses(opNodes, "failed")).toEqual(["completed", "error", "upcoming"]);
    expect(deriveNodeStatuses(opNodes, "failed", null, "review")).toEqual(["error", "upcoming", "upcoming"]);
  });

  it("surfaces failure on the last node when the target step is missing from custom nodes", () => {
    const customNodes = [{ id: "connect_wallet" as const }, { id: "completed" as const }];
    expect(deriveNodeStatuses(customNodes, "signing", "tx reverted")).toEqual(["upcoming", "error"]);
    expect(deriveNodeStatuses(customNodes, "failed", null, "signing")).toEqual(["upcoming", "error"]);
    expect(deriveNodeStatuses(customNodes, "signing")).toEqual(["upcoming", "upcoming"]);
  });

  it("keeps an explicit executing node active instead of collapsing", () => {
    const fourNodes = [
      { id: "review" as const }, { id: "signing" as const },
      { id: "executing" as const }, { id: "completed" as const },
    ];
    expect(deriveNodeStatuses(fourNodes, "executing")).toEqual(["completed", "completed", "active", "upcoming"]);
  });

  it("collapses failedStep onto its rendered node", () => {
    expect(deriveNodeStatuses(opNodes, "failed", null, "executing")).toEqual(["completed", "error", "upcoming"]);
  });
});

describe("SigningSheet indicator", () => {
  it("renders intent-default nodes with an aria-label", () => {
    render(
      <SigningSheet
        open onOpenChange={() => {}} intent="auth" step="connect_wallet" title="Sign in"
        labels={{ close: "Close", steps: { connect_wallet: "Wallet", signing: "Sign", completed: "Done" } }}
      >
        <p>body</p>
      </SigningSheet>,
    );
    const list = screen.getByRole("list", { name: "Sign in" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText("Wallet")).toBeInTheDocument();
  });

  it("hides the indicator when hideStepIndicator is set", () => {
    render(
      <SigningSheet
        open onOpenChange={() => {}} intent="auth" step="connect_wallet" title="Sign in" hideStepIndicator
        labels={{ close: "Close" }}
      >
        <p>body</p>
      </SigningSheet>,
    );
    expect(screen.queryByRole("list", { name: "Sign in" })).not.toBeInTheDocument();
  });
});

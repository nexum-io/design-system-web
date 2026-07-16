import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SigningSheet, type SigningSheetProps } from "../SigningSheet";

const labels = {
  close: "Close",
  steps: { review: "Review", connect_wallet: "Wallet", signing: "Sign", completed: "Done" },
};

function renderSheet(props: Partial<SigningSheetProps> = {}) {
  const onOpenChange = vi.fn();
  const view = render(
    <SigningSheet
      open
      onOpenChange={onOpenChange}
      intent="operation"
      step="review"
      title="Confirm deposit"
      subtitle="Review the amounts and sign"
      labels={labels}
      {...props}
    >
      <p>body content</p>
    </SigningSheet>,
  );
  return { onOpenChange, view };
}

describe("SigningSheet shell", () => {
  it("renders an accessible dialog titled by the header", () => {
    renderSheet();
    expect(screen.getByRole("dialog", { name: "Confirm deposit" })).toBeInTheDocument();
    expect(screen.getByText("Review the amounts and sign")).toBeInTheDocument();
    expect(screen.getByText("body content")).toBeInTheDocument();
  });

  it("renders the footer region only when footer content is provided", () => {
    const { view } = renderSheet();
    expect(document.querySelector('[data-slot="signing-sheet-footer"]')).toBeNull();
    view.unmount();
    renderSheet({ footer: <button type="button">Sign</button> });
    expect(document.querySelector('[data-slot="signing-sheet-footer"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Sign" })).toBeInTheDocument();
  });

  it("closes via the header close button when not busy", async () => {
    const { onOpenChange } = renderSheet();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("visibly disables close and blocks Escape while busy", async () => {
    const { onOpenChange } = renderSheet({ busy: true });
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("associates the subtitle as the dialog's accessible description", () => {
    renderSheet();
    expect(screen.getByRole("dialog", { name: "Confirm deposit" })).toHaveAccessibleDescription(
      "Review the amounts and sign",
    );
  });

  it("renders without a subtitle and without accessibility warnings", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderSheet({ subtitle: undefined });
    expect(screen.getByRole("dialog", { name: "Confirm deposit" })).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

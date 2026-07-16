import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SigningConfirmDialog } from "../SigningConfirmDialog";

const base = {
  open: true,
  onOpenChange: vi.fn(),
  title: "Reject signing?",
  confirmLabel: "Reject",
  cancelLabel: "Back",
  // Overridden per-test where onConfirm matters; kept here so tests that
  // don't exercise it (e.g. the busy-dismissal test) still satisfy the
  // required prop.
  onConfirm: vi.fn(),
};

describe("SigningConfirmDialog", () => {
  it("keeps confirm disabled until a non-empty reason is entered", async () => {
    const onConfirm = vi.fn();
    render(
      <SigningConfirmDialog
        {...base}
        onConfirm={onConfirm}
        reasonField={{ label: "Reason", requiredError: "Reason is required" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Reason"), "   ");
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
    await userEvent.clear(screen.getByLabelText("Reason"));
    await userEvent.type(screen.getByLabelText("Reason"), "wrong amount");
    await userEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(onConfirm).toHaveBeenCalledWith({ reason: "wrong amount" });
  });

  it("prevents double submit while the confirm promise is pending", async () => {
    let release!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    render(<SigningConfirmDialog {...base} onConfirm={onConfirm} />);
    const confirm = screen.getByRole("button", { name: "Reject" });
    await userEvent.click(confirm);
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    release();
  });

  it("blocks dismissal while busy", async () => {
    const onOpenChange = vi.fn();
    render(<SigningConfirmDialog {...base} onOpenChange={onOpenChange} busy />);
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("resets the reason draft when reopened", async () => {
    const props = { ...base, onConfirm: vi.fn(), reasonField: { label: "Reason" } };
    const { rerender } = render(<SigningConfirmDialog {...props} />);
    await userEvent.type(screen.getByLabelText("Reason"), "draft");
    rerender(<SigningConfirmDialog {...props} open={false} />);
    rerender(<SigningConfirmDialog {...props} open />);
    expect(screen.getByLabelText("Reason")).toHaveValue("");
  });

  it("keeps wrap/size overrides when destructive", () => {
    render(<SigningConfirmDialog {...base} onConfirm={vi.fn()} destructive />);
    const confirm = screen.getByRole("button", { name: "Reject" });
    expect(confirm.className).toContain("whitespace-normal");
    expect(confirm.className).toContain("w-full");
    expect(confirm.className).not.toContain("whitespace-nowrap");
    expect(confirm.className).toContain("bg-destructive");
  });
});

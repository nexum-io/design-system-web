import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OpenDisputeModal, type DisputeCategoryOption } from "../OpenDisputeModal";

const labels = {
  title: "Open a dispute",
  categoryLabel: "Category",
  reasonLabel: "What happened",
  attachmentsLabel: "Attachments",
  submit: "Continue",
  cancel: "Cancel",
};

const baseCategories: DisputeCategoryOption[] = [
  { value: "NOT_DELIVERED", label: "Not delivered" },
  { value: "FRAUD", label: "Fraud" },
];

describe("OpenDisputeModal", () => {
  it("preserves category and reason when categories prop identity changes while open", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn();

    const { rerender } = render(
      <OpenDisputeModal
        open
        onOpenChange={onOpenChange}
        categories={baseCategories}
        labels={labels}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Fraud" }));
    await user.type(screen.getByLabelText("What happened"), "Goods never arrived");

    expect(screen.getByRole("combobox")).toHaveTextContent("Fraud");
    expect(screen.getByLabelText("What happened")).toHaveValue("Goods never arrived");

    rerender(
      <OpenDisputeModal
        open
        onOpenChange={onOpenChange}
        categories={[...baseCategories]}
        labels={labels}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Fraud");
    expect(screen.getByLabelText("What happened")).toHaveValue("Goods never arrived");
  });

  it("resets form when dialog reopens", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn();

    const { rerender } = render(
      <OpenDisputeModal
        open
        onOpenChange={onOpenChange}
        categories={baseCategories}
        labels={labels}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Fraud" }));
    await user.type(screen.getByLabelText("What happened"), "Draft text");

    rerender(
      <OpenDisputeModal
        open={false}
        onOpenChange={onOpenChange}
        categories={baseCategories}
        labels={labels}
        onSubmit={onSubmit}
      />,
    );
    rerender(
      <OpenDisputeModal
        open
        onOpenChange={onOpenChange}
        categories={baseCategories}
        labels={labels}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Not delivered");
    expect(screen.getByLabelText("What happened")).toHaveValue("");
  });
});

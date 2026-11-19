import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DisputeEvidencePanel, type DisputeEvidenceLabels } from "../DisputeEvidencePanel";

const labels: DisputeEvidenceLabels = {
  title: "Your evidence",
  submitTitle: "Add evidence",
  textLabel: "Description",
  attachmentsLabel: "Attachments",
  submit: "Submit",
};

describe("DisputeEvidencePanel attachments", () => {
  it("forgets a rejected file once the evidence is submitted", async () => {
    const onSubmit = vi.fn();
    const { container } = render(<DisputeEvidencePanel evidence={[]} labels={labels} onSubmit={onSubmit} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] } });
    expect(screen.getByRole("alert")).toHaveTextContent("notes.txt");

    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "The parcel never arrived" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ text: "The parcel never arrived", files: [] }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });
});

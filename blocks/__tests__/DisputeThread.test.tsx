import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DisputeThread, type DisputeThreadLabels } from "../DisputeThread";

const labels: DisputeThreadLabels = {
  inputPlaceholder: "Write a message",
  send: "Send",
  attach: "Attach files",
  dropzone: {
    hint: "Drop files here",
    rejectedType: "this type is not accepted",
    rejectedSize: "over the size limit",
    rejectedCount: "over the file limit",
  },
};

function file(name: string, type: string, bytes = 8): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

function renderThread(props: { maxFiles?: number; maxSizeMb?: number } = {}) {
  const view = render(<DisputeThread messages={[]} labels={labels} onSend={vi.fn()} {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Attach files" }));
  const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
  return { input, dropArea: screen.getByRole("button", { name: /Drop files here/ }) };
}

describe("DisputeThread attachments", () => {
  it("says why a file over the size limit was not attached", () => {
    const { input } = renderThread({ maxSizeMb: 1 });

    fireEvent.change(input, { target: { files: [file("scan.png", "image/png", 1024 * 1024 + 1)] } });

    expect(screen.getByRole("alert")).toHaveTextContent("scan.png");
    expect(screen.getByRole("alert")).toHaveTextContent("over the size limit");
  });

  it("says why a dropped file of a type that is not accepted was not attached", () => {
    const { dropArea } = renderThread();

    fireEvent.drop(dropArea, { dataTransfer: { files: [file("notes.txt", "text/plain")] } });

    expect(screen.getByRole("alert")).toHaveTextContent("notes.txt");
    expect(screen.getByRole("alert")).toHaveTextContent("this type is not accepted");
  });

  it("says that the file limit was reached and keeps the files within it", () => {
    const { input } = renderThread({ maxFiles: 2 });

    fireEvent.change(input, {
      target: {
        files: [file("a.pdf", "application/pdf"), file("b.pdf", "application/pdf"), file("c.pdf", "application/pdf")],
      },
    });

    expect(screen.getByRole("alert")).toHaveTextContent("over the file limit");
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(screen.getByText("b.pdf")).toBeInTheDocument();
    expect(screen.queryByText("c.pdf")).not.toBeInTheDocument();
  });
});

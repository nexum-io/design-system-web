import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileDropzone, type FileDropzoneProps } from "../FileDropzone";

const MB = 1024 * 1024;

function file(name: string, type: string, bytes = 8): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

function pdf(name: string, bytes = 8): File {
  return file(name, "application/pdf", bytes);
}

function Dropzone({ initial = [], ...props }: Partial<FileDropzoneProps> & { initial?: File[] }) {
  const [files, setFiles] = React.useState<File[]>(initial);
  return (
    <>
      <FileDropzone value={files} onChange={setFiles} accept=".pdf" {...props} />
      <button type="button" onClick={() => setFiles([])}>
        reset
      </button>
    </>
  );
}

function choose(container: HTMLElement, files: File[]) {
  fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, { target: { files } });
}

describe("FileDropzone rejected files", () => {
  it("keeps the accepted file and names each rejected one with its own reason", () => {
    const { container } = render(
      <Dropzone maxSizeMb={1} labels={{ rejectedType: "wrong type", rejectedSize: "too large" }} />,
    );

    choose(container, [pdf("ok.pdf"), pdf("big.pdf", MB + 1), file("notes.txt", "text/plain")]);

    const alert = screen.getByRole("alert");
    expect(within(alert).getByText(/big\.pdf/)).toHaveTextContent("too large");
    expect(within(alert).getByText(/notes\.txt/)).toHaveTextContent("wrong type");
    expect(within(alert).queryByText(/ok\.pdf/)).not.toBeInTheDocument();
    expect(screen.getByText("ok.pdf")).toBeInTheDocument();
  });

  it("states the limits when the caller passes no rejection labels", () => {
    const { container } = render(<Dropzone maxSizeMb={1} maxFiles={2} />);

    choose(container, [pdf("big.pdf", MB + 1)]);
    expect(screen.getByRole("alert")).toHaveTextContent("1 MB");

    choose(container, [pdf("a.pdf"), pdf("b.pdf"), pdf("c.pdf")]);
    expect(screen.getByRole("alert")).toHaveTextContent("2 files");
  });

  it("words the default limit message for a single-file dropzone", () => {
    const { container } = render(<Dropzone initial={[pdf("a.pdf")]} maxFiles={1} />);

    choose(container, [pdf("b.pdf")]);

    expect(screen.getByRole("alert")).toHaveTextContent(/up to 1 file$/);
  });

  it("drops the message once a later selection is accepted", () => {
    const { container } = render(<Dropzone maxSizeMb={1} />);
    choose(container, [pdf("big.pdf", MB + 1)]);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    choose(container, [pdf("ok.pdf")]);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("drops the message when a file is removed", () => {
    const { container } = render(
      <Dropzone initial={[pdf("a.pdf"), pdf("b.pdf")]} maxFiles={2} labels={{ remove: "Remove" }} />,
    );
    choose(container, [pdf("c.pdf")]);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("drops the message when the parent empties the selection", () => {
    const { container } = render(<Dropzone initial={[pdf("a.pdf")]} maxFiles={1} />);
    choose(container, [pdf("b.pdf")]);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("still reports every rejection through onReject", () => {
    const onReject = vi.fn();
    const { container } = render(<Dropzone maxSizeMb={1} maxFiles={1} onReject={onReject} />);
    const big = pdf("big.pdf", MB + 1);
    const notes = file("notes.txt", "text/plain");

    choose(container, [big, notes, pdf("a.pdf"), pdf("b.pdf")]);

    expect(onReject.mock.calls.map(([reason]) => reason)).toEqual([
      { type: "size", file: big },
      { type: "type", file: notes },
      { type: "count" },
    ]);
  });
});

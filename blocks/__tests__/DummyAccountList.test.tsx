import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DummyAccountList, type DummyAccountListLabels } from "../DummyAccountList";

const labels: DummyAccountListLabels = {
  title: (n) => `Account ${n}`,
  reference: (label) => `Ref ${label}`,
  hint: "Dev only",
};
const accounts = [
  { id: "a1", address: "0x1234567890abcdef1234", label: "alice" },
  { id: "a2", address: "0xabcdef1234567890abcdef1234567890abcdef12", label: "bob" },
];

describe("DummyAccountList", () => {
  it("renders one button per account and selects by id", () => {
    const onSelect = vi.fn();
    render(<DummyAccountList accounts={accounts} connecting={false} onSelect={onSelect} labels={labels} />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByText("Account 1")).toBeInTheDocument();
    expect(screen.getByText("Account 2")).toBeInTheDocument();
    expect(screen.getByText("Ref bob")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Account 2/ }));
    expect(onSelect).toHaveBeenCalledWith("a2");
  });

  it("shortens addresses by default and honours formatAddress", () => {
    const { rerender } = render(
      <DummyAccountList accounts={accounts} connecting={false} onSelect={vi.fn()} labels={labels} />,
    );
    expect(screen.getByText("0x123456...ef1234")).toBeInTheDocument();
    rerender(
      <DummyAccountList
        accounts={accounts}
        connecting={false}
        onSelect={vi.fn()}
        labels={labels}
        formatAddress={(a) => `<${a.length}>`}
      />,
    );
    expect(screen.getByText("<22>")).toBeInTheDocument();
  });

  it("keeps addresses of 17 characters or fewer unchanged", () => {
    const short = [
      { id: "s1", address: "0x123456789abcdef", label: "exact" },
      { id: "s2", address: "0xabc", label: "tiny" },
      { id: "s3", address: "0x123456789abcdef0", label: "over" },
    ];
    render(<DummyAccountList accounts={short} connecting={false} onSelect={vi.fn()} labels={labels} />);
    expect(screen.getByText("0x123456789abcdef")).toBeInTheDocument();
    expect(screen.getByText("0xabc")).toBeInTheDocument();
    expect(screen.getByText("0x123456...bcdef0")).toBeInTheDocument();
  });

  it("disables buttons while connecting", () => {
    render(<DummyAccountList accounts={accounts} connecting onSelect={vi.fn()} labels={labels} />);
    screen.getAllByRole("button").forEach((b) => expect(b).toBeDisabled());
  });

  it("ignores clicks on a disabled row", () => {
    const onSelect = vi.fn();
    render(<DummyAccountList accounts={accounts} connecting onSelect={onSelect} labels={labels} />);
    fireEvent.click(screen.getByRole("button", { name: /Account 1/ }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

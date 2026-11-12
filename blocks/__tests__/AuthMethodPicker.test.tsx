import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthMethodPicker, type AuthMethodPickerLabels } from "../AuthMethodPicker";

const labels: AuthMethodPickerLabels = {
  nexumIdTitle: "Nexum ID",
  nexumIdHint: "Scan QR",
  recommended: "Recommended",
  walletConnectTitle: "WalletConnect",
  walletConnectHint: "Use a wallet",
};

describe("AuthMethodPicker", () => {
  it("lists Nexum ID first with the recommended badge", () => {
    render(<AuthMethodPicker onNexumId={vi.fn()} onWalletConnect={vi.fn()} labels={labels} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("Nexum ID");
    expect(buttons[0]).toHaveTextContent("Recommended");
    expect(buttons[1]).toHaveTextContent("WalletConnect");
    expect(buttons[1]).not.toHaveTextContent("Recommended");
  });

  it("calls the matching handler", () => {
    const onNexumId = vi.fn();
    const onWalletConnect = vi.fn();
    render(<AuthMethodPicker onNexumId={onNexumId} onWalletConnect={onWalletConnect} labels={labels} />);
    fireEvent.click(screen.getByRole("button", { name: /Nexum ID/ }));
    expect(onNexumId).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /WalletConnect/ }));
    expect(onWalletConnect).toHaveBeenCalledTimes(1);
  });

  it("disables both rows", () => {
    render(<AuthMethodPicker disabled onNexumId={vi.fn()} onWalletConnect={vi.fn()} labels={labels} />);
    screen.getAllByRole("button").forEach((b) => expect(b).toBeDisabled());
  });
});

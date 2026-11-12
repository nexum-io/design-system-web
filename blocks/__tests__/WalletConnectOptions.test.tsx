import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WalletConnectOptions, type WalletConnectOptionsLabels } from "../WalletConnectOptions";

const labels: WalletConnectOptionsLabels = {
  allWalletsTitle: "All wallets",
  allWalletsHint: "Pick a wallet",
  qrTitle: "QR code",
  qrHint: "Scan it",
  connecting: "Connecting...",
};

describe("WalletConnectOptions", () => {
  it("renders all wallets first and QR second and wires handlers", () => {
    const onQr = vi.fn();
    const onAllWallets = vi.fn();
    render(<WalletConnectOptions connecting={false} onQr={onQr} onAllWallets={onAllWallets} labels={labels} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("All wallets");
    expect(buttons[1]).toHaveTextContent("QR code");
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    expect(onAllWallets).toHaveBeenCalledTimes(1);
    expect(onQr).toHaveBeenCalledTimes(1);
  });

  it("disables both and shows connecting copy", () => {
    render(<WalletConnectOptions connecting onQr={vi.fn()} onAllWallets={vi.fn()} labels={labels} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((b) => expect(b).toBeDisabled());
    expect(buttons[1]).toHaveTextContent("Connecting...");
    expect(buttons[1]).not.toHaveTextContent("QR code");
  });
});

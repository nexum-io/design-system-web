import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SignStepTimeline } from "../SignStepTimeline";

describe("SignStepTimeline", () => {
  it("renders all steps vertically with statuses and active body", () => {
    render(
      <SignStepTimeline
        ariaLabel="Sign in steps"
        steps={[
          {
            id: "wallet",
            label: "Wallet",
            status: "completed",
            description: "Connect a wallet",
            result: "0xA1…9f",
          },
          {
            id: "sign",
            label: "Signature",
            status: "active",
            description: "One free signature",
            children: <p>Sign prompt body</p>,
          },
          {
            id: "done",
            label: "Done",
            status: "pending",
            description: "Finish sign-in",
          },
        ]}
      />,
    );

    const list = screen.getByRole("list", { name: "Sign in steps" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(items[0]!).getByText("Wallet")).toBeInTheDocument();
    expect(within(items[0]!).getByText("0xA1…9f")).toBeInTheDocument();
    expect(within(items[1]!).getByText("Sign prompt body")).toBeInTheDocument();
    expect(screen.queryByText("Finish sign-in")).toBeInTheDocument();
  });

  it("shows children for error status and hides children for pending", () => {
    render(
      <SignStepTimeline
        ariaLabel="Sign in steps"
        steps={[
          { id: "wallet", label: "Wallet", status: "completed" },
          {
            id: "sign",
            label: "Signature",
            status: "error",
            children: <button type="button">Retry panel</button>,
          },
          {
            id: "done",
            label: "Done",
            status: "pending",
            children: <p>Should not show</p>,
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Retry panel" })).toBeInTheDocument();
    expect(screen.queryByText("Should not show")).toBeNull();
  });

  it("renders trailing action beside completed wallet text", () => {
    render(
      <SignStepTimeline
        ariaLabel="Sign in steps"
        steps={[
          {
            id: "wallet",
            label: "Wallet",
            status: "completed",
            description: "Connect a wallet",
            result: "Connected · 0xA1…9f",
            trailing: <button type="button">Disconnect wallet</button>,
          },
          {
            id: "sign",
            label: "Signature",
            status: "active",
          },
        ]}
      />,
    );

    const list = screen.getByRole("list", { name: "Sign in steps" });
    const walletItem = within(list).getAllByRole("listitem")[0]!;
    expect(within(walletItem).getByText("Connected · 0xA1…9f")).toBeInTheDocument();
    expect(within(walletItem).getByRole("button", { name: "Disconnect wallet" })).toBeInTheDocument();
  });
});

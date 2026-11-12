import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  AuthMethodPicker,
  DummyAccountList,
  NexumIdQrPanel,
  SigningSheet,
  WalletConnectOptions,
  type AuthMethodPickerLabels,
  type DummyAccount,
  type DummyAccountListLabels,
  type NexumIdQrPanelLabels,
  type SigningStep,
  type WalletConnectOptionsLabels,
} from "../blocks";
import { Button } from "../primitives/button";

const meta: Meta = {
  title: "Blocks/AuthBlocks",
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

const pickerLabels: AuthMethodPickerLabels = {
  nexumIdTitle: "Nexum ID",
  nexumIdHint: "Scan a code with the Nexum ID app on your phone",
  recommended: "Recommended",
  walletConnectTitle: "WalletConnect",
  walletConnectHint: "Browser extension, mobile app, or hardware wallet",
};

const walletOptionsLabels: WalletConnectOptionsLabels = {
  allWalletsTitle: "All wallets",
  allWalletsHint: "Browser extension, mobile app, or hardware wallet",
  qrTitle: "Connect via QR",
  qrHint: "Scan with a phone wallet",
  connecting: "Opening wallet…",
};

const dummyLabels: DummyAccountListLabels = {
  title: (n) => `Test wallet ${n}`,
  reference: (label) => `Config key: ${label}`,
  hint: "Remote dev signer from dummySigners.json",
};

const dummyAccounts: DummyAccount[] = [
  { id: "a1", address: "0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b9f0e", label: "dev-signer-1" },
  { id: "a2", address: "0x9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e1c2d", label: "dev-signer-2" },
];

const qrLabels: NexumIdQrPanelLabels = {
  appRequired:
    "You need the Nexum ID app, already signed in on your phone. Open it, scan the code below, and confirm.",
  qrAlt: "Nexum ID sign-in code",
  copyCode: "Copy sign-in code",
  copied: "Copied",
  creating: "Preparing a sign-in code…",
  waiting: "Waiting for confirmation on your phone",
  completing: "Finishing sign-in…",
  rotates: "The code is short-lived and refreshes on its own.",
  expiresIn: (seconds) => `Valid for ${seconds}s — scan this code, not an older one.`,
  newCode: "Get a new code",
  useWallet: "Choose another method",
};

const samplePayload = "nexum-id://login?i=demo&e=2026-11-12T12:00:00Z";
const noop = () => {};

/** Applies the design system dark theme (`.dark` on <html>, so portaled sheets follow) while mounted. */
function DarkTheme({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const root = document.documentElement;
    const had = root.classList.contains("dark");
    root.classList.add("dark");
    return () => {
      if (!had) root.classList.remove("dark");
    };
  }, []);
  return <>{children}</>;
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md bg-background p-6 text-foreground">{children}</div>;
}

export const Picker: Story = {
  render: () => (
    <Frame>
      <AuthMethodPicker onNexumId={noop} onWalletConnect={noop} labels={pickerLabels} />
    </Frame>
  ),
};

export const PickerDark: Story = {
  render: () => (
    <DarkTheme>
      <Frame>
        <AuthMethodPicker onNexumId={noop} onWalletConnect={noop} labels={pickerLabels} />
      </Frame>
    </DarkTheme>
  ),
};

export const WalletOptions: Story = {
  render: () => (
    <Frame>
      <WalletConnectOptions connecting={false} onQr={noop} onAllWallets={noop} labels={walletOptionsLabels} />
    </Frame>
  ),
};

export const WalletOptionsConnecting: Story = {
  render: () => (
    <Frame>
      <WalletConnectOptions connecting onQr={noop} onAllWallets={noop} labels={walletOptionsLabels} />
    </Frame>
  ),
};

export const DummyAccounts: Story = {
  render: () => (
    <Frame>
      <DummyAccountList accounts={dummyAccounts} connecting={false} onSelect={noop} labels={dummyLabels} />
    </Frame>
  ),
};

export const QrPanelCreating: Story = {
  render: () => (
    <Frame>
      <NexumIdQrPanel
        phase="creating"
        qrPayload={null}
        expiresAt={null}
        error={null}
        onRestart={noop}
        onUseWallet={noop}
        labels={qrLabels}
      />
    </Frame>
  ),
};

function WaitingPanel() {
  const [expiresAt] = React.useState(() => new Date(Date.now() + 90_000).toISOString());
  return (
    <NexumIdQrPanel
      phase="waiting"
      qrPayload={samplePayload}
      expiresAt={expiresAt}
      error={null}
      onRestart={noop}
      onUseWallet={noop}
      labels={qrLabels}
    />
  );
}

export const QrPanelWaiting: Story = {
  render: () => (
    <Frame>
      <WaitingPanel />
    </Frame>
  ),
};

/** The QR must stay near-black on its white pad in dark theme. */
export const QrPanelWaitingDark: Story = {
  render: () => (
    <DarkTheme>
      <Frame>
        <WaitingPanel />
      </Frame>
    </DarkTheme>
  ),
};

export const QrPanelError: Story = {
  render: () => (
    <Frame>
      <NexumIdQrPanel
        phase="waiting"
        qrPayload={samplePayload}
        expiresAt={null}
        error="Lost contact with the server. Retrying…"
        onRestart={noop}
        onUseWallet={noop}
        labels={qrLabels}
      />
    </Frame>
  ),
};

type AuthView = "method" | "nexum_id" | "wallet_options";

const stepLabels = { review: "Review", connect_wallet: "Wallet", signing: "Sign", completed: "Done" };

/** Auth sheet: method picker → Nexum ID QR or WalletConnect options, composed like escrow's SignSheet. */
function InSigningSheetDemo({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = React.useState(true);
  const [view, setView] = React.useState<AuthView>("method");
  const [step] = React.useState<SigningStep>("connect_wallet");
  const [expiresAt] = React.useState(() => new Date(Date.now() + 90_000).toISOString());

  const body =
    view === "method" ? (
      <AuthMethodPicker
        onNexumId={() => setView("nexum_id")}
        onWalletConnect={() => setView("wallet_options")}
        labels={pickerLabels}
      />
    ) : view === "nexum_id" ? (
      <NexumIdQrPanel
        phase="waiting"
        qrPayload={samplePayload}
        expiresAt={expiresAt}
        error={null}
        onRestart={noop}
        onUseWallet={() => setView("method")}
        labels={qrLabels}
      />
    ) : (
      <div className="space-y-3">
        <WalletConnectOptions connecting={false} onQr={noop} onAllWallets={noop} labels={walletOptionsLabels} />
        <Button variant="ghost" size="sm" className="w-full" onClick={() => setView("method")}>
          Choose another method
        </Button>
      </div>
    );

  const content = (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <SigningSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setView("method");
        }}
        intent="auth"
        step={step}
        labels={{ close: "Close", steps: stepLabels }}
        title="Sign in to Nexum Escrow"
        subtitle={view === "nexum_id" ? "Scan with Nexum ID on your phone — no wallet on this device" : undefined}
      >
        {body}
      </SigningSheet>
    </>
  );
  return dark ? <DarkTheme>{content}</DarkTheme> : content;
}

export const InSigningSheet: Story = {
  render: () => <InSigningSheetDemo />,
};

export const InSigningSheetDark: Story = {
  render: () => <InSigningSheetDemo dark />,
};

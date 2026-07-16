import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { FileSignature, Wallet } from "lucide-react";
import { SigningSheet, type SigningStep } from "../blocks/SigningSheet";
import { StepStatusPanel } from "../blocks/StepStatusPanel";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../primitives/button";

const meta: Meta<typeof SigningSheet> = {
  title: "Blocks/SigningSheet",
  component: SigningSheet,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof SigningSheet>;

const stepLabels = { review: "Review", connect_wallet: "Wallet", signing: "Sign", completed: "Done" };

/** Deal-signing simulation: review → sign in wallet → executing → completed. */
function OperationDemo() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<SigningStep>("review");
  const [error, setError] = React.useState<string | null>(null);

  const busy = (step === "signing" || step === "executing") && !error;

  React.useEffect(() => {
    if (!open || error) return;
    if (step === "signing") {
      const timer = setTimeout(() => setStep("executing"), 1500);
      return () => clearTimeout(timer);
    }
    if (step === "executing") {
      const timer = setTimeout(() => setStep("completed"), 1500);
      return () => clearTimeout(timer);
    }
  }, [open, step, error]);

  function handleOpen() {
    setStep("review");
    setError(null);
    setOpen(true);
  }

  let footer: React.ReactNode = null;
  if (step === "review") {
    footer = (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="gradient"
          onClick={() => {
            setError(null);
            setStep("signing");
          }}
        >
          Sign in wallet
        </Button>
      </div>
    );
  } else if (step === "signing" && error) {
    footer = (
      <div className="flex justify-end gap-2">
        <Button
          variant="gradient"
          onClick={() => {
            setError(null);
            setStep("signing");
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button onClick={handleOpen}>Open</Button>
      <SigningSheet
        open={open}
        onOpenChange={setOpen}
        intent="operation"
        step={step}
        busy={busy}
        error={error}
        labels={{ close: "Close", steps: stepLabels, busyHint: "Don't close this window" }}
        title="Confirm deposit"
        subtitle="1,050.00 USDT on Polygon"
        icon={<Wallet className="h-5 w-5 text-white" />}
        badge={
          <StatusBadge variant="success" dot>
            Gas-free
          </StatusBadge>
        }
        itemId="deal-42"
        closeConfirm={
          step === "review"
            ? {
                title: "Abandon signing?",
                description: "Nothing has been signed yet.",
                confirmLabel: "Abandon",
                cancelLabel: "Stay",
              }
            : null
        }
        footer={footer}
      >
        {step === "review" ? (
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium text-foreground">1,050.00 USDT</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Network</dt>
              <dd className="font-medium text-foreground">Polygon</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Wallet</dt>
              <dd className="font-medium text-foreground">0x1a2b...9f0e</dd>
            </div>
          </dl>
        ) : null}

        {step === "signing" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Confirm the signature request in your connected wallet…
            </p>
            {!error ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError("User rejected the signature")}
              >
                Simulate reject
              </Button>
            ) : null}
          </div>
        ) : null}

        {step === "executing" ? (
          <p className="text-sm text-muted-foreground">Submitting the transaction…</p>
        ) : null}

        {step === "completed" ? (
          <p className="text-sm text-foreground">Deposit confirmed on Polygon.</p>
        ) : null}
      </SigningSheet>
    </>
  );
}

/** Wallet sign-in: pick a wallet → sign a message → completed. */
function AuthFlowDemo() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<SigningStep>("connect_wallet");
  const [error, setError] = React.useState<string | null>(null);

  const busy = step === "signing" && !error;

  React.useEffect(() => {
    if (!open || error) return;
    if (step === "signing") {
      const timer = setTimeout(() => setStep("completed"), 1500);
      return () => clearTimeout(timer);
    }
  }, [open, step, error]);

  function handleOpen() {
    setStep("connect_wallet");
    setError(null);
    setOpen(true);
  }

  function connect() {
    setError(null);
    setStep("signing");
  }

  return (
    <>
      <Button onClick={handleOpen}>Open</Button>
      <SigningSheet
        open={open}
        onOpenChange={setOpen}
        intent="auth"
        step={step}
        busy={busy}
        error={error}
        labels={{ close: "Close", steps: stepLabels }}
        title="Sign in to Nexum Escrow"
      >
        {step === "connect_wallet" ? (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={connect}
              className="flex items-center gap-3 rounded-xl border border-border-muted p-4 text-left transition-colors hover:bg-bg-subtle"
            >
              <Wallet className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Demo wallet</p>
                <p className="text-xs text-muted-foreground">Connect instantly for this demo</p>
              </div>
            </button>
            <button
              type="button"
              onClick={connect}
              className="flex items-center gap-3 rounded-xl border border-border-muted p-4 text-left transition-colors hover:bg-bg-subtle"
            >
              <Wallet className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">WalletConnect</p>
                <p className="text-xs text-muted-foreground">Scan a QR code with your wallet</p>
              </div>
            </button>
          </div>
        ) : null}

        {step === "signing" ? (
          <div className="space-y-3">
            <StepStatusPanel
              icon={FileSignature}
              label="Waiting for signature"
              description="Confirm the sign-in request in your wallet."
              status={error ? "error" : "active"}
              loading={!error}
              error={error}
            />
            {!error ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError("User rejected the signature")}
              >
                Simulate reject
              </Button>
            ) : null}
          </div>
        ) : null}

        {step === "completed" ? (
          <p className="text-sm text-foreground">You're signed in.</p>
        ) : null}
      </SigningSheet>
    </>
  );
}

/** Connect-only intent: a single connect step, no signing. */
function ConnectOnlyDemo() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<SigningStep>("connect_wallet");

  return (
    <>
      <Button
        onClick={() => {
          setStep("connect_wallet");
          setOpen(true);
        }}
      >
        Open
      </Button>
      <SigningSheet
        open={open}
        onOpenChange={setOpen}
        intent="connect-only"
        step={step}
        labels={{ close: "Close", steps: stepLabels }}
        title="Connect your wallet"
        subtitle="Read-only access to view your balance"
      >
        {step === "connect_wallet" ? (
          <Button onClick={() => setStep("completed")}>Connect wallet</Button>
        ) : (
          <p className="text-sm text-foreground">Wallet connected.</p>
        )}
      </SigningSheet>
    </>
  );
}

export const Operation: Story = {
  render: () => <OperationDemo />,
};

export const AuthFlow: Story = {
  render: () => <AuthFlowDemo />,
};

export const ConnectOnly: Story = {
  render: () => <ConnectOnlyDemo />,
};

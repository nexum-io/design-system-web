import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { SigningConfirmDialog } from "../blocks/SigningConfirmDialog";
import { Button } from "../primitives/button";

const meta: Meta<typeof SigningConfirmDialog> = {
  title: "Blocks/SigningConfirmDialog",
  component: SigningConfirmDialog,
};
export default meta;

type Story = StoryObj<typeof SigningConfirmDialog>;

function ConfirmDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Reject signing
      </Button>
      <SigningConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Reject this request?"
        description="You can resubmit a new signature request later."
        confirmLabel="Reject"
        cancelLabel="Back"
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}

function DestructiveWithReasonDemo() {
  const [open, setOpen] = React.useState(false);
  const [capturedReason, setCapturedReason] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Reject signing
      </Button>
      {capturedReason ? (
        <p className="text-sm text-muted-foreground">Captured reason: &ldquo;{capturedReason}&rdquo;</p>
      ) : null}
      <SigningConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Reject this request?"
        description="Let the other party know why you're rejecting."
        confirmLabel="Reject"
        cancelLabel="Back"
        destructive
        reasonField={{
          label: "Reason",
          placeholder: "Why are you rejecting?",
          requiredError: "Reason is required",
        }}
        onConfirm={(input) => {
          setCapturedReason(input.reason ?? null);
          setOpen(false);
        }}
      />
    </div>
  );
}

function BusyDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Reject signing
      </Button>
      <SigningConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Reject this request?"
        description="Submitting your rejection…"
        confirmLabel="Reject"
        cancelLabel="Back"
        busy
        onConfirm={() => {}}
      />
    </>
  );
}

export const Confirm: Story = {
  render: () => <ConfirmDemo />,
};

export const DestructiveWithReason: Story = {
  render: () => <DestructiveWithReasonDemo />,
};

export const Busy: Story = {
  render: () => <BusyDemo />,
};

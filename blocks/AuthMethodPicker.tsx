import { ShieldCheck, Wallet } from "lucide-react";
import { AuthChoiceRow } from "./AuthChoiceRow";

export interface AuthMethodPickerLabels {
  nexumIdTitle: string;
  nexumIdHint: string;
  recommended: string;
  walletConnectTitle: string;
  walletConnectHint: string;
}

export interface AuthMethodPickerProps {
  onNexumId: () => void;
  onWalletConnect: () => void;
  disabled?: boolean;
  labels: AuthMethodPickerLabels;
}

/** First auth step: Nexum ID (recommended), then WalletConnect. */
export function AuthMethodPicker({ onNexumId, onWalletConnect, disabled, labels }: AuthMethodPickerProps) {
  return (
    <div className="mx-auto grid w-full gap-3">
      <AuthChoiceRow
        disabled={disabled}
        onClick={onNexumId}
        icon={<ShieldCheck className="size-5" aria-hidden />}
        iconVariant="brand"
        title={labels.nexumIdTitle}
        hint={labels.nexumIdHint}
        badge={labels.recommended}
        featured
      />
      <AuthChoiceRow
        disabled={disabled}
        onClick={onWalletConnect}
        icon={<Wallet className="size-5" aria-hidden />}
        iconVariant="neutral"
        title={labels.walletConnectTitle}
        hint={labels.walletConnectHint}
      />
    </div>
  );
}

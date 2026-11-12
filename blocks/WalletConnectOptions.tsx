import { Loader2, QrCode, Wallet } from "lucide-react";
import { AuthChoiceRow } from "./AuthChoiceRow";

export interface WalletConnectOptionsLabels {
  allWalletsTitle: string;
  allWalletsHint: string;
  qrTitle: string;
  qrHint: string;
  connecting: string;
}

export interface WalletConnectOptionsProps {
  connecting: boolean;
  onQr: () => void;
  onAllWallets: () => void;
  labels: WalletConnectOptionsLabels;
}

export function WalletConnectOptions({ connecting, onQr, onAllWallets, labels }: WalletConnectOptionsProps) {
  return (
    <div className="mx-auto grid w-full gap-3">
      <AuthChoiceRow
        disabled={connecting}
        onClick={onAllWallets}
        icon={<Wallet className="size-5" aria-hidden />}
        iconVariant="neutral"
        title={labels.allWalletsTitle}
        hint={labels.allWalletsHint}
      />
      <AuthChoiceRow
        disabled={connecting}
        onClick={onQr}
        icon={
          connecting ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <QrCode className="size-5" aria-hidden />
          )
        }
        iconVariant="neutral"
        title={connecting ? labels.connecting : labels.qrTitle}
        hint={labels.qrHint}
      />
    </div>
  );
}

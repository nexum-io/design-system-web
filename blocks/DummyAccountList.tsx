import type { ReactNode } from "react";
import { Card } from "../components/Card";
import { Identicon } from "../components/Identicon";
import { cx } from "../utils/cx";

export interface DummyAccount {
  id: string;
  address: string;
  label: string;
}

export interface DummyAccountListLabels {
  title: (n: number) => string;
  reference: (label: string) => string;
  hint: string;
}

export interface DummyAccountListProps {
  accounts: DummyAccount[];
  connecting: boolean;
  onSelect: (accountId: string) => void;
  labels: DummyAccountListLabels;
  formatAddress?: (address: string) => string;
}

function defaultFormatAddress(address: string): string {
  if (address.length <= 17) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function SelectableWalletCard({
  disabled,
  onClick,
  children,
  className,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "flex h-full w-full cursor-pointer text-left transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      <Card
        variant="outline"
        padding="sm"
        className="h-full w-full hover:border-brand/35 hover:bg-bg-subtle focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-ring/30"
      >
        {children}
      </Card>
    </button>
  );
}

export function DummyAccountList({
  accounts,
  connecting,
  onSelect,
  labels,
  formatAddress = defaultFormatAddress,
}: DummyAccountListProps) {
  return (
    <div className="mx-auto grid w-full gap-3">
      {accounts.map((account, index) => (
        <SelectableWalletCard key={account.id} disabled={connecting} onClick={() => onSelect(account.id)}>
          <div className="flex items-start gap-3">
            <Identicon seed={account.address} className="mt-0.5 size-10 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-foreground">{labels.title(index + 1)}</p>
              <p className="font-mono text-sm text-foreground">{formatAddress(account.address)}</p>
              <p className="text-xs text-muted-foreground">{labels.reference(account.label)}</p>
              <p className="text-xs text-muted-foreground">{labels.hint}</p>
            </div>
          </div>
        </SelectableWalletCard>
      ))}
    </div>
  );
}

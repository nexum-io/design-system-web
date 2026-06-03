/**
 * Example: consuming the design system from application code.
 *
 * Everything is imported from the `@/design-system` barrel and styled with
 * semantic, theme-aware tokens — no raw palette values, no hardcoded colors.
 */
import { Gavel, Plus, Wallet } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyChip,
  EmptyState,
  IconBox,
  Input,
  KpiCard,
  Label,
  PageContent,
  PageHeader,
  PageLayout,
  StatusBadge,
} from '@/design-system';

export function DealsDashboardExample() {
  return (
    <PageLayout bg="subtle">
      <PageContent>
        <PageHeader
          title="Deals"
          subtitle="Manage and track your escrow agreements"
          action={
            <Button>
              <Plus /> New deal
            </Button>
          }
        />

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Active deals" value="128" delta="+12 this week" deltaTone="success" icon={<Wallet />} />
          <KpiCard label="In escrow" value="$1.2M" delta="-3.4%" deltaTone="danger" icon={<Wallet />} iconTone="brand" />
          <KpiCard label="Open disputes" value="7" deltaTone="warning" icon={<Gavel />} iconTone="warning" />
        </div>

        {/* A card with status + a copyable address */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Deal #1042</CardTitle>
            <StatusBadge variant="success">Funds locked</StatusBadge>
          </CardHeader>
          <CardContent className="mt-3 space-y-3">
            <div className="flex items-center gap-3">
              <IconBox variant="info">
                <Wallet />
              </IconBox>
              <CopyChip value="0x1234567890abcdef1234567890abcdef12345678" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" placeholder="0.00" />
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        <div className="mt-6">
          <EmptyState
            icon={<Wallet className="text-fg-subtle size-7" />}
            title="No archived deals"
            subtitle="Completed deals will appear here."
            action={<Button size="sm">Browse active</Button>}
          />
        </div>
      </PageContent>
    </PageLayout>
  );
}

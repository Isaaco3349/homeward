export interface SpendPolicy {
  monthlyCapUsd: number;
  perTransferMaxUsd: number;
  allowedHandles: string[];
}

export interface PolicyUsage {
  monthKey: string;
  spentUsd: number;
}

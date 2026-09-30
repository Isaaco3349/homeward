import type { SpendPolicy } from "./types";

export const DEFAULT_POLICY: SpendPolicy = {
  monthlyCapUsd: 500,
  perTransferMaxUsd: 200,
  allowedHandles: ["mum"],
};

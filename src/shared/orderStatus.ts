export const ORDER_STATUSES = ["pending", "progress", "done"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Очікує",
  progress: "В обробці",
  done: "Виконано",
};

export const getOrderStatusLabel = (status?: string): string => {
  const normalized = status ?? "pending";
  return ORDER_STATUSES.includes(normalized as OrderStatus)
    ? ORDER_STATUS_LABELS[normalized as OrderStatus]
    : ORDER_STATUS_LABELS.pending;
};

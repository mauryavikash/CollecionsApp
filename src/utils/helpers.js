export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  }

  return value;
}
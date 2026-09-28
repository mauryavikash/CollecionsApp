export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  icon: Icon,
  iconPosition = "left",
  ...props
}) {
  const variants = {
    primary:
      "bg-dgem-blue text-white hover:bg-dgem-light-blue focus:ring-dgem-blue shadow-sm hover:shadow-md",
    secondary:
      "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)] focus:ring-[var(--border)] border border-[var(--border)] shadow-sm hover:shadow-md",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 shadow-sm hover:shadow-md",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600 shadow-sm hover:shadow-md",
    warning:
      "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 shadow-sm hover:shadow-md",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon size={16} />}
      {children && <span>{children}</span>}
      {Icon && iconPosition === "right" && <Icon size={16} />}
    </button>
  );
}
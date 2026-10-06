import KpiTooltip from "./KpiTooltip";

// Visual presets shared by every KPI card grid across the app
const VARIANTS = {
  default: {
    // border: "border-[2px] border-[#103feb]",
    titleClass:
      "text-[10px] font-bold uppercase tracking-[0.06em] text-[#64748B] leading-tight",
    iconBox: "h-8 w-8",
    iconSize: 15,
    valueClass: "text-[22px] leading-[26px]",
  },
  audit: {
    // border: "border-[2px] border-[#103feb]",
    titleClass: "text-[12px] font-medium text-[#475569]",
    iconBox: "h-7 w-7",
    iconSize: 14,
    valueClass: "text-[22px] leading-[26px]",
  },
  vendor: {
    // border: "border-[2px] border-[#103feb]",
    titleClass:
      "text-[10px] font-bold uppercase tracking-[0.06em] text-[#64748B]",
    iconBox: "h-8 w-8",
    iconSize: 15,
    valueClass: "text-[24px] leading-[28px]",
  },
};

export default function KpiCardsGrid({
  items = [],
  columns = "xl:grid-cols-5",
  variant = "default",
}) {
  const style = VARIANTS[variant] ?? VARIANTS.default;

  return (
    // <div className={`grid grid-cols-2 md:grid-cols-3 ${columns} gap-3`}>
  <div
  className="grid gap-3"
  style={{
    gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))`,
  }}
>
        {items.map((item) => {
        const Icon = item.icon;
        return (
          <KpiTooltip
            key={item.title}
            invoiceCount={item.invoiceCount}
            invoiceValue={item.invoiceValue}
          >
            {/* <div
              className={`
                rounded-[10px]
                border
                ${style.border}
                bg-white
                shadow-[0px_1px_4px_rgba(15,23,42,0.05)]
                px-2
                py-2
                min-h-[105px]
                flex
                flex-col
                justify-between
              `}
            > */}

            <div
              className="
                rounded-[10px]
                bg-white
                shadow-[0px_1px_4px_rgba(15,23,42,0.05)]
                px-2
                py-2
                min-h-[105px]
                flex
                flex-col
                justify-between
              "
              style={{
                borderWidth: "1.5px",
                borderStyle: "solid",
                borderColor: "transparent",
                backgroundImage:
                  "linear-gradient(white, white), linear-gradient(135deg, #1e3a8a 0%, #3b82f6 55%, #10b981 100%)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
              }}
            >

            
              <div className="flex items-start justify-between gap-2">
                <p className={style.titleClass}>{item.title}</p>

                {Icon && (
                  <div
                    className={`${style.iconBox} rounded-lg flex items-center justify-center shrink-0`}
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <Icon size={style.iconSize} style={{ color: item.iconColor }} />
                  </div>
                )}
              </div>

              {item.distribution ? (
                <div className="flex flex-col gap-1">
                  {item.distribution.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: row.color }}
                        />
                        <span className="text-[#475569]">{row.label}:</span>
                      </div>
                      <span className="font-semibold text-[#0F172A]">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <h3 className={`${style.valueClass} font-bold text-[#0F172A]`}>
                    {item.value}
                  </h3>

                  {item.change !== undefined ? (
                    <p
                      className={`mt-1 text-[11px] font-medium flex items-center gap-1 ${
                        item.positive ? "text-[#10B981]" : "text-[#F59E0B]"
                      }`}
                    >
                      {item.positive ? "↑" : "↓"} {item.change}{" "}
                      <span className="text-[#94A3B8] font-normal">
                        {item.comparison}
                      </span>
                    </p>
                  ) : (
                    <p className={`mt-1 text-[11px] font-medium ${item.supportingColor}`}>
                      {item.supporting}
                    </p>
                  )}
                </div>
              )}
            </div>
          </KpiTooltip>
        );
      })}
    </div>
  );
}

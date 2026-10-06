const AGING_ORDER = ["1-30d", "31-60d", "61-90d", "91-180d", "181+d"];

const AGING_COLORS = {
  "1-30d": "#16a34a",
  "31-60d": "#65a30d",
  "61-90d": "#d97706",
  "91-180d": "#ea580c",
  "181+d": "#dc2626",
};

const AGING_AMOUNTS_FALLBACK = {
  "61-90d": "$197K",
  "91-180d": "$237K",
  "181+d": "$355K",
};

function normalizeLabel(label = "") {
  const value = String(label).trim().toLowerCase();

  if (value === "0-30d") {
    return "1-30d";
  }

  if (value === "181+" || value === "181+ days" || value === "181+d") {
    return "181+d";
  }

  return value;
}

function getAgingItems(aging = []) {
  const mapped = AGING_ORDER.map((bucket) => {
    const source = aging.find(
      (item) => normalizeLabel(item?.label) === bucket
    );

    return {
      label: bucket,
      percent: Number(source?.percent) || 0,
      color: source?.color || AGING_COLORS[bucket],
      amount: source?.amount || AGING_AMOUNTS_FALLBACK[bucket],
    };
  });

  return mapped;
}

export default function Overview({ data }) {
  const information = data?.information ?? [];
  const agingItems = getAgingItems(data?.aging ?? []);
  const overdueItems = agingItems.filter((item) =>
    ["91-180d", "181+d", "61-90d"].includes(item.label)
  );

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section className="min-w-0 rounded-[11px] bg-white p-4 shadow-sm">
        <h2 className="text-[11px] font-bold">Account Information</h2>

        <div className="mt-2">
          {information.map((item) => (
            <p
              key={item.label}
              className="flex justify-between border-b border-slate-200 py-2 text-[11px]"
            >
              <span className="text-slate-500">{item.label}</span>
              <b>{item.value}</b>
            </p>
          ))}
        </div>
      </section>

      <section className="min-w-0 rounded-[11px] bg-white p-4 shadow-sm">
        <h2 className="text-[11px] font-bold">Invoice Aging Distribution</h2>

        <div className="mt-4 grid grid-cols-5 gap-1">
          {agingItems.map((item) => (
            <div key={item.label} className="text-center">
              <p className="mb-1 text-[6px] font-semibold text-slate-400">
                {item.percent}%
              </p>

              <div
                className="h-[10px] rounded-[2px]"
                style={{ backgroundColor: item.color }}
                aria-label={`${item.label} ${item.percent}%`}
              />

              <p className="mt-1 text-[6px] text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 text-[9px]">
          <p className="mb-1 text-slate-500">Overdue by age</p>

          <div className="space-y-0.5">
            {overdueItems.map((item) => (
              <p key={item.label} className="flex items-center justify-between">
                <span className="text-slate-500">
                  <i
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>

                <b className="text-orange-500">{item.amount}</b>
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
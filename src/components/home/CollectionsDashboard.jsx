import CollectionCashRecovery from "./CollectionCashRecovery";
import CollectionChart from "./CollectionChart";
import CollectionKpiCard from "./CollectionKpiCard";
import CollectionTable from "./CollectionTable";

export default function CollectionsDashboard({ data }) {
  return (
    <main className="min-h-full text-slate-800">
      <div className="mx-auto max-w-[1480px] space-y-4">
        <CollectionKpiCard kpis={data.kpis} />
        <CollectionCashRecovery
          forecast={data.forecast}
          riskAccounts={data.riskAccounts}
        />
        <CollectionChart
          riskDistribution={data.riskDistribution}
          collectors={data.collectors}
        />
        <CollectionTable activity={data.ptpActivity} />
      </div>
    </main>
  );
}

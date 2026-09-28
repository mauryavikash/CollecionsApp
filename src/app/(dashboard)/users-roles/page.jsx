import {Card} from "@/components/common/Card";
// import { roleCards } from "@/data/mockData";

export default function UsersRolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="title-lg">Users & Roles</h1>
        <p className="subtitle mt-1">Role mapping and access control scaffold.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* {roleCards.map((item) => (
          <Card key={item.role} className="p-5">
            <p className="text-base font-semibold text-slate-900">{item.role}</p>
            <p className="mt-2 text-sm text-slate-500">{item.access}</p>
          </Card>
        ))} */}
      </div>
    </div>
  );
}
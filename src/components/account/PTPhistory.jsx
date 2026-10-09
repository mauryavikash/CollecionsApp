// export default function PTPhistory({ history = [] }) {
//   return (
//     <section className="mt-4 rounded-[11px] bg-white p-4 shadow-sm">
//       {history.map((item) => (
//         <article key={item.invoice}>
//           <div className="flex justify-between text-[10px]">
//             <p>
//               <span className="rounded bg-rose-100 px-2 py-1 font-semibold text-red-500">
//                 {item.status}
//               </span>
//               <b className="ml-2 text-slate-500">{item.invoice}</b>
//             </p>
//             <p className="text-slate-500">
//               Created: {item.created}
//               <span className="ml-5">Promise: {item.promise}</span>
//             </p>
//           </div>
//           <p className="mt-4 text-[27px] font-bold text-slate-800">
//             {item.amount}
//           </p>
//           <p className="mt-2 text-[12px] text-slate-500">{item.note}</p>
//         </article>
//       ))}
//     </section>
//   );
// }


export default function PTPhistory({ history = [] }) {
  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "partial":
        return "bg-orange-100 text-orange-600";

      case "active":
        return "bg-blue-100 text-blue-600";

      case "broken":
        return "bg-red-100 text-red-600";

      case "fulfilled":
        return "bg-green-100 text-green-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <section className="mt-4 rounded-[11px] bg-white p-4 shadow-sm">
      {history.map((item) => (
        <article key={item.invoice} className="mb-4">
          <div className="flex justify-between text-[10px]">
            <p>
              <span
                className={`rounded px-2 py-1 font-semibold ${getStatusClasses(
                  item.status
                )}`}
              >
                {item.status}
              </span>

              <b className="ml-2 text-slate-500">{item.invoice}</b>
            </p>

            <p className="text-slate-500">
              Created: {item.created}
              <span className="ml-5">Promise: {item.promise}</span>
            </p>
          </div>

          <p className="mt-4 text-[27px] font-bold text-slate-800">
            {item.amount}
          </p>

          <p className="mt-2 text-[12px] text-slate-500">{item.note}</p>
        </article>
      ))}
    </section>
  );
}
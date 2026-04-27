import { getReportData } from "./actions";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({ searchParams }: any) {
  const params = await searchParams;
  const month = parseInt(params.month || new Date().getMonth() + 1);
  const year = parseInt(params.year || new Date().getFullYear());

  const data = await getReportData(month, year);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.10),_transparent_34%),linear-gradient(180deg,#fcfbf8_0%,#f7f3eb_100%)] pb-20">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ReportsClient 
          initialData={data} 
          currentMonth={month} 
          currentYear={year} 
        />
      </main>
    </div>
  );
}
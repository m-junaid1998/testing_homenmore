"use client";

import { useState, useMemo } from "react";
import { Search, Phone, Star } from "lucide-react";
import { DataTable, type Column } from "../../components/DataTable";
import { Button } from "../../components/Button";
import { TableSkeleton } from "../../components/TableSkeleton";
import { WhatsAppIcon } from "../../utils/socialicons";
import { useGetQuery } from "../../api/apiSlice";
import { endpoints } from "../../api/config";
import { debounce } from "../../utils/helper";

const PAGE_SIZE = 10;
const getInitials = (n: string) => (n ? n.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() : "CU");

export default function AdminCustomers() {
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState("");

  const debouncedSearch = useMemo(
  () => debounce(() => setPage(1), 500),
  []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
    debouncedSearch();
  };

  const { data, isLoading, isError } = useGetQuery({
    endpoint: endpoints.customerRoutes.dashboardCustomers,
    params: { currentPage: page, pageSize: PAGE_SIZE, searchString },
  });

  const customers = (data?.data || []).map((item: any, i: number) => ({
    id: item.phone || i.toString(),
    fullName: item.fullName || "N/A",
    initials: getInitials(item.fullName),
    phone: item.phone || "N/A",
    city: item.city || "N/A",
    ordersCount: item.orders || 0,
    totalSpent: item.totalSpent || 0,
  }));

  const stats = data?.stats || { totalCustomers: 0, repeatBuyers: 0 };
  const pagination = data?.pagination || { totalPages: 1 };

  const columns: Column<typeof customers[0]>[] = [
    {
      header: "Customer",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--gold)]/15 text-[var(--gold)] font-bold text-xs flex items-center justify-center shrink-0">{r.initials}</div>
          <div>
            <span className="font-bold text-[var(--color-text-dark)] block leading-tight">{r.fullName}</span>
            {r.ordersCount > 1 && <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--gold)] mt-0.5"><Star className="w-3 h-3 fill-[var(--gold)]" /> Repeat customer</span>}
          </div>
        </div>
      ),
    },
    { header: "Phone", accessorKey: "phone", className: "text-[var(--color-muted)] font-medium" },
    { header: "City", accessorKey: "city", className: "text-[var(--color-muted)]" },
    { header: "Orders", accessorKey: "ordersCount", className: "font-semibold" },
    { header: "Total Spent", className: "whitespace-nowrap", render: (r) => <span className="font-bold text-[var(--color-text-dark)]">PKR {r.totalSpent.toLocaleString()}</span> },
    {
      header: "Contact",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button variant="ghost" size="sm" onClick={() => window.open(`tel:${r.phone}`)} className="!p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--gold)]"><Phone className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={() => window.open(`https://wa.me/${r.phone.replace(/\D/g, "")}`)} className="!p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-success)]"><WhatsAppIcon className="w-3.5 h-3.5" /></Button>
        </div>
      ),
    },
  ];

  if (isError) return <div className="p-8 text-center text-xs font-bold uppercase text-red-500">Failed to load customers data.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-sm">
        <div>
          <h1 className="text-base font-bold tracking-wider text-[var(--color-text-dark)] uppercase">Customer Directory</h1>
          <p className="text-xs font-semibold text-[var(--gold)] mt-0.5">{stats.totalCustomers} customers <span className="mx-1 text-[var(--color-muted)]">•</span> {stats.repeatBuyers} repeat buyer{stats.repeatBuyers !== 1 && "s"}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
          <input type="text" placeholder="Search customer..." value={searchString} onChange={handleSearch} className="w-full h-10 pl-10 pr-4 text-xs bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border)] text-[var(--color-text-dark)] focus:outline-none focus:border-[var(--gold)] transition-all" />
        </div>
      </div>

      {isLoading ? <TableSkeleton rows={5} columns={6} /> : <DataTable columns={columns} data={customers} keyExtractor={(i) => i.id} currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} emptyMessage="No customers found." />}
    </div>
  );
}
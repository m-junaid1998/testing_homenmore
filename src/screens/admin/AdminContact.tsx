"use client";

import { useState, useMemo } from "react";
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Search, Eye, Trash2 } from "lucide-react";
import { DataTable, type Column } from "../../components/DataTable";
import { Button } from "../../components/Button";
import { FormSelect, type SelectOption } from "../../components/FormSelect";
import { TableSkeleton } from "../../components/TableSkeleton";
import { AdminDetailModal, type ModalData, type ItemStatus } from "./AdminDetailModal";
import { Modal } from "../../components/Modal";
import { useContact } from "../../hooks/useContact";
import { usePaginationParams } from "../../hooks/Pagination/usePaginationParams";
import { debounce } from "../../utils/helper";

export interface ContactQuery {
  _id: string; 
  name: string; 
  email: string; 
  message: string;
  status: ItemStatus; 
  createdAt: string; 
  adminNotes?: string;
}

const DATES: SelectOption[] = [
  { label: "All Time", value: "ALL" }, 
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7days" }, 
  { label: "Last 30 Days", value: "30days" },
];

const STATUSES: SelectOption[] = [
  { label: "Pending", value: "Pending" }, 
  { label: "In Progress", value: "In Progress" }, 
  { label: "Resolved", value: "Resolved" },
];

const STYLES: Record<string, string> = {
  Resolved: "border-emerald-500/30 text-[var(--color-success)] bg-emerald-500/10",
  Pending: "border-amber-500/30 text-amber-500 bg-amber-500/10",
  "In Progress": "border-blue-500/30 text-blue-500 bg-blue-500/10",
};

const AdminContact = () => {
  const { params, setPage, handleSearch } = usePaginationParams({ pageSize: 5, sortOn: "createdAt", sortDirection: "desc" });
  
  const [state, setState] = useState({
    searchInput: params.searchString || "",
    filters: { status: "ALL", dateRange: "ALL" },
    modals: { selected: null as ContactQuery | null, deletingItem: null as ContactQuery | null, isDeleting: false },
  });

  const debouncedSearch = useMemo(() => debounce((val: string) => {
    handleSearch(val); 
    setPage(1);
  }, 200), [handleSearch, setPage]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setState(p => ({ ...p, searchInput: val }));
    debouncedSearch(val);
  };

  const { queries, stats, pagination, isLoadingContacts, updateQueryStatus, deleteQuery } = useContact({
    ...params, search: params.searchString, ...state.filters,
  });

  const handleDeleteConfirm = async () => {
    if (!state.modals.deletingItem) return;
    setState(p => ({ ...p, modals: { ...p.modals, isDeleting: true } }));
    const res = await deleteQuery(state.modals.deletingItem._id);
    setState(p => ({ ...p, modals: { ...p.modals, isDeleting: false, deletingItem: res?.success ? null : p.modals.deletingItem } }));
  };

  const cards = useMemo(() => [
    { label: "TOTAL MESSAGES", val: stats.totalMessages || 0, Icon: MessageSquare },
    { label: "PENDING", val: stats.pendingMessages || 0, Icon: AlertCircle },
    { label: "IN PROGRESS", val: stats.inProgressMessages || 0, Icon: Clock },
    { label: "RESOLVED", val: stats.resolvedMessages || 0, Icon: CheckCircle2 },
  ], [stats]);

  const columns: Column<ContactQuery>[] = [
    { 
      header: "Date", 
      render: (r) => (
        <span className="font-semibold text-[var(--color-text-dark)] opacity-90">
          {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ) 
    },
    { header: "Sender", accessorKey: "name", className: "font-bold text-[var(--color-text-dark)]" },
    { header: "Email", accessorKey: "email", className: "text-[var(--color-muted)]" },
    { 
      header: "Message", 
      render: (r) => (
        <span className="text-[var(--color-muted)] line-clamp-1 max-w-xs">{r.message}</span>
      ) 
    },
    { 
      header: "Status", 
      render: (r) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold border ${STYLES[r.status] || "border-[var(--color-border)] text-[var(--color-muted)] bg-[var(--color-bg-light)]"}`}>
          {r.status}
        </span>
      ) 
    },
    {
      header: "Actions", 
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setState(p => ({ ...p, modals: { ...p.modals, selected: r } }))} 
            className="!p-1.5 text-[var(--color-muted)] hover:text-[var(--gold)] hover:bg-[var(--color-bg-light)]"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setState(p => ({ ...p, modals: { ...p.modals, deletingItem: r } }))} 
            className="!p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const modalData: ModalData | null = state.modals.selected ? {
    id: state.modals.selected._id, 
    type: "QUERY", 
    title: "Query Workspace",
    subtitle: `Received on ${new Date(state.modals.selected.createdAt).toLocaleDateString("en-GB")}`,
    senderName: state.modals.selected.name, 
    senderEmail: state.modals.selected.email, 
    clientMessage: state.modals.selected.message,
    status: state.modals.selected.status, 
    statusOptions: STATUSES, 
    notes: state.modals.selected.adminNotes || "",
    onSaveAction: async (fd) => {
      const res = await updateQueryStatus(state.modals.selected!._id, { status: fd.get("status") as string, adminNotes: fd.get("adminNotes") as string });
      if (res?.success) setState(p => ({ ...p, modals: { ...p.modals, selected: null } }));
    }
  } : null;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(({ label, val, Icon }, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-light)] text-[var(--gold)] border border-[var(--color-border)] flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase">{label}</p>
            <h2 className="text-xl font-bold text-[var(--color-text-dark)]">{val}</h2>
          </div>
        ))}
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-xs">
        <div>
          <h1 className="text-base font-bold tracking-wider text-[var(--color-text-dark)] uppercase">Contact Queries</h1>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">Manage, search & filter customer messages</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={state.searchInput} 
              onChange={onSearchChange} 
              className="w-full h-10 pl-10 pr-4 text-xs bg-[var(--color-bg-light)] text-[var(--color-text-dark)] rounded-lg border border-[var(--color-border)] focus:outline-none focus:border-[var(--gold)] placeholder:text-[var(--color-muted)] transition-colors" 
            />
          </div>
          <FormSelect 
            options={DATES} 
            value={state.filters.dateRange} 
            onChange={(e) => { setState(p => ({ ...p, filters: { ...p.filters, dateRange: e.target.value } })); setPage(1); }} 
            containerClassName="!w-36" 
            className="!py-2 text-xs !rounded-lg !bg-[var(--color-bg-light)] !border-[var(--color-border)] text-[var(--color-text-dark)]" 
          />
          <FormSelect 
            options={[{ label: "All Status", value: "ALL" }, ...STATUSES]} 
            value={state.filters.status} 
            onChange={(e) => { setState(p => ({ ...p, filters: { ...p.filters, status: e.target.value } })); setPage(1); }} 
            containerClassName="!w-36" 
            className="!py-2 text-xs !rounded-lg !bg-[var(--color-bg-light)] !border-[var(--color-border)] text-[var(--color-text-dark)]" 
          />
        </div>
      </div>

      {/* Data Table / Loading */}
      {isLoadingContacts ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <DataTable 
          columns={columns} 
          data={queries} 
          keyExtractor={(i) => i._id} 
          currentPage={pagination?.currentPage || params.currentPage || 1} 
          totalPages={pagination?.totalPages || 1} 
          onPageChange={setPage} 
          emptyMessage="No matching queries found." 
        />
      )}

      {/* Modal Actions */}
      <AdminDetailModal 
        isOpen={!!state.modals.selected} 
        onClose={() => setState(p => ({ ...p, modals: { ...p.modals, selected: null } }))} 
        data={modalData} 
      />

      <Modal 
        isOpen={!!state.modals.deletingItem} 
        onClose={() => setState(p => ({ ...p, modals: { ...p.modals, deletingItem: null } }))} 
        onConfirm={handleDeleteConfirm} 
        title="Delete Query" 
        variant="danger" 
        confirmText="Delete" 
        cancelText="Cancel" 
        isLoading={state.modals.isDeleting} 
        description={state.modals.deletingItem ? <span className="text-[var(--color-muted)]">Are you sure you want to delete the query from <strong className="text-[var(--color-text-dark)]">{state.modals.deletingItem.name}</strong>?</span> : null} 
      />
    </div>
  );
};

export default AdminContact;
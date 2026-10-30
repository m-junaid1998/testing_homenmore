"use client";
import { useState, useMemo } from "react";
import {
  ShoppingBag,
  Clock,
  CheckSquare,
  Activity,
  Truck,
  Package,
  XCircle,
  DollarSign,
  Search,
  Eye,
  Download,
} from "lucide-react";
import { DataTable, type Column } from "../../components/DataTable";
import { Button } from "../../components/Button";
import { FormSelect, type SelectOption } from "../../components/FormSelect";
import { TableSkeleton } from "../../components/TableSkeleton";
import {
  AdminDetailModal,
  type ModalData,
  type ItemStatus,
} from "./AdminDetailModal";
import { useOrder } from "../../hooks/useOrder";
import { usePaginationParams } from "../../hooks/Pagination/usePaginationParams";
import { debounce } from "../../utils/helper";
import { InvoiceTemplate } from "../InvoiceTemplate";
import { renderToString } from "react-dom/server";

export interface OrderItem {
  _id: string;
  orderNumber: string;
  customerInfo?: {
    fullName?: string;
    phone?: string;
    city?: string;
    areaTown?: string;
    address?: string;
    orderNotes?: string;
  };
  orderItems?: {
    name: string;
    qty: number;
    price: number;
    image: string;
    product?: string;
  }[];
  totalPrice?: number;
  itemsPrice?: number;
  shippingPrice?: number;
  status: ItemStatus | number | string;
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
  { label: "Confirmed", value: "Confirmed" },
  { label: "Processing", value: "Processing" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

const STATUS_MAP: Record<string | number, string> = {
  1: "Pending",
  2: "Confirmed",
  3: "Processing",
  4: "Shipped",
  5: "Delivered",
  6: "Cancelled",
  Pending: "Pending",
  Confirmed: "Confirmed",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

const STYLES: Record<string, string> = {
  Pending: "bg-amber-950/60 text-amber-300 border-amber-700/50",
  Confirmed: "bg-blue-950/60 text-blue-300 border-blue-700/50",
  Processing: "bg-purple-950/60 text-purple-300 border-purple-700/50",
  Shipped: "bg-indigo-950/60 text-indigo-300 border-indigo-700/50",
  Delivered: "bg-emerald-950/60 text-emerald-300 border-emerald-700/50",
  Cancelled: "bg-rose-950/60 text-rose-300 border-rose-700/50",
};

const AdminOrders = () => {
  const { params, setPage, handleSearch } = usePaginationParams({
    pageSize: 5,
    sortOn: "createdAt",
    sortDirection: "desc",
  });

  const [state, setState] = useState({
    searchInput: params.searchString || "",
    filters: { status: "ALL", dateRange: "ALL" },
    modals: {
      selected: null as OrderItem | null,
    },
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        handleSearch(val);
        setPage(1);
      }, 200),
    [handleSearch, setPage],
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((p) => ({ ...p, searchInput: e.target.value }));
    debouncedSearch(e.target.value);
  };

  const {
    dashboardOrders,
    dashboardStats,
    dashboardPagination,
    isLoadingDashboardOrders,
    updateOrderStatus,
  } = useOrder({
    ...params,
    search: params.searchString,
    ...state.filters,
  });

  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  const handleDownload = (order: OrderItem) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = renderToString(<InvoiceTemplate order={order} />);
    // Reuse this site's own stylesheets: no script or style is loaded from another website.
    const stylesheets = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .map((link) => `<link rel="stylesheet" href="${(link as HTMLLinkElement).href}">`)
      .join("");

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${escapeHtml(order.orderNumber)}</title>
        ${stylesheets}
        <style>
          @page { size: A4; margin: 10mm; }
          body { 
            font-family: sans-serif; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const cards = useMemo(
    () => [
      {
        label: "TOTAL ORDERS",
        val: dashboardStats?.totalOrders || 0,
        Icon: ShoppingBag,
      },
      {
        label: "PENDING",
        val: dashboardStats?.pendingOrders || 0,
        Icon: Clock,
      },
      {
        label: "CONFIRMED",
        val: dashboardStats?.confirmedOrders || 0,
        Icon: CheckSquare,
      },
      {
        label: "PROCESSING",
        val: dashboardStats?.processingOrders || 0,
        Icon: Activity,
      },
      {
        label: "SHIPPED",
        val: dashboardStats?.shippedOrders || 0,
        Icon: Truck,
      },
      {
        label: "DELIVERED",
        val: dashboardStats?.deliveredOrders || 0,
        Icon: Package,
      },
      {
        label: "CANCELLED",
        val: dashboardStats?.cancelledOrders || 0,
        Icon: XCircle,
      },
      {
        label: "REVENUE",
        val: `PKR ${(dashboardStats?.totalRevenue || 0).toLocaleString()}`,
        Icon: DollarSign,
      },
    ],
    [dashboardStats],
  );

  const columns: Column<OrderItem>[] = [
    {
      header: "Order #",
      render: (r) => (
        <span className="font-semibold text-[var(--gold)]">
          {r.orderNumber}
        </span>
      ),
    },
    {
      header: "Customer",
      render: (r) => (
        <span className="font-bold text-[var(--color-text-dark)]">
          {r.customerInfo?.fullName || "N/A"}
        </span>
      ),
    },
    {
      header: "Phone",
      render: (r) => (
        <span className="text-[var(--color-muted)]">
          {r.customerInfo?.phone || "N/A"}
        </span>
      ),
    },
    {
      header: "Items",
      render: (r) => <span>{r.orderItems?.length || 0}</span>,
    },
    {
      header: "Total Spend",
      className: "whitespace-nowrap",
      render: (r) => (
        <span className="font-bold">
          PKR {(r.totalPrice || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      render: (r) => {
        const statusStr = STATUS_MAP[r.status] || String(r.status);
        return (
          <span
            className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold border tracking-wide uppercase shadow-xs ${
              STYLES[statusStr] || "bg-zinc-800 text-zinc-300 border-zinc-700"
            }`}
          >
            {statusStr}
          </span>
        );
      },
    },
    {
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setState((p) => ({ ...p, modals: { ...p.modals, selected: r } }))
            }
            className="!p-1.5 text-[var(--color-muted)] hover:text-[var(--gold)]"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(r)}
            className="!p-1.5 text-[var(--gold)] hover:bg-emerald-950/40"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const modalData: ModalData | null = (() => {
    const order = state.modals.selected;
    if (!order) return null;

    const shippingPrice = order.shippingPrice ?? 0;
    const subtotal =
      order.itemsPrice ?? (order.totalPrice ?? 0) - shippingPrice;

    return {
      id: order._id,
      type: "ORDER",
      title: `Order ${order.orderNumber}`,
      subtitle: `Placed ${new Date(order.createdAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      status: (STATUS_MAP[order.status] || order.status) as ItemStatus,
      statusOptions: STATUSES,
      customerName: order.customerInfo?.fullName || "N/A",
      phone: order.customerInfo?.phone || "N/A",
      address: [
        order.customerInfo?.address,
        order.customerInfo?.areaTown,
        order.customerInfo?.city,
      ]
        .filter(Boolean)
        .join(", "),
      items: (order.orderItems || []).map((item, idx) => ({
        id: item.product || `${order._id}-${idx}`,
        title: item.name,
        qty: item.qty,
        unitPrice: item.price,
        image: item.image,
      })),
      subtotal,
      shippingFee: shippingPrice === 0 ? "FREE" : shippingPrice,
      grandTotal: order.totalPrice || 0,
      onStatusChange: async (id, newStatus) => {
        const res = await updateOrderStatus(id, newStatus);
        if (res?.success) {
          setState((p) => ({ ...p, modals: { ...p.modals, selected: null } }));
        }
      },
    };
  })();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {cards.map(({ label, val, Icon }, i) => (
          <div
            key={i}
            className="p-3 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-sm space-y-2"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--color-muted)] uppercase">
              {label}
            </p>
            <h2 className="text-xl font-bold text-[var(--color-text-dark)]">
              {val}
            </h2>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] shadow-sm">
        <div>
          <h1 className="text-base font-bold tracking-wider text-[var(--color-text-dark)] uppercase">
            Order Management
          </h1>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Real-time order monitoring, status updates & filtering
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={state.searchInput}
              onChange={onSearchChange}
              className="w-full h-10 pl-10 pr-4 text-xs bg-[var(--color-card-bg)] text-[var(--color-text-dark)] rounded-lg border border-[var(--color-border)] focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
          <FormSelect
            options={DATES}
            value={state.filters.dateRange}
            onChange={(e) => {
              setState((p) => ({
                ...p,
                filters: { ...p.filters, dateRange: e.target.value },
              }));
              setPage(1);
            }}
            containerClassName="!w-36"
            className="!py-2 text-xs !rounded-lg"
          />
          <FormSelect
            options={[{ label: "All Status", value: "ALL" }, ...STATUSES]}
            value={state.filters.status}
            onChange={(e) => {
              setState((p) => ({
                ...p,
                filters: { ...p.filters, status: e.target.value },
              }));
              setPage(1);
            }}
            containerClassName="!w-36"
            className="!py-2 text-xs !rounded-lg"
          />
        </div>
      </div>

      {isLoadingDashboardOrders ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <DataTable
          columns={columns}
          data={dashboardOrders}
          keyExtractor={(i) => i._id}
          currentPage={
            dashboardPagination?.currentPage || params.currentPage || 1
          }
          totalPages={dashboardPagination?.totalPages || 1}
          onPageChange={setPage}
          emptyMessage="No matching orders found."
        />
      )}

      <AdminDetailModal
        isOpen={!!state.modals.selected}
        onClose={() =>
          setState((p) => ({ ...p, modals: { ...p.modals, selected: null } }))
        }
        data={modalData}
      />
    </div>
  );
};

export default AdminOrders;
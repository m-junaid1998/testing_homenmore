import React from "react";

interface InvoiceTemplateProps {
  order: any;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  order,
}) => {
  const customer = order?.customerInfo || {};
  const items = order?.orderItems || [];

  const shipping = Number(order?.shippingPrice) || 0;
  const total = Number(order?.totalPrice) || 0;
  const subtotal =
    Number(order?.itemsPrice) || total - shipping;

  const date = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const address = [
    customer.address,
    customer.areaTown,
    customer.city,
    customer.postalCode,
    customer.country,
  ]
    .filter(Boolean)
    .join(", ");

  const money = (value: number) =>
    `PKR ${value.toLocaleString("en-PK")}`;

  const styles: Record<string, React.CSSProperties> = {
    page: {
      maxWidth: 800,
      margin: "0 auto",
      padding: 36,
      boxSizing: "border-box",
      background: "#fff",
      color: "#262626",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      paddingBottom: 3,
      borderBottom: "2px solid #171717",
    },
    brand: {
      margin: 0,
      color: "#171717",
      fontSize: 29,
      fontWeight: 900,
      letterSpacing: 2,
    },
    tagline: {
      margin: "7px 0 0",
      color: "#a17c45",
      fontSize: 14,
      letterSpacing: 1.1,
      fontWeight: 600,
    },
    label: {
      margin: 0,
      color: "#999",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 2,
    },
    invoiceNumber: {
      margin: "6px 0",
      fontSize: 22,
      fontWeight: 900,
      color: "#171717",
    },
    muted: {
      color: "#777",
      fontSize: 11,
    },
    details: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 28,
      margin: "28px 0",
      fontSize: 12,
      lineHeight: 1.8,
    },
    sectionTitle: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      margin: "0 0 12px",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: 1,
      color: "#171717",
    },
    accent: {
      width: 4,
      height: 14,
      background: "#a17c45",
      display: "inline-block",
      flexShrink: 0,
    },
    detailLine: {
      margin: "5px 0",
      overflowWrap: "anywhere",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 11,
      textAlign: "left",
    },
    th: {
      padding: "11px 7px",
      background: "#f7f4ef",
      borderTop: "1px solid #171717",
      borderBottom: "1px solid #171717",
      fontSize: 9,
      letterSpacing: 0.4,
      color: "#555",
    },
    td: {
      padding: "12px 7px",
      borderBottom: "1px solid #eaeaea",
      verticalAlign: "middle",
    },
    productImage: {
      width: 42,
      height: 42,
      objectFit: "cover",
      border: "1px solid #eee",
      borderRadius: 4,
      display: "block",
    },
    totals: {
      width: 270,
      maxWidth: "100%",
      margin: "26px 0 0 auto",
      padding: 16,
      border: "1px solid #171717",
      boxSizing: "border-box",
      fontSize: 12,
    },
    totalRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    grandTotal: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      paddingTop: 12,
      borderTop: "1px dashed #bbb",
      color: "#171717",
      fontWeight: 900,
    },
    footer: {
      marginTop: 48,
      paddingTop: 22,
      borderTop: "1px solid #eee",
      textAlign: "center",
    },
  };

  const sectionTitle = (title: string) => (
    <h3 style={styles.sectionTitle}>
      <span style={styles.accent} />
      {title}
    </h3>
  );

  return (
    <div
      id={`invoice-${order?._id || order?.orderNumber || "order"}`}
      style={styles.page}
    >
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.brand}>BAMBOTIA</h1>
          <p style={styles.tagline}>
            Timeless Jewellery • Elegant Designs • Everyday Luxury
          </p>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={styles.label}>INVOICE</p>
          <h2 style={styles.invoiceNumber}>
            #{order?.orderNumber || "N/A"}
          </h2>
          <p style={{ ...styles.muted, margin: 0 }}>{date}</p>
        </div>
      </header>

      {/* CUSTOMER AND ORDER DETAILS */}
      <div style={styles.details}>
        <section>
          {sectionTitle("CUSTOMER DETAILS")}

          <p style={styles.detailLine}>
            <strong>Name:</strong> {customer.fullName || "N/A"}
          </p>
          <p style={styles.detailLine}>
            <strong>Phone:</strong> {customer.phone || "N/A"}
          </p>
          <p style={styles.detailLine}>
            <strong>Address:</strong> {address || "N/A"}
          </p>

          {customer.orderNotes && (
            <p style={styles.detailLine}>
              <strong>Notes:</strong> {customer.orderNotes}
            </p>
          )}
        </section>

        <section>
          {sectionTitle("ORDER DETAILS")}

          <p style={styles.detailLine}>
            <strong>Payment:</strong> {order?.paymentMethod || "N/A"}
          </p>
          <p style={styles.detailLine}>
            <strong>Status:</strong>{" "}
            <span style={{ fontWeight: 800, textTransform: "uppercase" }}>
              {order?.status || "N/A"}
            </span>
          </p>
        </section>
      </div>

      {/* PRODUCTS TABLE */}
      <table style={styles.table}>
        <thead>
          <tr>
            {["P:ID", "IMAGE", "PRODUCT NAME", "COLOR", "SIZE", "QTY"].map(
              (heading) => (
                <th
                  key={heading}
                  style={{
                    ...styles.th,
                    textAlign:
                      ["COLOR", "SIZE", "QTY"].includes(heading)
                        ? "center"
                        : "left",
                  }}
                >
                  {heading}
                </th>
              )
            )}
            <th style={{ ...styles.th, textAlign: "right" }}>PRICE</th>
            <th style={{ ...styles.th, textAlign: "right" }}>TOTAL</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item: any, index: number) => {
            const qty = Number(item?.qty) || 0;
            const price = Number(item?.price) || 0;
            const productId = item?.product
              ? `#${String(item.product).slice(-6).toUpperCase()}`
              : `#ITEM-${index + 1}`;

            return (
              <tr key={item?._id || `${productId}-${index}`}>
                <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                  {productId}
                </td>

                <td style={styles.td}>
                  <img
                    src={item?.image || "/placeholder.jpg"}
                    alt={item?.name || "Product"}
                    style={styles.productImage}
                  />
                </td>

                <td style={{ ...styles.td, fontWeight: 700 }}>
                  {item?.name || "N/A"}
                </td>

                <td style={{ ...styles.td, textAlign: "center" }}>
                  {item?.color || "-"}
                </td>

                <td
                  style={{
                    ...styles.td,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item?.size || "-"}
                </td>

                <td
                  style={{
                    ...styles.td,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  {qty}
                </td>

                <td
                  style={{
                    ...styles.td,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {money(price)}
                </td>

                <td
                  style={{
                    ...styles.td,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    fontWeight: 800,
                  }}
                >
                  {money(qty * price)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ borderBottom: "2px solid #171717" }} />

      {/* TOTALS */}
      <div style={styles.totals}>
        <div style={{ ...styles.totalRow, color: "#777" }}>
          <strong>SUBTOTAL</strong>
          <strong style={{ color: "#171717" }}>{money(subtotal)}</strong>
        </div>

        <div style={{ ...styles.totalRow, color: "#777" }}>
          <strong>SHIPPING</strong>
          <strong style={{ color: shipping === 0 ? "#059669" : "#171717" }}>
            {shipping === 0 ? "FREE" : money(shipping)}
          </strong>
        </div>

        <div style={styles.grandTotal}>
          <span>GRAND TOTAL</span>
          <span style={{ fontSize: 16, whiteSpace: "nowrap" }}>
            {money(total)}
          </span>
        </div>
      </div>

      <footer style={styles.footer}>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1.2,
            color: "#171717",
          }}
        >
          THANK YOU FOR CHOOSING BAMBOTIA
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 9,
            color: "#aaa",
          }}
        >
          This is a computer-generated invoice and does not require a
          physical signature or stamp.
        </p>
      </footer>
    </div>
  );
};
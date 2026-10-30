import nodemailer from "nodemailer";
import { formatPKR } from "../../utils/helper";

// New-order e-mail for the shop owner. Set ORDER_NOTIFY_EMAIL to receive it (defaults to EMAIL_USER).
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendOrderNotificationEmail = async (order: any) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try {
    const { orderNumber, customerInfo: c, orderItems, itemsPrice, shippingPrice, discountPrice, totalPrice, paymentMethod } = order;
    const items = orderItems
      .map((i: any, n: number) => `${n + 1}. ${i.name} | Qty: ${i.qty} | Size: ${i.size || "N/A"} | Color: ${i.color || "N/A"} | ${formatPKR(i.price)}`)
      .join("\n");

    await transporter.sendMail({
      from: `"Bambotia" <${process.env.EMAIL_USER}>`,
      to: process.env.ORDER_NOTIFY_EMAIL || process.env.EMAIL_USER,
      subject: `New order #${orderNumber}`,
      text: [
        `Order Number: #${orderNumber}`,
        "",
        `Customer: ${c.fullName}`,
        `Phone: ${c.phone}`,
        `City: ${c.city}, ${c.country}`,
        `Area/Town: ${c.areaTown}`,
        `Address: ${c.address}`,
        `Notes: ${c.orderNotes || "None"}`,
        "",
        items,
        "",
        `Payment: ${paymentMethod}`,
        `Items: ${formatPKR(itemsPrice)}`,
        `Shipping: ${formatPKR(shippingPrice)}`,
        `Discount: ${formatPKR(discountPrice)}`,
        `TOTAL: ${formatPKR(totalPrice)}`,
      ].join("\n"),
    });
  } catch (error: any) {
    console.error("Order notification email error:", error.message);
  }
};

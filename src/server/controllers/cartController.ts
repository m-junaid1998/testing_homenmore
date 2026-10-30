import Cart from "../models/Cart";
import Product from "../models/Product";
import asyncHandler from "../utils/asyncHandler";
import { getIdentityFilter, getIdentityPayload } from "../utils/identityHelper";
import { findSize, hasSizes, resolveUnitPricing } from "../utils/sizes";
import { isObjectId } from "../utils/safe";
import { fail, ok } from "../utils/respond";
import { deliveryFor } from "../../utils/shipping";
import { loadShippingRules } from "../utils/shippingRules";

const POPULATE = "name salePrice regularPrice sizes colors images stock";

const same = (a: unknown, b: unknown) => String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
const findColor = (product: any, label: unknown) => product.colors?.find((c: string) => same(c, label)) ?? null;

/** Cart lines with the unit price of the chosen size, plus the delivery summary. Prices and delivery come from the server. */
const serialize = async (cart: any) => {
  const rules = await loadShippingRules();
  const items = (cart.toObject?.() ?? cart).cartItems
    .filter((item: any) => item.product)
    .map((item: any) => {
      const size = hasSizes(item.product) ? findSize(item.product, item.size) : null;
      return {
        ...item,
        price: size?.salePrice ?? item.product.salePrice,
        regularPrice: size?.regularPrice ?? item.product.regularPrice,
        sizeUnavailable: hasSizes(item.product) && !size, // size removed by the admin after it was added
        colorUnavailable: !!item.product.colors?.length && !findColor(item.product, item.color),
      };
    });

  const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
  const shippingPrice = deliveryFor(subtotal, rules);
  return {
    ...(cart.toObject?.() ?? cart),
    cartItems: items,
    summary: {
      subtotal,
      shippingPrice,
      deliveryCharge: rules.deliveryCharge,
      freeShippingAbove: rules.freeShippingAbove,
      amountForFreeShipping: Math.max(0, rules.freeShippingAbove - subtotal),
      total: subtotal + shippingPrice,
    },
  };
};

const respondWithCart = async (res: any, cart: any, message?: string) => {
  await cart.populate("cartItems.product", POPULATE);
  return ok(res, await serialize(cart), message);
};

// qty is added to the line, or replaces it when isDirectUpdate is true; 0 or less removes the line.
export const addToCart = asyncHandler(async (req, res) => {
  const { product: productId, qty, isDirectUpdate } = req.body;
  const amount = parseInt(qty, 10);
  if (!isObjectId(productId)) return fail(res, 400, "Product ID is required");
  if (isNaN(amount) || Math.abs(amount) > 100) return fail(res, 400, "Invalid quantity payload provided");

  const product: any = await Product.findById(productId).select("name stock isPublished sizes colors salePrice regularPrice").lean();
  if (!product) return fail(res, 404, "Requested product does not exist");
  if (product.isPublished === false) return fail(res, 400, "This product is currently unavailable");

  // sized / coloured products need a valid choice; others ignore whatever was sent
  const pricing = resolveUnitPricing(product, String(req.body.size ?? "").trim());
  if (!pricing.ok) return fail(res, 400, pricing.message);
  const color = product.colors?.length ? findColor(product, req.body.color) : "";
  if (color === null) return fail(res, 400, req.body.color ? `The selected color is not available for "${product.name}".` : `Please select a color for "${product.name}".`);

  const cart = (await Cart.findOne(getIdentityFilter(req))) ?? new Cart({ ...getIdentityPayload(req), cartItems: [] });
  const isProduct = (item: any) => String(item.product) === String(productId);
  const index = cart.cartItems.findIndex((item: any) => isProduct(item) && same(item.size, pricing.size) && same(item.color, color));

  // stock is shared by every size and colour of a product
  const inOtherLines = cart.cartItems.reduce((sum: number, item: any, i: number) => (isProduct(item) && i !== index ? sum + item.qty : sum), 0);
  const stockLeft = Math.max(0, (product.stock ?? 0) - inOtherLines);
  const target = index > -1 && !isDirectUpdate ? cart.cartItems[index].qty + amount : amount;

  if (target > stockLeft) return fail(res, 400, `Cannot ${index > -1 ? "update quantity" : "add item"}! Only ${product.stock ?? 0} units available in stock.`);
  if (index > -1 && target <= 0) cart.cartItems.splice(index, 1);
  else if (index > -1) cart.cartItems[index].qty = target;
  else if (target > 0) cart.cartItems.push({ product: productId, qty: target, size: pricing.size, color });

  await cart.save();
  return respondWithCart(res, cart);
});

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne(getIdentityFilter(req)).populate("cartItems.product", POPULATE);
  if (!cart) return ok(res, { cartItems: [] });

  const live = cart.cartItems.filter((item: any) => item.product !== null); // products deleted by the admin
  if (live.length !== cart.cartItems.length) {
    cart.cartItems = live;
    await cart.save();
  }
  return ok(res, await serialize(cart));
});

// ?size= and/or ?color= remove only that line; without them every line of the product is removed.
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size, color } = req.query;
  if (!isObjectId(productId)) return fail(res, 400, "Target product tracking parameter missing");

  const cart = await Cart.findOne(getIdentityFilter(req));
  if (!cart) return fail(res, 404, "Active transaction cart reference target not found");

  cart.cartItems = cart.cartItems.filter((item: any) => {
    const matches = String(item.product) === productId && (size === undefined || same(item.size, size)) && (color === undefined || same(item.color, color));
    return !matches;
  });
  await cart.save();
  return respondWithCart(res, cart, "Requested target item removed securely from transaction loop");
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.updateOne(getIdentityFilter(req), { $set: { cartItems: [] } });
  return ok(res, { cartItems: [] });
});

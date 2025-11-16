type OrderItem = {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
};

type PlaceOrderArgs = {
  restaurantId: string;
  items: OrderItem[];
  orderType: "delivery" | "pickup";
  deliveryAddress?: string;
  customerName: string;
  customerPhone: string;
};

type PlaceOrderResult = {
  orderId: string;
  status: "confirmed";
  restaurantId: string;
  items: OrderItem[];
  orderType: "delivery" | "pickup";
  deliveryAddress?: string;
  customer: {
    name: string;
    phone: string;
  };
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  estimatedReadyTime: string;
  estimatedDeliveryTime?: string;
};

const formatReadyTime = (orderType: "delivery" | "pickup") =>
  orderType === "pickup" ? "20-25 min" : "30-35 min";

const DELIVERY_FEE = 2.99;
const TAX_RATE = 0.0875;

export const placeOrder = async (
  args: PlaceOrderArgs,
): Promise<PlaceOrderResult> => {
  const subtotal = args.items.reduce<number>(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * TAX_RATE;
  const deliveryFee = args.orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + tax + deliveryFee;

  return {
    orderId: `ord_${Date.now()}`,
    status: "confirmed",
    restaurantId: args.restaurantId,
    items: args.items,
    orderType: args.orderType,
    deliveryAddress: args.deliveryAddress,
    customer: {
      name: args.customerName,
      phone: args.customerPhone,
    },
    subtotal,
    tax,
    deliveryFee,
    total,
    estimatedReadyTime: formatReadyTime(args.orderType),
    estimatedDeliveryTime:
      args.orderType === "delivery" ? "35-45 min" : undefined,
  };
};

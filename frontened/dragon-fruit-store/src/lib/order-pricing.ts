import { useSyncExternalStore } from "react";

export interface OrderLineItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  imageUrl: string;
  quantity: number;
}

export interface DeliveryChargeRule {
  upto: number;
  charge: number;
  label: string;
}

const STORAGE_KEY = "kn_delivery_charge_rules";
const UPDATE_EVENT = "kn-delivery-charge-updated";

export const DEFAULT_DELIVERY_CHARGE_RULES: DeliveryChargeRule[] = [
  { upto: 1, charge: 90, label: "1 plant" },
  { upto: 2, charge: 90, label: "2 plants" },
  { upto: 3, charge: 90, label: "3 plants" },
  { upto: 4, charge: 180, label: "4 plants" },
  { upto: 5, charge: 180, label: "5 plants" },
  { upto: 6, charge: 180, label: "6 plants" },
  { upto: 7, charge: 180, label: "7 plants" },
  { upto: 9, charge: 250, label: "9 plants" },
  { upto: 10, charge: 300, label: "10 plants" },
  { upto: 12, charge: 350, label: "12 plants" },
  { upto: 15, charge: 380, label: "15 plants" },
  { upto: 20, charge: 450, label: "20 plants" },
  { upto: 50, charge: 1350, label: "50 plants" },
  { upto: 100, charge: 2500, label: "100 plants or more" },
];

let cachedRulesSnapshot: DeliveryChargeRule[] = DEFAULT_DELIVERY_CHARGE_RULES;
let cachedRulesKey = JSON.stringify(DEFAULT_DELIVERY_CHARGE_RULES);

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeRules(rules: DeliveryChargeRule[]) {
  return [...rules].sort((a, b) => a.upto - b.upto);
}

function getStableRulesSnapshot(rules: DeliveryChargeRule[]) {
  const normalized = normalizeRules(rules);
  const nextKey = JSON.stringify(normalized);

  if (nextKey === cachedRulesKey) {
    return cachedRulesSnapshot;
  }

  cachedRulesKey = nextKey;
  cachedRulesSnapshot = normalized;
  return cachedRulesSnapshot;
}

export function getDeliveryChargeRules() {
  if (!isBrowser()) return getStableRulesSnapshot(DEFAULT_DELIVERY_CHARGE_RULES);

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return getStableRulesSnapshot(DEFAULT_DELIVERY_CHARGE_RULES);

  try {
    const parsed = JSON.parse(raw) as DeliveryChargeRule[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getStableRulesSnapshot(DEFAULT_DELIVERY_CHARGE_RULES);
    }

    const valid = parsed.filter(
      (rule) =>
        typeof rule?.upto === "number" &&
        typeof rule?.charge === "number" &&
        typeof rule?.label === "string",
    );

    return valid.length
      ? getStableRulesSnapshot(valid)
      : getStableRulesSnapshot(DEFAULT_DELIVERY_CHARGE_RULES);
  } catch {
    return getStableRulesSnapshot(DEFAULT_DELIVERY_CHARGE_RULES);
  }
}

export function saveDeliveryChargeRules(rules: DeliveryChargeRule[]) {
  if (!isBrowser()) return;
  const normalized = normalizeRules(rules);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function resetDeliveryChargeRules() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

function subscribe(callback: () => void) {
  if (!isBrowser()) return () => undefined;

  const handleUpdate = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };

  window.addEventListener(UPDATE_EVENT, handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(UPDATE_EVENT, handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useDeliveryChargeRules() {
  return useSyncExternalStore(subscribe, getDeliveryChargeRules, () => DEFAULT_DELIVERY_CHARGE_RULES);
}

export function getTotalPlantQuantity(items: OrderLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getDeliveryCharge(totalPlants: number, rules = getDeliveryChargeRules()) {
  if (totalPlants <= 0) return 0;

  const normalized = normalizeRules(rules);
  const matchingRule = normalized.find((rule) => totalPlants <= rule.upto);
  return matchingRule?.charge ?? normalized[normalized.length - 1]?.charge ?? 0;
}

export function getOrderSubtotal(items: OrderLineItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toFixed(2)}`;
}

export interface OrderCustomerDetails {
  name: string;
  pinCode: string;
  phone: string;
  doorNo: string;
  address: string;
  landmark: string;
  state: string;
  alternatePhone: string;
}

export function createOrderMessage(items: OrderLineItem[], customer: OrderCustomerDetails) {
  const totalPlants = getTotalPlantQuantity(items);
  const subtotal = getOrderSubtotal(items);
  const deliveryCharge = getDeliveryCharge(totalPlants);
  const total = subtotal + deliveryCharge;

  const productLines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name}\n   Quantity: ${item.quantity}\n   Price: ${formatCurrency(item.price)} each\n   Line Total: ${formatCurrency(item.price * item.quantity)}`,
  );

  return [
    "New Plant Order",
    "",
    "Customer Details:",
    `Name: ${customer.name}`,
    `Pincode: ${customer.pinCode}`,
    `Phone Number: ${customer.phone}`,
    `Door No: ${customer.doorNo}`,
    `Address: ${customer.address}`,
    `Landmark: ${customer.landmark}`,
    `State: ${customer.state}`,
    `Alternative Phone Number: ${customer.alternatePhone || "N/A"}`,
    "",
    "Order Details:",
    ...productLines,
    "",
    `Total Plants: ${totalPlants}`,
    `Delivery Charge: ${formatCurrency(deliveryCharge)}`,
    `Order Total: ${formatCurrency(total)}`,
  ].join("\n");
}

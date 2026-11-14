export type StationStatus = "available" | "in-use" | "reserved" | "maintenance";
export type Zone = "Main Hall" | "VIP Room" | "Console Zone";

export interface Telemetry {
  cpu: number;
  gpu: number;
  ping: number;
  fps: number;
  ram: number;
  disk: number;
  uptime: string;
}

export interface Station {
  id: string;
  name: string;
  zone: Zone;
  status: StationStatus;
  member?: string;
  endsAt?: number;
  startsAt?: number;
  spec: string;
  telemetry: Telemetry;
}

export interface Member {
  id: string;
  name: string;
  handle: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  balance: number;
  hours: number;
  visits: number;
  lastVisit: string;
  status: "active" | "idle" | "banned";
}

export type ProductCategory =
  | "Gaming"
  | "Hot Drinks"
  | "Cold Drinks"
  | "Snacks"
  | "Meals";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  sku: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: "Cafe" | "Hardware" | "Supplies" | "Merch";
  stock: number;
  reorder: number;
  unitCost: number;
  supplier: string;
}

export interface HardwareAlert {
  id: string;
  station: string;
  kind: "Storage" | "Network" | "Crash" | "Thermal" | "Power";
  severity: "critical" | "warning" | "info";
  message: string;
  at: string;
}

export const ZONES: Zone[] = ["Main Hall", "VIP Room", "Console Zone"];

const now = Date.now();
const min = (m: number) => now + m * 60_000;

const memberNames = [
  "Aria Chen",
  "Marcus Vale",
  "Yuki Tanaka",
  "Dev Patel",
  "Lina Haddad",
  "Owen Brooks",
  "Sofia Reyes",
  "Noah Kim",
  "Zara Ali",
  "Eli Novak",
];

export const members: Member[] = [
  { id: "MB-2041", name: "Aria Chen", handle: "aria.exe", tier: "Platinum", balance: 84.5, hours: 312, visits: 148, lastVisit: "2h ago", status: "active" },
  { id: "MB-1988", name: "Marcus Vale", handle: "vale.gg", tier: "Gold", balance: 22, hours: 186, visits: 92, lastVisit: "Today", status: "active" },
  { id: "MB-2113", name: "Yuki Tanaka", handle: "yuki_", tier: "Platinum", balance: 140.25, hours: 401, visits: 203, lastVisit: "34m ago", status: "active" },
  { id: "MB-2240", name: "Dev Patel", handle: "devp", tier: "Silver", balance: 6.5, hours: 74, visits: 41, lastVisit: "Yesterday", status: "active" },
  { id: "MB-1902", name: "Lina Haddad", handle: "lina.h", tier: "Gold", balance: 47.25, hours: 233, visits: 119, lastVisit: "Today", status: "active" },
  { id: "MB-2301", name: "Owen Brooks", handle: "brooksy", tier: "Bronze", balance: 0, hours: 12, visits: 7, lastVisit: "6d ago", status: "idle" },
  { id: "MB-1876", name: "Sofia Reyes", handle: "sofia.r", tier: "Gold", balance: 61, hours: 267, visits: 131, lastVisit: "1h ago", status: "active" },
  { id: "MB-2199", name: "Noah Kim", handle: "nkim", tier: "Silver", balance: 12.75, hours: 96, visits: 55, lastVisit: "Today", status: "active" },
  { id: "MB-1744", name: "Zara Ali", handle: "zara", tier: "Platinum", balance: 205, hours: 488, visits: 246, lastVisit: "12m ago", status: "active" },
  { id: "MB-2390", name: "Eli Novak", handle: "novak", tier: "Bronze", balance: 3.2, hours: 8, visits: 4, lastVisit: "2d ago", status: "banned" },
];

function station(
  id: string,
  zone: Zone,
  status: StationStatus,
  opts: Partial<Station> = {},
): Station {
  const num = Number.parseInt(id.slice(-2), 10) || 1;
  const zoneOffset = zone === "Main Hall" ? 3 : zone === "VIP Room" ? 11 : 19;
  const seed = (num * 7 + zoneOffset) % 29;
  const telemetry: Telemetry = {
    cpu: 36 + (seed % 28),
    gpu: 44 + ((seed * 5) % 37),
    ping: 6 + (seed % 13),
    fps: 138 + ((seed * 11) % 104),
    ram: 38 + ((seed * 3) % 48),
    disk: 36 + ((seed * 9) % 54),
    uptime: `${3 + (seed % 9)}d ${(seed * 3) % 24}h`,
  };
  return {
    id,
    name: id,
    zone,
    status,
    spec: zone === "Console Zone" ? "PS5 Pro · 4K 120" : zone === "VIP Room" ? "RTX 4090 · 7800X3D" : "RTX 4070 · 13600K",
    telemetry,
    ...opts,
  };
}

export const stations: Station[] = [
  station("MH-01", "Main Hall", "in-use", { member: "Aria Chen", endsAt: min(48), startsAt: min(-132) }),
  station("MH-02", "Main Hall", "in-use", { member: "Marcus Vale", endsAt: min(96), startsAt: min(-84) }),
  station("MH-03", "Main Hall", "available"),
  station("MH-04", "Main Hall", "in-use", { member: "Yuki Tanaka", endsAt: min(21), startsAt: min(-159) }),
  station("MH-05", "Main Hall", "in-use", { member: "Dev Patel", endsAt: min(142), startsAt: min(-38) }),
  station("MH-06", "Main Hall", "reserved"),
  station("MH-07", "Main Hall", "maintenance"),
  station("MH-08", "Main Hall", "in-use", { member: "Lina Haddad", endsAt: min(64), startsAt: min(-116) }),
  station("MH-09", "Main Hall", "available"),
  station("MH-10", "Main Hall", "in-use", { member: "Sofia Reyes", endsAt: min(12), startsAt: min(-168) }),
  station("MH-11", "Main Hall", "in-use", { member: "Noah Kim", endsAt: min(77), startsAt: min(-43) }),
  station("MH-12", "Main Hall", "in-use", { member: "Zara Ali", endsAt: min(185), startsAt: min(-55) }),
  station("VIP-01", "VIP Room", "in-use", { member: "Zara Ali", endsAt: min(118), startsAt: min(-62) }),
  station("VIP-02", "VIP Room", "reserved", { member: "Aria Chen", endsAt: min(240) }),
  station("VIP-03", "VIP Room", "maintenance"),
  station("VIP-04", "VIP Room", "in-use", { member: "Yuki Tanaka", endsAt: min(33), startsAt: min(-147) }),
  station("VIP-05", "VIP Room", "available"),
  station("VIP-06", "VIP Room", "in-use", { member: "Marcus Vale", endsAt: min(54), startsAt: min(-126) }),
  station("CS-01", "Console Zone", "in-use", { member: "Sofia Reyes", endsAt: min(26), startsAt: min(-94) }),
  station("CS-02", "Console Zone", "in-use", { member: "Dev Patel", endsAt: min(88), startsAt: min(-32) }),
  station("CS-03", "Console Zone", "available"),
  station("CS-04", "Console Zone", "maintenance"),
  station("CS-05", "Console Zone", "in-use", { member: "Lina Haddad", endsAt: min(9), startsAt: min(-171) }),
  station("CS-06", "Console Zone", "reserved"),
];

export const products: Product[] = [
  { id: "g1", name: "1 Hour Pass", category: "Gaming", price: 4.5, stock: 99, sku: "PC-1H" },
  { id: "g2", name: "3 Hour Pass", category: "Gaming", price: 11, stock: 99, sku: "PC-3H" },
  { id: "g3", name: "5 Hour Pass", category: "Gaming", price: 16, stock: 99, sku: "PC-5H" },
  { id: "g4", name: "Night Owl 8h", category: "Gaming", price: 19, stock: 42, sku: "PC-N8" },
  { id: "g5", name: "Console Hour", category: "Gaming", price: 5, stock: 24, sku: "CS-1H" },
  { id: "g6", name: "Duo Squad 2×3h", category: "Gaming", price: 20, stock: 12, sku: "PC-DUO" },
  { id: "h1", name: "Espresso", category: "Hot Drinks", price: 2.5, stock: 64, sku: "HK-ESP" },
  { id: "h2", name: "Flat White", category: "Hot Drinks", price: 3.75, stock: 41, sku: "HK-FLW" },
  { id: "h3", name: "Matcha Latte", category: "Hot Drinks", price: 4.25, stock: 18, sku: "HK-MAT" },
  { id: "h4", name: "Hot Chocolate", category: "Hot Drinks", price: 3.5, stock: 27, sku: "HK-CHO" },
  { id: "c1", name: "Cola 330ml", category: "Cold Drinks", price: 2, stock: 88, sku: "CD-COL" },
  { id: "c2", name: "Energy Drink", category: "Cold Drinks", price: 3.5, stock: 56, sku: "CD-ENG" },
  { id: "c3", name: "Iced Latte", category: "Cold Drinks", price: 4, stock: 22, sku: "CD-ICE" },
  { id: "c4", name: "Sparkling Water", category: "Cold Drinks", price: 2.25, stock: 34, sku: "CD-SPR" },
  { id: "s1", name: "Loaded Nachos", category: "Snacks", price: 6.5, stock: 9, sku: "SN-NAC" },
  { id: "s2", name: "Sea Salt Crisps", category: "Snacks", price: 1.75, stock: 67, sku: "SN-CRI" },
  { id: "s3", name: "Protein Bar", category: "Snacks", price: 3, stock: 15, sku: "SN-PRB" },
  { id: "s4", name: "Truffle Popcorn", category: "Snacks", price: 2.5, stock: 31, sku: "SN-POP" },
  { id: "m1", name: "Chicken Burger", category: "Meals", price: 8.5, stock: 14, sku: "ML-BRG" },
  { id: "m2", name: "Pepperoni Pizza", category: "Meals", price: 11, stock: 7, sku: "ML-PZA" },
];

export const inventory: InventoryItem[] = [
  { id: "i1", name: "Coca-Cola 330ml", sku: "CD-COL", category: "Cafe", stock: 88, reorder: 48, unitCost: 0.82, supplier: "Metro Beverage" },
  { id: "i2", name: "Monster Energy", sku: "CD-ENG", category: "Cafe", stock: 56, reorder: 36, unitCost: 1.45, supplier: "Metro Beverage" },
  { id: "i3", name: "Oat Milk 1L", sku: "HK-OAT", category: "Cafe", stock: 12, reorder: 20, unitCost: 2.1, supplier: "Daily Dairy" },
  { id: "i4", name: "Arabica Beans 1kg", sku: "HK-BEA", category: "Cafe", stock: 8, reorder: 6, unitCost: 18.5, supplier: "Roast Lab" },
  { id: "i5", name: "Loaded Nachos Kit", sku: "SN-NAC", category: "Cafe", stock: 9, reorder: 15, unitCost: 2.75, supplier: "Snack Co." },
  { id: "i6", name: "Pepperoni Pizza 12\"", sku: "ML-PZA", category: "Cafe", stock: 7, reorder: 12, unitCost: 4.2, supplier: "Forno Direct" },
  { id: "i7", name: "RTX 4070 Super", sku: "HW-GPU-4070", category: "Hardware", stock: 3, reorder: 2, unitCost: 599, supplier: "Vertex Supply" },
  { id: "i8", name: "Samsung 990 Pro 2TB", sku: "HW-SSD-2T", category: "Hardware", stock: 5, reorder: 4, unitCost: 189, supplier: "Vertex Supply" },
  { id: "i9", name: "Corsair 850W PSU", sku: "HW-PSU-850", category: "Hardware", stock: 2, reorder: 3, unitCost: 149, supplier: "Vertex Supply" },
  { id: "i10", name: "120mm Case Fan", sku: "HW-FAN-120", category: "Hardware", stock: 14, reorder: 8, unitCost: 24, supplier: "Vertex Supply" },
  { id: "i11", name: "Thermal Paste", sku: "HW-THP-01", category: "Hardware", stock: 11, reorder: 6, unitCost: 9.5, supplier: "Vertex Supply" },
  { id: "i12", name: "USB-C Cable 2m", sku: "HW-CBL-2M", category: "Supplies", stock: 26, reorder: 15, unitCost: 6.4, supplier: "CableWorks" },
  { id: "i13", name: "Cleaning Wipes", sku: "SP-WIP-50", category: "Supplies", stock: 4, reorder: 10, unitCost: 3.2, supplier: "CleanPro" },
  { id: "i14", name: "Liqui Hoodie", sku: "MR-HOD-BLK", category: "Merch", stock: 17, reorder: 10, unitCost: 14, supplier: "Threadline" },
];

export const revenueSeries = [
  { day: "Nov 01", revenue: 3180, expenses: 1420 },
  { day: "Nov 02", revenue: 3640, expenses: 1510 },
  { day: "Nov 03", revenue: 4210, expenses: 1680 },
  { day: "Nov 04", revenue: 3890, expenses: 1590 },
  { day: "Nov 05", revenue: 4620, expenses: 1740 },
  { day: "Nov 06", revenue: 5140, expenses: 1820 },
  { day: "Nov 07", revenue: 5480, expenses: 1910 },
  { day: "Nov 08", revenue: 4720, expenses: 1770 },
  { day: "Nov 09", revenue: 4360, expenses: 1650 },
  { day: "Nov 10", revenue: 4890, expenses: 1810 },
  { day: "Nov 11", revenue: 5310, expenses: 1890 },
  { day: "Nov 12", revenue: 5070, expenses: 1840 },
  { day: "Nov 13", revenue: 5620, expenses: 1960 },
  { day: "Nov 14", revenue: 4286, expenses: 1540 },
];

export const hourlyRevenue = [
  { hour: "10", revenue: 120 },
  { hour: "11", revenue: 184 },
  { hour: "12", revenue: 264 },
  { hour: "13", revenue: 312 },
  { hour: "14", revenue: 286 },
  { hour: "15", revenue: 354 },
  { hour: "16", revenue: 438 },
  { hour: "17", revenue: 402 },
  { hour: "18", revenue: 512 },
  { hour: "19", revenue: 486 },
  { hour: "20", revenue: 568 },
  { hour: "21", revenue: 360 },
];

export const zoneOccupancy = [
  { zone: "Main Hall", busy: 8, total: 12 },
  { zone: "VIP", busy: 4, total: 6 },
  { zone: "Console", busy: 4, total: 6 },
];

export const paymentMix = [
  { name: "Member balance", value: 42, color: "var(--theme-primary)" },
  { name: "Card", value: 34, color: "var(--theme-secondary)" },
  { name: "Cash", value: 16, color: "#94a3b8" },
  { name: "PC tab", value: 8, color: "#475569" },
];

export const activity = [
  { id: "a1", station: "MH-12", member: "Zara Ali", detail: "Started 4h session", amount: 16, at: "2m" },
  { id: "a2", station: "Cafe", member: "Walk-in", detail: "2× Flat White", amount: 7.5, at: "6m" },
  { id: "a3", station: "VIP-01", member: "Zara Ali", detail: "Order · Pepperoni Pizza", amount: 11, at: "9m" },
  { id: "a4", station: "MH-07", member: "System", detail: "SSD health alert", amount: 0, at: "12m" },
  { id: "a5", station: "MB-2113", member: "Yuki Tanaka", detail: "Balance top-up", amount: 50, at: "18m" },
  { id: "a6", station: "CS-05", member: "Lina Haddad", detail: "Session extended 1h", amount: 5, at: "24m" },
  { id: "a7", station: "Cafe", member: "Walk-in", detail: "Loaded Nachos", amount: 6.5, at: "31m" },
];

export const alerts: HardwareAlert[] = [
  { id: "al1", station: "MH-07", kind: "Storage", severity: "critical", message: "SSD wear level 89% · replace", at: "12m ago" },
  { id: "al2", station: "VIP-03", kind: "Thermal", severity: "critical", message: "GPU fan 0 RPM at 84°C", at: "26m ago" },
  { id: "al3", station: "CS-02", kind: "Network", severity: "warning", message: "Packet loss 18% over 10 min", at: "41m ago" },
  { id: "al4", station: "MH-11", kind: "Crash", severity: "warning", message: "3 game crashes in 2 hours", at: "1h ago" },
  { id: "al5", station: "VIP-05", kind: "Power", severity: "warning", message: "PSU ripple above threshold", at: "2h ago" },
  { id: "al6", station: "CS-04", kind: "Storage", severity: "info", message: "Disk 92% full · cleanup queued", at: "3h ago" },
];

export const shifts = [
  { id: "SH-114", label: "Morning", staff: "Nadia R.", window: "06:00 — 14:00", cash: 412.5, card: 1486.2, tab: 210.4, variance: 0, status: "closed" },
  { id: "SH-115", label: "Day", staff: "Omar K.", window: "14:00 — 22:00", cash: 386.75, card: 1724.8, tab: 268.5, variance: -4.5, status: "closed" },
  { id: "SH-116", label: "Night", staff: "Ivy M.", window: "22:00 — 06:00", cash: 224.1, card: 988.4, tab: 142, variance: 0, status: "open" },
];

export const loans = [
  { id: "LN-092", member: "Marcus Vale", amount: 32.5, opened: "Nov 09", due: "Nov 16", status: "overdue" },
  { id: "LN-095", member: "Dev Patel", amount: 18, opened: "Nov 11", due: "Nov 18", status: "open" },
  { id: "LN-101", member: "Eli Novak", amount: 41.25, opened: "Oct 28", due: "Nov 04", status: "overdue" },
  { id: "LN-104", member: "Noah Kim", amount: 9.75, opened: "Nov 13", due: "Nov 20", status: "open" },
];

export const topProducts = [
  { name: "3 Hour Pass", units: 68, revenue: 748 },
  { name: "Energy Drink", units: 54, revenue: 189 },
  { name: "Flat White", units: 47, revenue: 176.25 },
  { name: "Loaded Nachos", units: 31, revenue: 201.5 },
  { name: "Night Owl 8h", units: 24, revenue: 456 },
];

export const specs = [
  { station: "MH-01", cpu: "Intel i5-13600K", gpu: "RTX 4070", ram: "32 GB DDR5", storage: "1 TB NVMe", os: "Windows 11 Pro" },
  { station: "MH-04", cpu: "Intel i5-13600K", gpu: "RTX 4070", ram: "32 GB DDR5", storage: "1 TB NVMe", os: "Windows 11 Pro" },
  { station: "VIP-01", cpu: "Ryzen 7 7800X3D", gpu: "RTX 4090", ram: "64 GB DDR5", storage: "2 TB NVMe", os: "Windows 11 Pro" },
  { station: "VIP-04", cpu: "Ryzen 7 7800X3D", gpu: "RTX 4090", ram: "64 GB DDR5", storage: "2 TB NVMe", os: "Windows 11 Pro" },
  { station: "CS-01", cpu: "PS5 Pro APU", gpu: "RDNA 4", ram: "16 GB GDDR6", storage: "2 TB NVMe", os: "Orbis OS" },
  { station: "CS-05", cpu: "PS5 Pro APU", gpu: "RDNA 4", ram: "16 GB GDDR6", storage: "2 TB NVMe", os: "Orbis OS" },
];

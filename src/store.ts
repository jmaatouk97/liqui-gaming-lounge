import { create } from "zustand";
import {
  activity as activitySeed,
  inventory as inventorySeed,
  members as memberSeed,
  products,
  stations as stationSeed,
  type InventoryItem,
  type Member,
  type Station,
} from "./data";

export interface CartLine {
  productId: string;
  qty: number;
}
export interface ActivityItem {
  id: string;
  station: string;
  member: string;
  detail: string;
  amount: number;
  at: string;
}
export interface NetPoint {
  t: number;
  up: number;
  down: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const jitter = (v: number, amt: number, lo: number, hi: number) => clamp(v + (Math.random() - 0.5) * amt, lo, hi);

const seedNet = (): NetPoint[] =>
  Array.from({ length: 40 }, (_, i) => ({
    t: i,
    up: 120 + Math.round(Math.sin(i / 3) * 40 + Math.random() * 30),
    down: 420 + Math.round(Math.cos(i / 4) * 90 + Math.random() * 60),
  }));

interface AppState {
  sidebarCollapsed: boolean;
  cafeMode: "pos" | "floor";
  activeCategory: string;
  cafeQuery: string;
  cart: CartLine[];
  cartTarget: string | null;
  stations: Station[];
  stock: InventoryItem[];
  members: Member[];
  activity: ActivityItem[];
  orders: number;
  revenueToday: number;
  net: NetPoint[];
  updates: Record<string, number>;
  toggleSidebar: () => void;
  setCafeMode: (m: "pos" | "floor") => void;
  setCategory: (c: string) => void;
  setCafeQuery: (q: string) => void;
  addItem: (id: string) => void;
  decItem: (id: string) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  setCartTarget: (id: string | null) => void;
  checkout: () => { total: number; count: number; target: string | null };
  startSession: (id: string, minutes: number, member?: string) => void;
  extendSession: (id: string, minutes: number) => void;
  endSession: (id: string) => void;
  setMaintenance: (id: string, on: boolean) => void;
  restartStation: (id: string) => void;
  pushUpdate: (ids: string[]) => void;
  restock: (id: string, qty: number) => void;
  addStockItem: (item: InventoryItem) => void;
  topUp: (id: string, amount: number) => void;
  addMember: (m: Member) => void;
  tick: () => void;
}

let uid = 100;

export const cartTotal = (cart: CartLine[]) =>
  cart.reduce((sum, l) => sum + (products.find((p) => p.id === l.productId)?.price ?? 0) * l.qty, 0);

export const useApp = create<AppState>((set, get) => ({
  sidebarCollapsed: false,
  cafeMode: "pos",
  activeCategory: "All",
  cafeQuery: "",
  cart: [],
  cartTarget: null,
  stations: stationSeed,
  stock: inventorySeed,
  members: memberSeed,
  activity: activitySeed,
  orders: 142,
  revenueToday: 4286.5,
  net: seedNet(),
  updates: {},

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCafeMode: (cafeMode) => set({ cafeMode }),
  setCategory: (activeCategory) => set({ activeCategory }),
  setCafeQuery: (cafeQuery) => set({ cafeQuery }),

  addItem: (id) =>
    set((s) => {
      const ex = s.cart.find((l) => l.productId === id);
      return {
        cart: ex ? s.cart.map((l) => (l.productId === id ? { ...l, qty: l.qty + 1 } : l)) : [...s.cart, { productId: id, qty: 1 }],
      };
    }),
  decItem: (id) =>
    set((s) => ({
      cart: s.cart.map((l) => (l.productId === id ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0),
    })),
  removeLine: (id) => set((s) => ({ cart: s.cart.filter((l) => l.productId !== id) })),
  clearCart: () => set({ cart: [] }),
  setCartTarget: (cartTarget) => set({ cartTarget }),

  checkout: () => {
    const s = get();
    const total = cartTotal(s.cart);
    const count = s.cart.reduce((n, l) => n + l.qty, 0);
    const target = s.cartTarget;
    if (!count) return { total: 0, count: 0, target };
    const names = s.cart
      .map((l) => `${l.qty}× ${products.find((p) => p.id === l.productId)?.name}`)
      .slice(0, 2)
      .join(", ");
    set({
      cart: [],
      cartTarget: null,
      orders: s.orders + 1,
      revenueToday: Math.round((s.revenueToday + total) * 100) / 100,
      activity: [
        { id: `a${uid++}`, station: target ?? "Cafe", member: "Walk-in", detail: names, amount: total, at: "now" },
        ...s.activity,
      ].slice(0, 12),
    });
    return { total, count, target };
  },

  startSession: (id, minutes, member = "Walk-in") =>
    set((s) => ({
      stations: s.stations.map((st) =>
        st.id === id
          ? { ...st, status: "in-use", member, startsAt: Date.now(), endsAt: Date.now() + minutes * 60_000 }
          : st,
      ),
      activity: [
        { id: `a${uid++}`, station: id, member, detail: `Started ${minutes / 60}h session`, amount: 0, at: "now" },
        ...s.activity,
      ].slice(0, 12),
    })),
  extendSession: (id, minutes) =>
    set((s) => ({
      stations: s.stations.map((st) =>
        st.id === id ? { ...st, endsAt: (st.endsAt ?? Date.now()) + minutes * 60_000 } : st,
      ),
    })),
  endSession: (id) =>
    set((s) => ({
      stations: s.stations.map((st) =>
        st.id === id ? { ...st, status: "available", member: undefined, endsAt: undefined, startsAt: undefined } : st,
      ),
    })),
  setMaintenance: (id, on) =>
    set((s) => ({
      stations: s.stations.map((st) =>
        st.id === id
          ? {
              ...st,
              status: on ? "maintenance" : "available",
              member: on ? undefined : st.member,
              endsAt: on ? undefined : st.endsAt,
              startsAt: on ? undefined : st.startsAt,
            }
          : st,
      ),
    })),
  restartStation: (id) =>
    set((s) => ({
      stations: s.stations.map((st) =>
        st.id === id ? { ...st, telemetry: { ...st.telemetry, cpu: 8, gpu: 4, fps: 0, uptime: "0d 0h" } } : st,
      ),
    })),
  pushUpdate: (ids) => {
    set((s) => ({ updates: { ...s.updates, ...Object.fromEntries(ids.map((i) => [i, 0])) } }));
    const timer = setInterval(() => {
      const cur = get().updates;
      const next: Record<string, number> = { ...cur };
      let running = false;
      for (const id of ids) {
        if (next[id] === undefined) continue;
        next[id] = Math.min(100, next[id] + 8 + Math.random() * 14);
        if (next[id] < 100) running = true;
      }
      set({ updates: next });
      if (!running) {
        clearInterval(timer);
        setTimeout(() => {
          const rest = { ...get().updates };
          ids.forEach((i) => delete rest[i]);
          set({ updates: rest });
        }, 1800);
      }
    }, 450);
  },

  restock: (id, qty) => set((s) => ({ stock: s.stock.map((i) => (i.id === id ? { ...i, stock: i.stock + qty } : i)) })),
  addStockItem: (item) => set((s) => ({ stock: [item, ...s.stock] })),
  topUp: (id, amount) =>
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, balance: Math.round((m.balance + amount) * 100) / 100 } : m)),
      revenueToday: Math.round((s.revenueToday + amount) * 100) / 100,
    })),
  addMember: (m) => set((s) => ({ members: [m, ...s.members] })),

  tick: () =>
    set((s) => {
      const last = s.net[s.net.length - 1];
      return {
        stations: s.stations.map((st) =>
          st.status === "in-use"
            ? {
                ...st,
                telemetry: {
                  ...st.telemetry,
                  cpu: Math.round(jitter(st.telemetry.cpu, 10, 12, 96)),
                  gpu: Math.round(jitter(st.telemetry.gpu, 12, 15, 99)),
                  ping: Math.round(jitter(st.telemetry.ping, 4, 3, 60)),
                  fps: Math.round(jitter(st.telemetry.fps, 18, 60, 320)),
                  ram: Math.round(jitter(st.telemetry.ram, 4, 20, 95)),
                },
              }
            : st,
        ),
        net: [
          ...s.net.slice(1),
          {
            t: last.t + 1,
            up: Math.round(jitter(last.up, 50, 60, 260)),
            down: Math.round(jitter(last.down, 120, 220, 760)),
          },
        ],
      };
    }),
}));

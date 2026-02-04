import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: number;
  name: string;
  name_mm: string;
  price: number;
  qty: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "qty">>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (existingItem) {
        if (existingItem.qty < existingItem.stock) {
          existingItem.qty += 1;
        }
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
      );
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; qty: number }>,
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        if (action.payload.qty > 0 && action.payload.qty <= item.stock) {
          item.qty = action.payload.qty;
        }
      }
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

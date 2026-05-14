import type { Tour } from "@/shared/api/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartState } from "@/shared/types";
import { addToLocalStore } from "@/store/localStore";

const initialState: CartState = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart(state, action: PayloadAction<Tour>) {
      const existing = state.find((el) => el.item.id === action.payload.id);
      if (existing) {
        existing.count += 1;
      } else {
        state.push({
          item: action.payload,
          count: 1,
        });
      }
      addToLocalStore("cart", state);
    },

    removeFromCart(state, action: PayloadAction<number>) {

      const newState = state
        .map((el) =>
          el.item.id === action.payload ? { ...el, count: el.count - 1 } : el,
        )
        .filter((el) => el.count > 0);
      addToLocalStore("cart", newState);
      return newState;
    },

    removeAllFromCart(state, action: PayloadAction<number>) {
      const newState = state.filter((el) => el.item.id !== action.payload);
      addToLocalStore("cart", newState);
      return newState;
    },
  },
});

export const { addToCart, removeFromCart, removeAllFromCart } =
  cartSlice.actions;

export default cartSlice.reducer;

import type { Tour } from "@/shared/api/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartState } from "@/shared/types";

const initialState: CartState = {
  cart: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart(state, action: PayloadAction<Tour>) {
      const existing = state.cart.find(
        (el) => el.item.id === action.payload.id,
      );

      if (existing) {
        existing.count += 1;
      } else {
        state.cart.push({
          item: action.payload,
          count: 1,
        });
      }
    },

    removeFromCart(state, action: PayloadAction<number>) {
      state.cart = state.cart
        .map((el) =>
          el.item.id === action.payload ? { ...el, count: el.count - 1 } : el,
        )
        .filter((el) => el.count > 0);
    },

    removeAllFromCart(state, action: PayloadAction<number>) {
      state.cart = state.cart.filter((el) => el.item.id !== action.payload);
    },
  },
});

export const { addToCart, removeFromCart, removeAllFromCart } =
  cartSlice.actions;

export default cartSlice.reducer;

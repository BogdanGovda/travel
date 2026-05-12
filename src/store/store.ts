import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/features/cart/cartSlice";
import { addToLocalStore, getFromLocalStore } from "./localStore";
const preloadedState = {
  cart: {
    cart: getFromLocalStore("cart"),
  },
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },

  preloadedState,
});

store.subscribe(() => {
  addToLocalStore("cart", store.getState().cart.cart);
});

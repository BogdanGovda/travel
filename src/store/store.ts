import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/redux/cartSlice";
import type { CartState, FavoriteState } from "@/shared/types";
import { addToLocalStore, getFromLocalStore } from "./localStore";
import favoriteReducer from "@/features/favorite/favoriteSlice";

const preloadedState = {
  cart: getFromLocalStore("cart") as CartState,
  favorite: getFromLocalStore("favorite") as FavoriteState,
};
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    favorite: favoriteReducer,
  },

  preloadedState,
});

// store.subscribe(() => {
//   // addToLocalStore("store", store.getState());
//   // addToLocalStore("favorite", store.getState().favorite);
// });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

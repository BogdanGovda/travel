import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FavoriteState } from "@/shared/types";
import type { Tour } from "@/shared/types";
import { addToLocalStore } from "@/store/localStore";

const initialState: FavoriteState = [];

const favoriteSlice = createSlice({
  name: "favorite",
  initialState,

  reducers: {

    addToFavorite(state, action: PayloadAction<Tour>) {
      const idx = state.findIndex((el) => el.id === action.payload.id);
      if (idx !== -1) {
        state.splice(idx, 1);
      } else {
        state.push(action.payload);
      }
      addToLocalStore("favorite", state);
    },
    
  },
});

export const { addToFavorite } =
  favoriteSlice.actions;

export default favoriteSlice.reducer;

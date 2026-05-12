import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favorite: [],
};

const favoriteSlice = createSlice({
  name: "favorite",
  initialState,

  reducers: {},
});

export const {} = favoriteSlice.actions;

export default favoriteSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
   searchValue: string;
   suggestions: string[];
   showSuggestions: boolean;
   isListening: boolean;
   isFocused: boolean;
}

const initialState: SearchState = {
   searchValue: "",
   suggestions: [],
   showSuggestions: false,
   isListening: false,
   isFocused: false,
};

export const searchSlice = createSlice({
   name: "search",
   initialState,
   reducers: {
      setSearchValue: (state, action: PayloadAction<string>) => {
         state.searchValue = action.payload;
      },

      setSuggestions: (state, action: PayloadAction<string[]>) => {
         state.suggestions = action.payload;
      },

      setShowSuggestions: (state, action: PayloadAction<boolean>) => {
         state.showSuggestions = action.payload;
      },

      setIsListening: (state, action: PayloadAction<boolean>) => {
         state.isListening = action.payload;
      },

      setIsFocused: (state, action: PayloadAction<boolean>) => {
         state.isFocused = action.payload;
      },

      clearSearch: (state) => {
         state.searchValue = "";
         state.suggestions = [];
         state.showSuggestions = false;
      },
   },
});

export const {
   setSearchValue,
   setSuggestions,
   setShowSuggestions,
   setIsListening,
   setIsFocused,
   clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;

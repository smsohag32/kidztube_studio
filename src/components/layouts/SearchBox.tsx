import { useRef, useEffect } from "react";
import { Search, Mic, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
   setSearchValue,
   setSuggestions,
   setShowSuggestions,
   setIsListening,
   setIsFocused,
   clearSearch,
} from "@/redux-store/slices/searchSlice";
import type { RootState } from "@/redux-store";

const SearchBox: React.FC = () => {
   const dispatch = useDispatch();

   const { searchValue, suggestions, showSuggestions, isListening, isFocused } = useSelector(
      (state: RootState) => state.search
   );

   const searchInputRef = useRef<HTMLInputElement>(null);
   const suggestionsRef = useRef<HTMLDivElement>(null);

   const allSuggestions = [
      "how to upload kids video",
      "best kid friendly video ideas",
      "kids animation tutorial",
      "how to make abc learning videos",
      "nursery rhymes video editing",
      "kids storytelling video ideas",
      "children cartoon animation tools",
      "how to make kids educational videos",
      "fun facts for kids video topics",
      "kids reaction video setup",
      "kidztube studio editor tutorial",
      "how to create safe kids content",
      "how to add subtitles for kids",
      "thumbnail ideas for kids videos",
      "kids learning songs creation",
      "best background music for kids videos",
      "how to make 2d cartoon animation",
      "kids craft DIY video ideas",
      "kids gaming video recording tips",
      "child friendly voiceover tips",
   ];

   // search input handler
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      dispatch(setSearchValue(value));

      if (value.trim()) {
         const filtered = allSuggestions.filter((s) =>
            s.toLowerCase().includes(value.toLowerCase())
         );
         dispatch(setSuggestions(filtered));
         dispatch(setShowSuggestions(true));
      } else {
         dispatch(setShowSuggestions(false));
      }
   };

   const handleClear = () => {
      dispatch(clearSearch());
      searchInputRef.current?.focus();
   };

   const handleVoiceSearch = () => {
      const nowListening = !isListening;
      dispatch(setIsListening(nowListening));

      if (nowListening) {
         setTimeout(() => {
            dispatch(setSearchValue("voice search result"));
            dispatch(setIsListening(false));
         }, 2000);
      }
   };

   const handleSearch = (value: string) => {
      dispatch(setSearchValue(value));
      dispatch(setShowSuggestions(false));
      console.log("Search:", value);
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchValue.trim()) {
         handleSearch(searchValue);
      }
   };

   // outside click to close suggestion box
   useEffect(() => {
      const handleClick = (e: MouseEvent) => {
         if (
            suggestionsRef.current &&
            !suggestionsRef.current.contains(e.target as Node) &&
            searchInputRef.current &&
            !searchInputRef.current.contains(e.target as Node)
         ) {
            dispatch(setShowSuggestions(false));
         }
      };

      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
   }, [dispatch]);

   return (
      <div className="relative w-full max-w-xl mx-auto">
         {/* Search Input Box */}
         <div
            className={`flex items-center gap-2 px-4 rounded-full border-2 shadow-lg transition-all
               ${isFocused ? "border-primary/20" : "border-gray-300 dark:border-primary/10"}
               bg-white dark:bg-card`}>
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />

            <input
               ref={searchInputRef}
               type="text"
               placeholder="Search..."
               value={searchValue}
               onChange={handleInputChange}
               onFocus={() => dispatch(setIsFocused(true))}
               onBlur={() => dispatch(setIsFocused(false))}
               onKeyDown={handleKeyDown}
               className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />

            {/* CLEAR BUTTON */}
            {searchValue && (
               <button
                  onClick={handleClear}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
               </button>
            )}

            {/* VOICE SEARCH */}
            <button
               onClick={handleVoiceSearch}
               className={`p-2 rounded-full transition 
                  ${
                     isListening
                        ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                        : "hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400"
                  }`}>
               <Mic className="w-5 h-5" />
            </button>
         </div>

         {/* Voice listening animation */}
         {isListening && (
            <div className="absolute right-20 top-1/2 transform -translate-y-1/2 flex gap-1">
               <div className="w-1 h-4 bg-red-500 dark:bg-red-400 rounded-full animate-bounce"></div>
               <div className="w-1 h-4 bg-red-500 dark:bg-red-400 rounded-full animate-bounce delay-100"></div>
               <div className="w-1 h-4 bg-red-500 dark:bg-red-400 rounded-full animate-bounce delay-200"></div>
            </div>
         )}

         {/* Suggestions Dropdown */}
         {showSuggestions && suggestions.length > 0 && (
            <div
               ref={suggestionsRef}
               className="absolute mt-2 w-full bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-gray-200 dark:border-slate-700 max-h-60 overflow-auto">
               {suggestions.map((s, i) => (
                  <div
                     key={i}
                     onClick={() => handleSearch(s)}
                     className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200">
                     {s}
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default SearchBox;

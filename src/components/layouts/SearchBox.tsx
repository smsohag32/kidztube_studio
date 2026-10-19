import { useRef, useEffect } from "react";
import { Search, Mic, X, Sparkles, TrendingUp } from "lucide-react";
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

   const trendingTopics = [
      "ABC Nursery Rhymes",
      "Colors & Numbers",
      "Animal Cartoons",
      "Science Fun",
      "Kids Storytime",
   ];

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

   // Global shortcut: Ctrl+K or Cmd+K
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            searchInputRef.current?.focus();
         }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
   }, []);

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
            dispatch(setSearchValue("Learning videos for kids"));
            dispatch(setIsListening(false));
            dispatch(setShowSuggestions(false));
         }, 2000);
      }
   };

   const handleSearch = (value: string) => {
      dispatch(setSearchValue(value));
      dispatch(setShowSuggestions(false));
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchValue.trim()) {
         handleSearch(searchValue);
      }
      if (e.key === "Escape") {
         dispatch(setShowSuggestions(false));
         searchInputRef.current?.blur();
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
            className={`flex items-center gap-2.5 px-4 h-10 rounded-full border transition-all duration-200
               ${
                  isFocused
                     ? "border-primary ring-3 ring-primary/15 bg-background shadow-md"
                     : "border-border/70 hover:border-border bg-muted/40 hover:bg-muted/60"
               }`}>
            <Search
               className={`w-4 h-4 transition-colors ${
                  isFocused ? "text-primary" : "text-muted-foreground"
               }`}
            />

            <input
               ref={searchInputRef}
               type="text"
               placeholder="Search videos, creators, learning topics..."
               value={searchValue}
               onChange={handleInputChange}
               onFocus={() => {
                  dispatch(setIsFocused(true));
                  if (searchValue.trim()) dispatch(setShowSuggestions(true));
               }}
               onBlur={() => dispatch(setIsFocused(false))}
               onKeyDown={handleKeyDown}
               className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/70"
            />

            {/* Keyboard shortcut indicator */}
            {!searchValue && !isFocused && (
               <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-2xs">
                  <span className="text-xs">⌘</span>K
               </kbd>
            )}

            {/* CLEAR BUTTON */}
            {searchValue && (
               <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search"
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition">
                  <X className="w-4 h-4" />
               </button>
            )}

            {/* VOICE SEARCH */}
            <button
               type="button"
               onClick={handleVoiceSearch}
               title="Voice search"
               className={`p-1.5 rounded-full transition-all duration-200 
                  ${
                     isListening
                        ? "bg-red-500 text-white shadow-sm shadow-red-500/40 animate-pulse"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
               <Mic className="w-4 h-4" />
            </button>
         </div>

         {/* Voice listening status */}
         {isListening && (
            <div className="absolute top-12 left-0 right-0 py-2 px-4 rounded-xl bg-background/95 backdrop-blur-md border border-red-500/30 shadow-lg flex items-center justify-between text-xs text-red-500 font-medium z-50">
               <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Listening for Kids Studio search query...
               </span>
               <div className="flex gap-1 items-center">
                  <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce"></span>
                  <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
               </div>
            </div>
         )}

         {/* Suggestions Dropdown */}
         {showSuggestions && suggestions.length > 0 && (
            <div
               ref={suggestionsRef}
               className="absolute mt-2 w-full bg-popover/95 backdrop-blur-md shadow-2xl rounded-2xl border border-border/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
               <div className="p-2 border-b border-border/40 text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider px-3">
                  <Sparkles className="w-3 h-3 text-primary" /> Suggestions
               </div>
               <div className="max-h-64 overflow-y-auto divide-y divide-border/20 py-1">
                  {suggestions.map((s, i) => (
                     <div
                        key={i}
                        onClick={() => handleSearch(s)}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/70 text-sm text-foreground transition-colors group">
                        <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="flex-1 truncate">{s}</span>
                     </div>
                  ))}
               </div>
               <div className="p-2.5 bg-muted/30 border-t border-border/40">
                  <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5 px-1">
                     <TrendingUp className="w-3 h-3 text-primary" /> Popular Topics
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-1">
                     {trendingTopics.map((topic, idx) => (
                        <button
                           key={idx}
                           type="button"
                           onClick={() => handleSearch(topic)}
                           className="text-xs px-2.5 py-1 rounded-full bg-background/80 hover:bg-primary hover:text-primary-foreground border border-border/60 transition-colors">
                           {topic}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default SearchBox;


import React, { useEffect, useState } from "react";
import "./SearchBar.css";
import { useContextPokemon } from "../../context/Context";

export const SearchBar = () => {
  const { searchPokemonByName, clearSearch } = useContextPokemon();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const value = query.trim().toLowerCase();
    if (!value) {
      clearSearch();
      return;
    }

    const timer = window.setTimeout(() => {
      void searchPokemonByName(value);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query, searchPokemonByName, clearSearch]);

  return (
    <div className="searchBar">
      <input
        id="searchBar-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder="Buscar Pokemon..."
        autoComplete="off"
      />
      {query.length > 0 && (
        <button
          type="button"
          className="searchBar-clear"
          onClick={() => setQuery("")}
          aria-label="Borrar busqueda"
        >
          x
        </button>
      )}
    </div>
  );
};

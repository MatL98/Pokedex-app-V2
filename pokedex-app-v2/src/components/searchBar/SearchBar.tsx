import './SearchBar.css';
import React, { useEffect, useState } from "react";
import { useContextPokemon } from "../../context/Context";

export const SearchBar = () => {
  const { searchPokemonByName, clearSearch } = useContextPokemon();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const runSearch = async () => {
      if (search.length > 0) {
        await searchPokemonByName(search);
      }
    };
    runSearch();
  }, [search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length) {
      setSearch(value.toLowerCase());
    } else {
      clearSearch();
      setSearch('');
    }
  };

  return (
    <div className="searchBar"> 
      <input
        id="searchBar-input"
        onChange={handleInputChange}
        value={search}
        type="text"
        placeholder="Buscar Pokémon..."
      />
    </div>
  );
};

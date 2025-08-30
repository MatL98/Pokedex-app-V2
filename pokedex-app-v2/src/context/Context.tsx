// AppContext.tsx
import { createContext, useCallback, useContext, useMemo, PropsWithChildren } from "react";

type PokemonListItem = { name: string; url: string };
type PokemonListResult = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
};

type AppContextValue = {
  getDataPokemons: (offset: number, limit?: number) => Promise<PokemonListResult>;
  getPokemonData: (pokemon: string | number) => Promise<any>;
	searchPokemonByName: (name: string) => Promise<Pokemon | null>;
  clearSearch: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider ({ children }: PropsWithChildren) {
  const getDataPokemons = useCallback(async (offset: number, limit = 20) => {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset * limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error fetching list: ${res.status}`);
    return res.json();
  }, []);

  const getPokemonData = useCallback(async (pokemon: string | number) => {
    const idOrName = encodeURIComponent(String(pokemon).trim().toLowerCase());
    const url = `https://pokeapi.co/api/v2/pokemon/${idOrName}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Pokémon not found (${res.status})`);
    return res.json();
  }, []);

	const searchPokemonByName = async (name: string) => {
    return await getPokemonData(name);
  };

	const clearSearch = () => {
    // lógica para limpiar la búsqueda global si hace falta
  };

  const value = useMemo<AppContextValue>(
    () => ({ getDataPokemons, getPokemonData, clearSearch,  searchPokemonByName}),
    [getDataPokemons, getPokemonData, clearSearch, searchPokemonByName]
  );
	

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useContextPokemon() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

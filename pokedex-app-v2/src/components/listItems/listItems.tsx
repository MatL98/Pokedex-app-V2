import './ListPokemon.css';
import ItemPokemon from "../item/item";
import { useEffect, useState, useCallback, useRef } from "react";
import { useContextPokemon } from "../../context/Context";
import type { Pokemon } from "../../context/Context";
import { useScrollMemoryWithInfiniteScroll } from "../scrollInfinit/ScrollInfinity";
import { Header } from '../header/header';
import PokemonModal from "../pokemonModal/PokemonModal";

export default function PokemonList() {
  const {
    getDataPokemons,
    getPokemonData,
    cachePokemonsByName,
    searchResult,
    isSearching,
    searchError,
    showOnlyFavorites,
    favoritesList,
    favoriteCount,
  } = useContextPokemon();
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Pokemon[]>([]);
  const isFetchingRef = useRef(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const loadInitialPage = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const data = await getDataPokemons(0);
      const pokemonsNames = data.results;

      const result = await Promise.all(
        pokemonsNames.map(async (pokes) => await getPokemonData(pokes.name))
      );

      cachePokemonsByName(result);
      setItems(result);
      setOffset(1);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [getDataPokemons, getPokemonData, cachePokemonsByName]);

  const loadPage = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const data = await getDataPokemons(offset);
      const pokemonsNames = data.results;

      const result = await Promise.all(
        pokemonsNames.map(async (pokes) => await getPokemonData(pokes.name))
      );

      cachePokemonsByName(result);
      setOffset((prev) => prev + 1);
      setItems((prev) => [...prev, ...result]);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [offset, getDataPokemons, getPokemonData, cachePokemonsByName]);

  useEffect(() => {
    void loadInitialPage();
  }, [loadInitialPage]);

  useScrollMemoryWithInfiniteScroll({
    offset: 100,
    isLoading: loading || isSearching || !!searchResult || showOnlyFavorites,
    onBottomReach: searchResult || showOnlyFavorites ? () => {} : loadPage,
  });

  const basePokemonsToRender = searchResult ? [searchResult] : items;
  const pokemonsToRender = showOnlyFavorites ? favoritesList : basePokemonsToRender;
    

  return (
    <div className="pokedex">
      <Header/>
      {items.length === 0 && loading ? (
        <h4>cargando pokemones...</h4>
      ) : isSearching ? (
        <h4>buscando pokemon...</h4>
      ) : searchError ? (
        <h4>{searchError}</h4>
      ) : showOnlyFavorites && favoriteCount === 0 ? (
        <h4>No tienes pokemones favoritos todavia.</h4>
      ) : (
        <div className="pokedex-list">
          {pokemonsToRender.map((pokes) => (
            <ItemPokemon
              pokemons={pokes}
              key={pokes.url ?? pokes.id}
              onSelect={setSelectedPokemon}
            />
          ))}
        </div>
      )}
      <PokemonModal
        pokemon={selectedPokemon}
        isOpen={!!selectedPokemon}
        onClose={() => setSelectedPokemon(null)}
      />
    </div>
  );
}

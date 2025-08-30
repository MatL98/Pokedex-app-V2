import './ListPokemon.css';
import ItemPokemon from "../item/item";
import { useEffect, useState, useCallback } from "react";
import { useContextPokemon } from "../../context/Context";
import { useScrollMemoryWithInfiniteScroll } from "../scrollInfinit/ScrollInfinity";
import { Header } from '../header/header';

type Item = { name: string; url: string };

export default function PokemonList() {
  const { getDataPokemons, getPokemonData } = useContextPokemon();
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    const data = await getDataPokemons(offset);
    const pokemonsNames = data.results;

    const result = await Promise.all(
      pokemonsNames.map(async (pokes) => await getPokemonData(pokes.name))
    );

    setOffset((prev) => prev + 1);
    setItems((prev) => [...prev, ...result]);
    setLoading(false);
  }, [offset, getDataPokemons, getPokemonData]);

  useEffect(() => {
    loadPage();
  }, []);

  useScrollMemoryWithInfiniteScroll({
    offset: 100,
    isLoading: loading,
    onBottomReach: loadPage,
  });

  return (
    <div className="pokedex">
      <Header/>
      {items.length === 0 && loading ? (
        <h4>cargando pokemones...</h4>
      ) : (
        <div className="pokedex-list">
          {items.map((pokes) => (
            <ItemPokemon pokemons={pokes} key={pokes.url} />
          ))}
        </div>
      )}
    </div>
  );
}
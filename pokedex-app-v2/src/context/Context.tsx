import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PokemonListItem = { name: string; url: string };
type PokemonListResult = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
};

type PokemonType = { type: { name: string } };
type PokemonSprite = { front_default: string | null };
type PokemonAbility = { ability: { name: string } };
type PokemonStat = { base_stat: number; stat: { name: string } };
export type Pokemon = {
  id: number;
  name: string;
  url?: string;
  sprites: PokemonSprite;
  types: PokemonType[];
  height?: number;
  weight?: number;
  base_experience?: number;
  abilities?: PokemonAbility[];
  stats?: PokemonStat[];
};

type AppContextValue = {
  getDataPokemons: (offset: number, limit?: number) => Promise<PokemonListResult>;
  getPokemonData: (pokemon: string | number) => Promise<Pokemon>;
  cachePokemonsByName: (pokemons: Pokemon[]) => void;
  searchPokemonByName: (name: string) => Promise<void>;
  clearSearch: () => void;
  searchResult: Pokemon | null;
  isSearching: boolean;
  searchError: string | null;
  toggleFavorite: (pokemon: Pokemon) => void;
  isFavorite: (pokemon: Pokemon) => boolean;
  favoriteCount: number;
  favoritesList: Pokemon[];
  showOnlyFavorites: boolean;
  toggleFavoritesFilter: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);
const POKEMON_CACHE_KEY = "pokedex_pokemon_cache_v1";
const POKEMON_FAVORITES_KEY = "pokedex_favorites_v1";
const POKEMON_FAVORITES_FILTER_KEY = "pokedex_favorites_filter_v1";
type PokemonCache = Record<string, Pokemon>;
type PokemonFavorites = Record<string, Pokemon>;

const normalizeCacheKey = (value: string | number) =>
  String(value).trim().toLowerCase();

const compactPokemon = (pokemon: Pokemon): Pokemon => ({
  id: pokemon.id,
  name: pokemon.name,
  url: pokemon.url,
  sprites: { front_default: pokemon.sprites?.front_default ?? null },
  types: Array.isArray(pokemon.types)
    ? pokemon.types.map((t) => ({ type: { name: t.type.name } }))
    : [],
  height: pokemon.height,
  weight: pokemon.weight,
  base_experience: pokemon.base_experience,
  abilities: Array.isArray(pokemon.abilities)
    ? pokemon.abilities.map((a) => ({ ability: { name: a.ability.name } }))
    : [],
  stats: Array.isArray(pokemon.stats)
    ? pokemon.stats.map((s) => ({
        base_stat: s.base_stat,
        stat: { name: s.stat.name },
      }))
    : [],
});

const readCacheFromStorage = (): PokemonCache => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(POKEMON_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PokemonCache;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeCacheToStorage = (cache: PokemonCache) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(POKEMON_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors and keep the app flow.
  }
};

const readFavoritesFromStorage = (): PokemonFavorites => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(POKEMON_FAVORITES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PokemonFavorites;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export function AppProvider({ children }: PropsWithChildren) {
  const [searchResult, setSearchResult] = useState<Pokemon | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<PokemonFavorites>(() => readFavoritesFromStorage());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(POKEMON_FAVORITES_FILTER_KEY) === "true";
  });
  const cacheRef = useRef<PokemonCache | null>(null);
  const searchRequestRef = useRef(0);

  const ensureCache = useCallback(() => {
    if (cacheRef.current) return cacheRef.current;
    cacheRef.current = readCacheFromStorage();
    return cacheRef.current;
  }, []);

  const savePokemonInCache = useCallback(
    (pokemon: Pokemon) => {
      const cache = ensureCache();
      const compact = compactPokemon(pokemon);
      const nameKey = normalizeCacheKey(compact.name);
      cache[nameKey] = compact;
      writeCacheToStorage(cache);
    },
    [ensureCache]
  );

  const cachePokemonsByName = useCallback(
    (pokemons: Pokemon[]) => {
      const cache = ensureCache();
      pokemons.forEach((pokemon) => {
        const compact = compactPokemon(pokemon);
        const nameKey = normalizeCacheKey(compact.name);
        cache[nameKey] = compact;
      });
      writeCacheToStorage(cache);
    },
    [ensureCache]
  );

  const getDataPokemons = useCallback(async (offset: number, limit = 20) => {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset * limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error fetching list: ${res.status}`);
    return res.json();
  }, []);

  const getPokemonData = useCallback(
    async (pokemon: string | number) => {
      const normalized = normalizeCacheKey(pokemon);
      const cache = ensureCache();
      const cachedPokemon = typeof pokemon === "string" ? cache[normalized] : undefined;
      if (cachedPokemon) {
        return cachedPokemon;
      }

      const idOrName = encodeURIComponent(normalized);
      const url = `https://pokeapi.co/api/v2/pokemon/${idOrName}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Pokemon not found (${res.status})`);
      const data = (await res.json()) as Pokemon;
      savePokemonInCache(data);
      return compactPokemon(data);
    },
    [ensureCache, savePokemonInCache]
  );

  const searchPokemonByName = useCallback(
    async (name: string) => {
      const requestId = ++searchRequestRef.current;
      const value = name.trim().toLowerCase();
      if (!value) {
        if (requestId === searchRequestRef.current) {
          setSearchResult(null);
          setSearchError(null);
          setIsSearching(false);
        }
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const pokemon = await getPokemonData(value);
        if (requestId !== searchRequestRef.current) return;
        setSearchResult(pokemon);
      } catch {
        if (requestId !== searchRequestRef.current) return;
        setSearchResult(null);
        setSearchError("No se encontro el Pokemon.");
      } finally {
        if (requestId === searchRequestRef.current) {
          setIsSearching(false);
        }
      }
    },
    [getPokemonData]
  );

  const clearSearch = useCallback(() => {
    searchRequestRef.current += 1;
    setSearchResult(null);
    setSearchError(null);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(POKEMON_FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage persistence errors
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      POKEMON_FAVORITES_FILTER_KEY,
      showOnlyFavorites ? "true" : "false"
    );
  }, [showOnlyFavorites]);

  const toggleFavorite = useCallback((pokemon: Pokemon) => {
    const normalizedName = normalizeCacheKey(pokemon.name);
    const compact = compactPokemon(pokemon);
    setFavorites((prev) => {
      if (prev[normalizedName]) {
        const next = { ...prev };
        delete next[normalizedName];
        return next;
      }
      return { ...prev, [normalizedName]: compact };
    });
  }, []);

  const isFavorite = useCallback(
    (pokemon: Pokemon) => !!favorites[normalizeCacheKey(pokemon.name)],
    [favorites]
  );

  const toggleFavoritesFilter = useCallback(() => {
    setShowOnlyFavorites((prev) => !prev);
  }, []);

  const favoriteCount = useMemo(() => Object.keys(favorites).length, [favorites]);
  const favoritesList = useMemo(
    () =>
      Object.values(favorites).sort((a, b) => {
        const idA = a.id ?? 0;
        const idB = b.id ?? 0;
        return idA - idB;
      }),
    [favorites]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      getDataPokemons,
      getPokemonData,
      cachePokemonsByName,
      searchPokemonByName,
      clearSearch,
      searchResult,
      isSearching,
      searchError,
      toggleFavorite,
      isFavorite,
      favoriteCount,
      favoritesList,
      showOnlyFavorites,
      toggleFavoritesFilter,
    }),
    [
      getDataPokemons,
      getPokemonData,
      cachePokemonsByName,
      searchPokemonByName,
      clearSearch,
      searchResult,
      isSearching,
      searchError,
      toggleFavorite,
      isFavorite,
      favoriteCount,
      favoritesList,
      showOnlyFavorites,
      toggleFavoritesFilter,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useContextPokemon() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

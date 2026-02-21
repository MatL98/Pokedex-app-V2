import { useContextPokemon } from "../../context/Context";
import "./FavoritesFilter.css";

export default function FavoritesFilter() {
  const { showOnlyFavorites, toggleFavoritesFilter, favoriteCount } = useContextPokemon();

  return (
    <button
      type="button"
      className={`favorites-filter ${showOnlyFavorites ? "is-active" : ""}`}
      onClick={toggleFavoritesFilter}
      aria-pressed={showOnlyFavorites}
    >
      {showOnlyFavorites ? "Mostrando favoritos" : "Mostrar favoritos"} ({favoriteCount})
    </button>
  );
}

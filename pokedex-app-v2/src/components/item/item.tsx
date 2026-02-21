import type { Pokemon } from "../../context/Context";
import { useContextPokemon } from "../../context/Context";
import FavoriteButton from "../favorites/FavoriteButton";
import "./ItemPokemon.css";

type Props = {
  pokemons: Pokemon;
  onSelect?: (pokemon: Pokemon) => void;
};

export default function ItemPokemon({ pokemons, onSelect }: Props) {
  const { toggleFavorite, isFavorite } = useContextPokemon();
  const colorsTypes = [
    { color: "#ff4423", type: "fire" },
    { color: "#41af62", type: "grass" },
    { color: "#b558b5", type: "poison" },
    { color: "#74b9ff", type: "flying" },
    { color: "#39a3ff", type: "water" },
    { color: "#9c9c27", type: "bug" },
    { color: "#a222a3", type: "psychic" },
    { color: "#c6af3f", type: "ground" },
    { color: "#ff8ac7", type: "fairy" },
    { color: "#a1220a", type: "fighting" },
    { color: "#897668", type: "rock" },
    { color: "#dbd72f", type: "electric" },
    { color: "#b2b1a1", type: "steel" },
    { color: "#8254a6", type: "ghost" },
    { color: "#b3edfa", type: "ice" },
    { color: "#6b7280", type: "normal" },
    { color: "#303030", type: "dark" },
    { color: "#3333ba", type: "dragon" },
  ];

  const getColorOfType = (type: string) => {
    const color = colorsTypes.find((item) => item.type === type);
    return color ? color.color : "none";
  };

  return (
    <div
      className="cardItem"
      onClick={() => onSelect?.(pokemons)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(pokemons);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${pokemons.name}`}
    >
      <div className="pokeInfo">
        <div
          className="cardItem-favorite"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <FavoriteButton
            active={isFavorite(pokemons)}
            onToggle={() => toggleFavorite(pokemons)}
          />
        </div>
        <span>#{pokemons.id}</span>
        <img src={pokemons.sprites?.front_default ?? ""} alt={pokemons.name} />
        <h1>{pokemons.name}</h1>
        <div className="pokemomnType">
          {pokemons.types.map((typeItem) => (
            <div
              className="divPokemonType"
              style={{ backgroundColor: getColorOfType(typeItem.type.name) }}
              key={`${pokemons.id}-${typeItem.type.name}`}
            >
              {typeItem.type.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

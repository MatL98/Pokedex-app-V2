import { useEffect } from "react";
import type { CSSProperties } from "react";
import type { Pokemon } from "../../context/Context";
import { useContextPokemon } from "../../context/Context";
import FavoriteButton from "../favorites/FavoriteButton";
import "./PokemonModal.css";

type Props = {
  pokemon: Pokemon | null;
  isOpen: boolean;
  onClose: () => void;
};

const TYPE_COLORS: Record<string, string> = {
  fire: "#ff4423",
  grass: "#41af62",
  poison: "#b558b5",
  flying: "#74b9ff",
  water: "#39a3ff",
  bug: "#9c9c27",
  psychic: "#a222a3",
  ground: "#c6af3f",
  fairy: "#ff8ac7",
  fighting: "#a1220a",
  rock: "#897668",
  electric: "#dbd72f",
  steel: "#9ca3af",
  ghost: "#8254a6",
  ice: "#7dd3fc",
  normal: "#6b7280",
  dark: "#303030",
  dragon: "#3333ba",
};

const DEFAULT_TYPE_COLOR = "#3b82f6";
const formatStatName = (name: string) => name.replace("-", " ");
const formatDecimeterToMeter = (value?: number) =>
  typeof value === "number" ? (value / 10).toFixed(1).replace(".", ",") : "-";
const formatHectogramToKg = (value?: number) =>
  typeof value === "number" ? (value / 10).toFixed(1).replace(".", ",") : "-";

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(59, 130, 246, ${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getTypeColor = (typeName?: string) =>
  typeName ? TYPE_COLORS[typeName] ?? DEFAULT_TYPE_COLOR : DEFAULT_TYPE_COLOR;

export default function PokemonModal({ pokemon, isOpen, onClose }: Props) {
  const { toggleFavorite, isFavorite } = useContextPokemon();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pokemon) return null;

  const primaryType = pokemon.types?.[0]?.type.name;
  const secondaryType = pokemon.types?.[1]?.type.name;
  const primaryColor = getTypeColor(primaryType);
  const secondaryColor = getTypeColor(secondaryType ?? primaryType);

  const overlayStyle = {
    "--overlay-tint": hexToRgba(primaryColor, 0.24),
  } as CSSProperties;

  const modalStyle = {
    "--type-primary": primaryColor,
    "--type-secondary": secondaryColor,
    "--type-primary-soft": hexToRgba(primaryColor, 0.14),
    "--type-secondary-soft": hexToRgba(secondaryColor, 0.16),
    "--type-accent-border": hexToRgba(secondaryColor, 0.45),
  } as CSSProperties;

  return (
    <div className="pokemon-modal-overlay" onClick={onClose} style={overlayStyle}>
      <div className="pokemon-modal" onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <button className="pokemon-modal-close" onClick={onClose} type="button">
          x
        </button>

        <div className="pokemon-modal-header">
          <img src={pokemon.sprites?.front_default ?? ""} alt={pokemon.name} />
          <div>
            <p className="pokemon-modal-id">#{pokemon.id}</p>
            <h2>{pokemon.name}</h2>
            <div className="pokemon-modal-favorite">
              <FavoriteButton
                active={isFavorite(pokemon)}
                onToggle={() => toggleFavorite(pokemon)}
              />
            </div>
            <div className="pokemon-modal-types">
              {(pokemon.types ?? []).map((typeItem) => (
                <span
                  style={{ backgroundColor: getTypeColor(typeItem.type.name) }}
                  key={typeItem.type.name}
                >
                  {typeItem.type.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pokemon-modal-grid">
          <div className="pokemon-modal-card">
            <h3>Datos</h3>
            <p>Altura: {formatDecimeterToMeter(pokemon.height)} m</p>
            <p>Peso: {formatHectogramToKg(pokemon.weight)} kg</p>
            <p>Experiencia base: {pokemon.base_experience ?? "-"}</p>
          </div>

          <div className="pokemon-modal-card">
            <h3>Habilidades</h3>
            <ul>
              {(pokemon.abilities ?? []).map((ability) => (
                <li key={ability.ability.name}>{ability.ability.name}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pokemon-modal-stats">
          <h3>Stats</h3>
          <div className="pokemon-modal-stat-list">
            {(pokemon.stats ?? []).map((stat) => {
              const statPercent = Math.min((stat.base_stat / 180) * 100, 100);
              return (
                <div className="pokemon-modal-stat-row" key={stat.stat.name}>
                  <div className="pokemon-modal-stat-meta">
                    <span>{formatStatName(stat.stat.name)}</span>
                    <strong>{stat.base_stat}</strong>
                  </div>
                  <div className="pokemon-modal-stat-track">
                    <div
                      className="pokemon-modal-stat-fill"
                      style={{ width: `${statPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

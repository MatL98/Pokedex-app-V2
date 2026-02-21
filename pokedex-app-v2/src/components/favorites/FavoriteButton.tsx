import "./FavoriteButton.css";

type Props = {
  active: boolean;
  onToggle: () => void;
  className?: string;
};

export default function FavoriteButton({ active, onToggle, className = "" }: Props) {
  return (
    <button
      type="button"
      className={`favorite-button ${active ? "is-active" : ""} ${className}`.trim()}
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      {active ? "🤍" : "🩶"}
    </button>
  );
}

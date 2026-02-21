import { SearchBar } from '../searchBar/SearchBar'
import FavoritesFilter from '../favorites/FavoritesFilter'
import './header.css'

export const Header = () => {
    return (
        <header className="main-header">
            <div className="main-header-content">
                <div className="main-header-text">
                    <p className="main-header-kicker">Pokemon Explorer</p>
                    <h1 className="main-header-title">Pokedex App V2</h1>
                </div>
                <div className="main-header-actions">
                    <SearchBar />
                    <FavoritesFilter />
                </div>
            </div>
        </header>
    )
}

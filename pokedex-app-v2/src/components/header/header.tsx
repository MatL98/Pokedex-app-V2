import { SearchBar } from '../searchBar/SearchBar'
import './header.css'

export const Header = () => {
    return (
        <>
            <div className="main-header">
                <h1 className="main-header-title">Pokedex-app-V2</h1>
                <SearchBar></SearchBar>
            </div>
            
        </>
    )
}
import './ItemPokemon.css';

export default function ItemPokemon (pokemons) {
    const pokes = pokemons.pokemons;

    const colorsTypes = [
        {color: 'red', type: 'fire'},
        {color: 'green', type: 'grass'},
        {color: '#b558b5', type: 'poison'},
        {color: 'lightblue', type: 'flying'},
        {color: '#39a3ff', type: 'water'},
        {color: '#9c9c27', type: 'bug'},
        {color: '#a222a3', type: 'psychic'},
        {color: '#c6af3f', type: 'ground'},
        {color: 'pink', type: 'fairy'},
        {color: '#a1220a', type: 'fighting'},
        {color: '#897668', type: 'rock'},
        {color: '#dbd72f', type: 'electric'},
        {color: '#b2b1a1', type: 'steel'},
        {color: '#ac6acc', type: 'ghost'},
        {color: '#b3edfa', type: 'ice'},
        {color: 'gray', type: 'normal'},
        {color: '#303030', type: 'dark'},
        {color: '#3333ba', type: 'dragon'},
    ]

    const getColorOfType = (type) => {
        const color =  colorsTypes.find((item) => item.type == type)
        return color ? color.color : 'none'
    }

    return(
        <div className="cardItem">
            <div className="pokeInfo">
                <span>#{pokes.id}</span>
                <img src={pokes.sprites?.front_default}/>
                <h1>{pokes.name}</h1>
                <div className="pokemomnType">
                    {pokes.types.map((t)=>{
                        return <div className='divPokemonType' style={{backgroundColor: getColorOfType(t.type.name)}}>{t.type.name}</div>
                    })}
                </div>
            </div>
        </div>
    )
}


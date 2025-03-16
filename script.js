const apiURL = 'https://pokeapi.co/api/v2/pokemon/';

const searchInput = document.getElementById('search');
const pokedexContainer = document.getElementById('pokedex');
const searchButton = document.getElementById('searchButton');
const typeSelect = document.getElementById('typeSelect');
const typeButton = document.getElementById('typeButton');
const allButton = document.getElementById('allButton');
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');
const paginationDiv = document.getElementById('pagination');

let currentPage = 0;
let currentList = [];
const pageSize = 20;

function showError(message) {
    pokedexContainer.innerHTML = `<p>${message}</p>`;
    paginationDiv.style.display = 'none';
}

function showPokemon(pokemon) {
    const name = pokemon.name.toUpperCase();
    const image = pokemon.sprites.front_default;
    const number = pokemon.id;
    const height = pokemon.height / 10;
    const weight = pokemon.weight / 10;

    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
        <h2>${name}</h2>
        <img src="${image}" alt="${name}">
        <p>Número: ${number}</p>
        <p>Altura: ${height} m</p>
        <p>Peso: ${weight} kg</p>
    `;
    pokedexContainer.appendChild(card);
}

async function searchPokemon() {
    const pokemonName = searchInput.value.toLowerCase();

    try {
        const response = await fetch(apiURL + pokemonName);
        if (!response.ok) {
            showError(`No se encontró el Pokémon "${pokemonName}"`);
            return;
        }

        const data = await response.json();
        pokedexContainer.innerHTML = '';
        showPokemon(data);
        paginationDiv.style.display = 'none'; // Oculta paginación en búsqueda individual
    } catch (error) {
        showError('Ocurrió un error al buscar el Pokémon.');
    }
}

async function loadTypes() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/type');
        const data = await response.json();
        data.results.forEach(type => {
            const option = document.createElement('option');
            option.value = type.name;
            option.textContent = type.name;
            typeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar los tipos.');
    }
}

async function showPage(page) {
    pokedexContainer.innerHTML = '';
    const start = page * pageSize;
    const end = start + pageSize;
    const pageList = currentList.slice(start, end);

    for (const item of pageList) {
        const response = await fetch(item.url || item.pokemon.url);
        const data = await response.json();
        showPokemon(data);
    }
}

typeButton.addEventListener('click', async () => {
    const selectedType = typeSelect.value;
    pokedexContainer.innerHTML = '';
    currentPage = 0;

    if (!selectedType) {
        showError('Selecciona un tipo primero.');
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        const data = await response.json();
        const promises = data.pokemon.map(p => fetch(p.pokemon.url).then(res => res.json()));
        const pokemonData = await Promise.all(promises);

        pokemonData.sort((a, b) => a.id - b.id);
        currentList = pokemonData.map(p => ({ url: `${apiURL}${p.id}` }));
        paginationDiv.style.display = 'block';
        showPage(currentPage);
    } catch (error) {
        showError('Error al cargar los Pokémon por tipo.');
    }
});

allButton.addEventListener('click', async () => {
    pokedexContainer.innerHTML = '';
    currentPage = 0;

    try {
        const response = await fetch(`${apiURL}?limit=2000`);
        const data = await response.json();

        const promises = data.results.map(p => fetch(p.url).then(res => res.json()));
        const pokemonData = await Promise.all(promises);

        pokemonData.sort((a, b) => a.id - b.id);
        currentList = pokemonData.map(p => ({ url: `${apiURL}${p.id}` }));
        paginationDiv.style.display = 'block';
        showPage(currentPage);
    } catch (error) {
        showError('Error al cargar la Pokédex.');
    }
});

prevButton.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        showPage(currentPage);
    }
});

nextButton.addEventListener('click', () => {
    const maxPages = Math.ceil(currentList.length / pageSize);
    if (currentPage < maxPages - 1) {
        currentPage++;
        showPage(currentPage);
    }
});

searchButton.addEventListener('click', searchPokemon);

loadTypes();

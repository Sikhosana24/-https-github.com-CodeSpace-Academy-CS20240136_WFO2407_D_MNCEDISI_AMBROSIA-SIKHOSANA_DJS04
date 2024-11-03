import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// State management
let page = 1;
let matches = books;

// Utility function to create for the book preview 
function createBookPreview({ author, id, image, title }) {
    const element = document.createElement('button');
    element.classList.add('preview');
    element.setAttribute('data-preview', id);
    element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return element;
}

// Function to give book previews
function renderBookPreviews(booksToRender) {
    const fragment = document.createDocumentFragment();
    booksToRender.slice(0, BOOKS_PER_PAGE).forEach(book => {
        fragment.appendChild(createBookPreview(book));
    });
    document.querySelector('[data-list-items]').innerHTML = '';
    document.querySelector('[data-list-items]').appendChild(fragment);
}

// Function to give the genre options
function renderGenreOptions() {
    const fragment = document.createDocumentFragment();
    const firstGenreElement = document.createElement('option');
    firstGenreElement.value = 'any';
    firstGenreElement.innerText = 'All Genres';
    fragment.appendChild(firstGenreElement);

    Object.entries(genres).forEach(([id, name]) => {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    });

    document.querySelector('[data-search-genres]').appendChild(fragment);
}

// Function to offer author options
function renderAuthorOptions() {
    const fragment = document.createDocumentFragment();
    const firstAuthorElement = document.createElement('option');
    firstAuthorElement.value = 'any';
    firstAuthorElement.innerText = 'All Authors';
    fragment.appendChild(firstAuthorElement);

    Object.entries(authors).forEach(([id, name]) => {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    });

    document.querySelector('[data-search-authors]').appendChild(fragment);
}

// Function to update the theme based on the user preference
function updateTheme(theme) {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}

// Event listeners
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    updateTheme(theme);
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return titleMatch && authorMatch && genreMatch;
    });

    page = 1;
    matches = result;
    renderBookPreviews(result);

    document.querySelector('[data-list-message]').classList.toggle('list__message_show', result.length < 1);
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1;
    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment();
    matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE).forEach(book => {
        fragment.appendChild(createBookPreview(book));
    });
    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
});

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const previewId = event.target.closest('[data-preview]')?.dataset?.preview;
    if (previewId) {
        const activeBook = books.find(book => book.id === previewId);
        if (activeBook) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = activeBook.image;
            document.querySelector('[data-list-image]').src = activeBook.image;
            document.querySelector('[data-list-title]').innerText = activeBook.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = activeBook.description;
        }
    }
});

// Initialise the application
function init() {
    renderBookPreviews(matches);
    renderGenreOptions();
    renderAuthorOptions();
    updateTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
    
    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `;
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1;
}

init();
// Import necessary data
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Define a Web Component for the book preview
class BookPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['data-id', 'data-image', 'data-title', 'data-author'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-id') this.id = newValue;
        if (name === 'data-image') this.image = newValue;
        if (name === 'data-title') this.title = newValue;
        if (name === 'data-author') this.author = newValue;
        this.render();
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector('button').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('preview-click', {
                detail: { id: this.id },
                bubbles: true,
                composed: true
            }));
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .preview {
                    display: flex;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .preview:hover {
                    transform: scale(1.05);
                }
                .preview__image {
                    width: 100px;
                    height: 150px;
                    object-fit: cover;
                }
                .preview__info {
                    padding: 10px;
                }
                .preview__title {
                    font-size: 16px;
                    font-weight: bold;
                }
                .preview__author {
                    font-size: 14px;
                    color: #666;
                }
            </style>
            <button class="preview">
                <img class="preview__image" src="${this.image}" />
                <div class="preview__info">
                    <h3 class="preview__title">${this.title}</h3>
                    <div class="preview__author">${authors[this.author]}</div>
                </div>
            </button>
        `;
    }
}

// Register the BookPreview Web Component
customElements.define('book-preview', BookPreview);

// State management
let page = 1;
let matches = books;

// Function to render book previews
function renderBookPreviews(booksToRender) {
    const fragment = document.createDocumentFragment();
    booksToRender.slice(0, BOOKS_PER_PAGE).forEach(book => {
        const preview = document.createElement('book-preview');
        preview.setAttribute('data-id', book.id);
        preview.setAttribute('data-image', book.image);
        preview.setAttribute('data-title', book.title);
        preview.setAttribute('data-author', book.author);
        fragment.appendChild(preview);
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
        const preview = document.createElement('book-preview');
        preview.setAttribute('data-id', book.id);
        preview.setAttribute('data-image', book.image);
        preview.setAttribute('data-title', book.title);
        preview.setAttribute('data-author', book.author);
        fragment.appendChild(preview);
    });
    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
});

document.querySelector('[data-list-items]').addEventListener('preview-click', (event) => {
    const previewId = event.detail.id;
    const activeBook = books.find(book => book.id === previewId);
    if (activeBook) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = activeBook.image;
        document.querySelector('[data-list-image]').src = activeBook.image;
        document.querySelector('[data-list-title]').innerText = activeBook.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = activeBook.description;
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
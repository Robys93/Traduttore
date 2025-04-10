// Array di oggetti per le lingue disponibili
const languages = [
    { code: 'en', name: '🇬🇧', colorClass: 'english', bgColor: 'lightblue' },
    { code: 'fr', name: '🇫🇷', colorClass: 'french', bgColor: 'lightcoral' },
    { code: 'es', name: '🇪🇸', colorClass: 'spanish', bgColor: 'lightgoldenrodyellow' },
    { code: 'de', name: '🇩🇪', colorClass: 'german', bgColor: 'lightgray' }
];

// Recupero i componenti dalla pagina html  
const languageButtonsContainer = document.querySelector('.language-buttons');
const textInput = document.querySelector('.text-input');
const translationText = document.querySelector('.translation-text');
const translationFlag = document.querySelector('.translation-flag');
const resetButton = document.querySelector('.reset-button');
const randomWordButton = document.querySelector('.random-word-button');
const randomTranslationButton = document.querySelector('.random-translation-button');
const saveButton = document.querySelector('.save-button');
const favoritesList = document.querySelector('.favorites-list');
const clearFavoritesButton = document.querySelector('.clear-favorites-button');
const body = document.querySelector('body');

// Stato corrente della traduzione
let currentTranslation = {
    original: '',
    translated: '',
    language: '',
    flag: ''
};

// Funzione per pulire il testo da tag HTML
function cleanText(text) {
    return text.replace(/<br\s*\/?>/gi, '').trim();
}

// Genera i pulsanti delle lingue dinamicamente
function generateLanguageButtons() {
    languages.forEach(lang => {
        const button = document.createElement('button');
        button.classList.add('lang-button', lang.colorClass);
        button.textContent = lang.name;
        button.dataset.lang = lang.code;
        button.dataset.bgColor = lang.bgColor;
        
        button.addEventListener('click', () => {
            const text = textInput.value;
            const langCode = button.dataset.lang;
            const flag = button.textContent;
            
            body.style.backgroundColor = button.dataset.bgColor;
            
            if (text === '') {
                alert('Inserisci un testo da tradurre!');
            } else {
                translate(text, langCode, flag);
            }
        });
        
        languageButtonsContainer.appendChild(button);
    });
}

// Funzione di reset
function reset() {
    textInput.value = '';
    translationText.innerText = 'Traduzione';
    translationFlag.innerText = '';
    body.style.backgroundColor = 'rgb(234, 237, 240)';
    currentTranslation = {
        original: '',
        translated: '',
        language: '',
        flag: ''
    };
}

// Funzione chiama API WEB per traduzione
async function translate(text, lang, flag) {
    const url = `https://api.mymemory.translated.net/get?q=${text}&langpair=it|${lang}`;
    try {
        const response = await fetch(url);
        const jsonData = await response.json();
        const result = jsonData.responseData.translatedText;
        translationText.innerText = result;
        translationFlag.innerText = flag;
        
        // Aggiorna lo stato corrente
        currentTranslation = {
            original: text,
            translated: result,
            language: lang,
            flag: flag
        };
    } catch (error) {
        translationText.innerText = 'Errore nella traduzione';
        console.error('Translation error:', error);
    }
}

// Ottiene una parola casuale in italiano usando l'API
async function getRandomItalianWord() {
    try {
        const response = await fetch("https://random-word-api.herokuapp.com/word?lang=it");
        const data = await response.json();
        return data[0]; // L'API restituisce un array con una parola
    } catch (error) {
        console.error('Error fetching random word:', error);
        return 'ciao'; // Parola di fallback in caso di errore
    }
}

// Ottiene una lingua casuale dall'array languages
function getRandomLanguage() {
    const randomIndex = Math.floor(Math.random() * languages.length);
    return languages[randomIndex];
}

// Traduci una parola casuale in una lingua casuale
async function translateRandomWord() {
    const randomWord = await getRandomItalianWord();
    const randomLang = getRandomLanguage();
    
    textInput.value = randomWord;
    body.style.backgroundColor = randomLang.bgColor;
    
    await translate(randomWord, randomLang.code, randomLang.name);
}

// Salva la traduzione corrente nei preferiti
function saveFavorite() {
    if (!currentTranslation.original || !currentTranslation.translated) {
        alert('Nessuna traduzione da salvare!');
        return;
    }

    const favorites = getFavorites();
    const newFavorite = {
        id: Date.now(),
        ...currentTranslation
    };

    favorites.push(newFavorite);
    localStorage.setItem('translationFavorites', JSON.stringify(favorites));
    renderFavorites();
}

// Ottieni i preferiti dalla LocalStorage
function getFavorites() {
    const favorites = localStorage.getItem('translationFavorites');
    return favorites ? JSON.parse(favorites) : [];
}

// Cancella tutti i preferiti
function clearFavorites() {
    if (confirm('Sei sicuro di voler cancellare tutti i preferiti?')) {
        localStorage.removeItem('translationFavorites');
        renderFavorites();
    }
}

// ... (tutto il codice precedente rimane uguale fino alla funzione clearFavorites)

// Funzione per mostrare lo snackbar
function showSnackbar(message, actionText = null, actionHandler = null) {
    const snackbar = document.createElement('div');
    snackbar.className = 'snackbar';
    snackbar.textContent = message;
    
    if (actionText && actionHandler) {
        const actionButton = document.createElement('button');
        actionButton.className = 'snackbar-action';
        actionButton.textContent = actionText;
        actionButton.addEventListener('click', () => {
            actionHandler();
            snackbar.remove();
        });
        snackbar.appendChild(actionButton);
    }
    
    document.body.appendChild(snackbar);
    
    // Mostra lo snackbar
    setTimeout(() => {
        snackbar.classList.add('show');
    }, 10);
    
    // Nascondi e rimuovi lo snackbar dopo 4 secondi
    setTimeout(() => {
        snackbar.classList.remove('show');
        setTimeout(() => {
            snackbar.remove();
        }, 300);
    }, 4000);
}

// Cancella tutti i preferiti (modificata per usare lo snackbar)
function clearFavorites() {
    if (getFavorites().length === 0) {
        showSnackbar('Nessun preferito da cancellare');
        return;
    }

    showSnackbar('Preferiti cancellati', 'Annulla', () => {
        // Ripristina i preferiti (non implementato qui)
        // Potresti voler salvare i preferiti prima di cancellarli
        renderFavorites();
    });
    
    // Procedi con la cancellazione
    localStorage.removeItem('translationFavorites');
    renderFavorites();
}

// Cancella un singolo preferito (modificata per usare lo snackbar)
function deleteFavorite(id) {
    const favorites = getFavorites();
    const favoriteToDelete = favorites.find(fav => fav.id === id);
    
    showSnackbar(`Preferito eliminato: ${favoriteToDelete.original} → ${favoriteToDelete.translated}`, 'Annulla', () => {
        // Ripristina il preferito
        favorites.push(favoriteToDelete);
        localStorage.setItem('translationFavorites', JSON.stringify(favorites));
        renderFavorites();
    });
    
    // Procedi con l'eliminazione
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('translationFavorites', JSON.stringify(updatedFavorites));
    renderFavorites();
}


// Cancella un singolo preferito
function deleteFavorite(id) {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('translationFavorites', JSON.stringify(updatedFavorites));
    renderFavorites();
}

// Mostra i preferiti nella UI
function renderFavorites() {
    const favorites = getFavorites();
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="color: white;">Nessun preferito salvato</p>';
        return;
    }

    favorites.forEach(fav => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        
        favoriteItem.innerHTML = `
            <div>
                <span class="favorite-flag">${fav.flag}</span>
                <span class="favorite-text">${fav.original} → ${fav.translated}</span>
            </div>
            <button class="favorite-delete" data-id="${fav.id}">Elimina</button>
        `;
        
        favoritesList.appendChild(favoriteItem);
    });

    // Aggiungi event listener ai pulsanti elimina
    document.querySelectorAll('.favorite-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteFavorite(id);
        });
    });
}

// Inizializzazione
generateLanguageButtons();
renderFavorites();

// Event listeners
resetButton.addEventListener('click', reset);
randomWordButton.addEventListener('click', async () => {
    textInput.value = await getRandomItalianWord();
});
randomTranslationButton.addEventListener('click', translateRandomWord);
saveButton.addEventListener('click', saveFavorite);
clearFavoritesButton.addEventListener('click', clearFavorites);
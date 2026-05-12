const STORAGE_KEY = "kingscan_mangas";

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `manga-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const defaultMangas = [
  {
    id: createId(),
    title: "Coroa da Meia-Noite",
    genre: "Acao",
    status: "Em lancamento",
    chapters: 42,
    cover: "../users/images/outro-2.jpeg",
    description: "Um herdeiro sem reino enfrenta guildas, monstros e uma coroa que escolhe seu proprio dono."
  },
  {
    id: createId(),
    title: "A Flor do Norte",
    genre: "Romance",
    status: "Em lancamento",
    chapters: 18,
    cover: "../users/images/outro-2.jpeg",
    description: "Uma curandeira descobre cartas antigas que podem mudar o destino de duas familias rivais."
  },
  {
    id: createId(),
    title: "Zero Absoluto",
    genre: "Fantasia",
    status: "Completo",
    chapters: 76,
    cover: "../users/images/outro-2.jpeg",
    description: "Depois de acordar em uma cidade congelada, Kai precisa vencer provas para recuperar suas memorias."
  },
  {
    id: createId(),
    title: "Linha Vermelha",
    genre: "Drama",
    status: "Pausado",
    chapters: 25,
    cover: "../users/images/outro-2.jpeg",
    description: "Investigadores seguem pistas de uma organizacao secreta que controla o submundo da capital."
  }
];

let mangas = loadMangas();
let selectedMangaId = mangas[0]?.id;
let currentPage = 1;

const mangaGrid = document.querySelector("#mangaGrid");
const releaseList = document.querySelector("#releaseList");
const genreFilter = document.querySelector("#genreFilter");
const searchInput = document.querySelector("#searchInput");
const readerTitle = document.querySelector("#readerTitle");
const readerDescription = document.querySelector("#readerDescription");
const readerMeta = document.querySelector("#readerMeta");
const pageFrame = document.querySelector("#pageFrame");
const pageCounter = document.querySelector("#pageCounter");
const mangaForm = document.querySelector("#mangaForm");

function loadMangas() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultMangas;
}

function saveMangas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mangas));
}

function renderAll() {
  renderGenres();
  renderCatalog();
  renderReleases();
  renderReader();
}

function renderGenres() {
  const active = genreFilter.value || "todos";
  const genres = [...new Set(mangas.map((manga) => manga.genre))].sort();
  genreFilter.innerHTML = '<option value="todos">Todos</option>';
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.append(option);
  });
  genreFilter.value = genres.includes(active) ? active : "todos";
}

function renderCatalog() {
  const search = searchInput.value.trim().toLowerCase();
  const genre = genreFilter.value;
  const filtered = mangas.filter((manga) => {
    const matchesSearch = manga.title.toLowerCase().includes(search) || manga.description.toLowerCase().includes(search);
    const matchesGenre = genre === "todos" || manga.genre === genre;
    return matchesSearch && matchesGenre;
  });

  mangaGrid.innerHTML = "";
  filtered.forEach((manga) => {
    const card = document.createElement("article");
    card.className = "manga-card";
    card.innerHTML = `
      <div class="manga-cover">
        <img src="${manga.cover || "../users/images/outro-2.jpeg"}" alt="Capa de ${manga.title}">
        <span class="status-pill">${manga.status}</span>
      </div>
      <div class="manga-body">
        <h3>${manga.title}</h3>
        <p>${manga.description}</p>
        <div class="card-actions">
          <button class="button primary" type="button" data-action="read" data-id="${manga.id}">Ler</button>
          <button class="icon-button" type="button" data-action="edit" data-id="${manga.id}" aria-label="Editar ${manga.title}" title="Editar">E</button>
          <button class="icon-button" type="button" data-action="delete" data-id="${manga.id}" aria-label="Excluir ${manga.title}" title="Excluir">X</button>
        </div>
      </div>
    `;
    mangaGrid.append(card);
  });
}

function renderReleases() {
  releaseList.innerHTML = "";
  mangas.slice(0, 3).forEach((manga) => {
    const item = document.createElement("article");
    item.className = "release-item";
    item.innerHTML = `
      <div>
        <strong>${manga.title}</strong>
        <span>Capitulo ${manga.chapters} publicado</span>
      </div>
      <button class="button ghost" type="button" data-action="read" data-id="${manga.id}">Abrir</button>
    `;
    releaseList.append(item);
  });
}

function renderReader() {
  const manga = mangas.find((item) => item.id === selectedMangaId) || mangas[0];
  if (!manga) return;

  selectedMangaId = manga.id;
  readerTitle.textContent = manga.title;
  readerDescription.textContent = manga.description;
  readerMeta.innerHTML = `
    <span>${manga.genre}</span>
    <span>${manga.status}</span>
    <span>${manga.chapters} capitulos</span>
  `;
  pageCounter.textContent = `Pagina ${currentPage}/3`;
  pageFrame.innerHTML = `
    <div class="page-art">
      <div>
        <h3>${manga.title}</h3>
        <p>Capitulo ${manga.chapters}</p>
        <strong>Pagina ${currentPage}</strong>
      </div>
    </div>
  `;
}

function fillForm(manga) {
  document.querySelector("#mangaId").value = manga.id;
  document.querySelector("#titleInput").value = manga.title;
  document.querySelector("#genreInput").value = manga.genre;
  document.querySelector("#statusInput").value = manga.status;
  document.querySelector("#coverInput").value = manga.cover;
  document.querySelector("#descriptionInput").value = manga.description;
  document.querySelector("#admin").scrollIntoView({ behavior: "smooth" });
}

function clearForm() {
  mangaForm.reset();
  document.querySelector("#mangaId").value = "";
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  if (action === "read") {
    selectedMangaId = id;
    currentPage = 1;
    renderReader();
    document.querySelector("#leitor").scrollIntoView({ behavior: "smooth" });
  }

  if (action === "edit") {
    const manga = mangas.find((item) => item.id === id);
    if (manga) fillForm(manga);
  }

  if (action === "delete") {
    mangas = mangas.filter((item) => item.id !== id);
    selectedMangaId = mangas[0]?.id;
    saveMangas();
    renderAll();
  }
});

document.querySelector("#prevPage").addEventListener("click", () => {
  currentPage = currentPage === 1 ? 3 : currentPage - 1;
  renderReader();
});

document.querySelector("#nextPage").addEventListener("click", () => {
  currentPage = currentPage === 3 ? 1 : currentPage + 1;
  renderReader();
});

document.querySelector("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

document.querySelector("#seedButton").addEventListener("click", () => {
  mangas = defaultMangas.map((manga) => ({ ...manga, id: createId() }));
  selectedMangaId = mangas[0].id;
  currentPage = 1;
  saveMangas();
  clearForm();
  renderAll();
});

document.querySelector("#clearForm").addEventListener("click", clearForm);
searchInput.addEventListener("input", renderCatalog);
genreFilter.addEventListener("change", renderCatalog);

mangaForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = document.querySelector("#mangaId").value || createId();
  const existing = mangas.findIndex((manga) => manga.id === id);
  const manga = {
    id,
    title: document.querySelector("#titleInput").value.trim(),
    genre: document.querySelector("#genreInput").value.trim(),
    status: document.querySelector("#statusInput").value,
    cover: document.querySelector("#coverInput").value.trim() || "../users/images/outro-2.jpeg",
    description: document.querySelector("#descriptionInput").value.trim(),
    chapters: existing >= 0 ? mangas[existing].chapters : 1
  };

  if (existing >= 0) {
    mangas[existing] = manga;
  } else {
    mangas.unshift(manga);
  }

  selectedMangaId = manga.id;
  saveMangas();
  clearForm();
  renderAll();
});

renderAll();

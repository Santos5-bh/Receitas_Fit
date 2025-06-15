// app.js

// 1) URL do JSON‐Server
const API = 'http://localhost:3000/receitas';

// 2) Elementos do DOM
const container   = document.getElementById('receitas');
const searchInput = document.getElementById('searchInput');
const searchBtn   = document.getElementById('searchBtn');
const userGreeting = document.getElementById('userGreeting');

// 3) Estado
let categorias      = [];
let currentView     = 'all';      // 'all' | 'category' | 'favorites' | 'search'
let currentCatIndex = null;

// 4) Inicialização
document.addEventListener('DOMContentLoaded', () => {
  showUserGreeting();
  fetch(API)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => {
      categorias = data;
      // expõe para botões inline
      window.filterCategory = filterCategory;
      window.showFavorites  = showFavorites;
      window.toggleFavorite = toggleFavorite;
      // eventos de busca
      searchInput.addEventListener('input', onSearch);
      searchBtn.addEventListener('click', onSearch);
      // mostra tudo ao carregar
      showAll();
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p class="text-danger">Não foi possível carregar as receitas.</p>`;
    });
});

// 5) Exibe o nome do usuário logado na navbar
function showUserGreeting() {
  const raw = localStorage.getItem('usuarioLogado');
  if (!raw) return;
  const user = JSON.parse(raw);
  if (!user.username) return;
  userGreeting.textContent = `Olá, ${user.username}`;
}

// 6) Exibe todas as receitas
function showAll() {
  currentView = 'all';
  currentCatIndex = null;
  clearSearch();
  renderRecipes(flattenAll());
}

// 7) Filtra por categoria (índice numérico ou id string)
function filterCategory(catKey) {
  currentView = 'category';
  clearSearch();
  let idx = typeof catKey === 'number'
    ? catKey
    : categorias.findIndex(c => String(c.id) === String(catKey));
  if (idx < 0 || !categorias[idx]) {
    container.innerHTML = `<p class="text-danger">Categoria não encontrada.</p>`;
    return;
  }
  currentCatIndex = idx;
  const lista = (categorias[idx].lista || []).map(item => ({
    ...item,
    catIdx: idx,
    catNome: categorias[idx].nome
  }));
  renderRecipes(lista);
}

// 8) Exibe só os favoritos do usuário corrente
function showFavorites() {
  currentView = 'favorites';
  currentCatIndex = null;
  clearSearch();
  const fav = JSON.parse(localStorage.getItem(storageKey()) || '[]');
  const itens = [];
  fav.forEach(key => {
    const [catIdx, id] = key.split('-').map(Number);
    const cat = categorias[catIdx];
    if (!cat) return;
    const item = (cat.lista||[]).find(r => String(r.id) === String(id));
    if (item) itens.push({ ...item, catIdx, catNome: cat.nome });
  });
  renderRecipes(itens);
}

// 9) Pesquisa por nome ou ingrediente
function onSearch() {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    // volta à visão anterior
    if (currentView === 'category') filterCategory(currentCatIndex);
    else if (currentView === 'favorites') showFavorites();
    else showAll();
    return;
  }
  currentView = 'search';
  const tudo = flattenAll();
  const filtrado = tudo.filter(item => {
    if (item.nome.toLowerCase().includes(term)) return true;
    return (item.ingredientes||[]).some(ing =>
      ing.toLowerCase().includes(term)
    );
  });
  renderRecipes(filtrado);
}

// 10) Achata todas as categorias num só array
function flattenAll() {
  return categorias.flatMap((cat, idx) =>
    (cat.lista||[]).map(item => ({
      ...item,
      catIdx: idx,
      catNome: cat.nome
    }))
  );
}

// 11) Renderiza as receitas no container
function renderRecipes(arr) {
  container.innerHTML = '';
  if (arr.length === 0) {
    container.innerHTML = `<p class="text-muted">Nenhuma receita para exibir.</p>`;
    return;
  }
  arr.forEach(item => {
    const key   = `${item.catIdx}-${item.id}`;
    const heart = isFavorite(key) ? '❤️' : '🤍';
    const art = document.createElement('article');
    art.className = 'container2';
    art.innerHTML = `
      <div class="recipe-header" style="display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">${item.nome}</h3>
        <button
          onclick="toggleFavorite(${item.catIdx}, ${item.id})"
          style="background:none;border:none;font-size:1.5em;cursor:pointer"
        >${heart}</button>
      </div>
      <a href="detalhes.html?id=${item.id}&cat=${item.catIdx}">
        <img src="${item.imagem_url}" alt="${item.nome}" style="width:100%;border-radius:8px">
      </a>
      <p>${item.descrição||''}</p>
    `;
    container.appendChild(art);
  });
}

// 12) Helpers para favoritos por usuário
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
}
function storageKey() {
  const u = getCurrentUser();
  return u && u.id
    ? `favoritos_user_${u.id}`
    : 'favoritos_guest';
}

// 13) Verifica/remova/adiciona favorito no localStorage
function isFavorite(key) {
  const fav = JSON.parse(localStorage.getItem(storageKey()) || '[]');
  return fav.includes(key);
}
function toggleFavorite(catIdx, id) {
  const key = `${catIdx}-${id}`;
  let fav   = JSON.parse(localStorage.getItem(storageKey()) || '[]');
  if (fav.includes(key)) fav = fav.filter(k => k !== key);
  else fav.push(key);
  localStorage.setItem(storageKey(), JSON.stringify(fav));
  // re-renderiza a visão corrente
  if      (currentView === 'all')      showAll();
  else if (currentView === 'category') filterCategory(currentCatIndex);
  else if (currentView === 'favorites') showFavorites();
  else if (currentView === 'search')   onSearch();
}

// 14) Limpa campo de busca
function clearSearch() {
  searchInput.value = '';
}

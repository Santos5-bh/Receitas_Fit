// app.js

// 1) Endereço do JSON-Server
const API = 'http://localhost:3000/receitas';

// 2) Elemento onde vai aparecer tudo
const container = document.getElementById('receitas');

// 3) Guarda todas as categorias carregadas
let categorias = [];

// 4) Controla qual visão está ativa: 'all', 'category' ou 'favorites'
let currentView = 'all';
let currentCatIndex = null;

// 5) Inicialização
document.addEventListener('DOMContentLoaded', init);
function init() {
  fetch(API)
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json();
    })
    .then(data => {
      categorias = data;
      // disponibiliza as funções para os botões inline
      window.filterCategory = filterCategory;
      window.showFavorites   = showFavorites;
      window.toggleFavorite  = toggleFavorite;
      showAll();
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p class="text-danger">Não foi possível carregar as receitas.</p>`;
    });
}

// 6) Exibe todas as receitas de todas as categorias
function showAll() {
  currentView = 'all';
  currentCatIndex = null;

  // achata todas as listas, preservando índice e nome da categoria
  const tudo = categorias.flatMap((cat, idx) =>
    (cat.lista||[]).map(item => ({ ...item, catIdx: idx, catNome: cat.nome }))
  );

  renderRecipes(tudo);
}

// 7) Exibe só uma categoria
function filterCategory(catIdx) {
  currentView = 'category';
  currentCatIndex = catIdx;

  const cat = categorias[catIdx];
  if (!cat) {
    container.innerHTML = `<p class="text-danger">Categoria não encontrada.</p>`;
    return;
  }

  const lista = (cat.lista||[]).map(item => ({
    ...item,
    catIdx,
    catNome: cat.nome
  }));

  renderRecipes(lista);
}

// 8) Exibe só as favoritas
function showFavorites() {
  currentView = 'favorites';
  currentCatIndex = null;

  const favKeys = getFavorites();  // e.g. ["2-0","4-3",...]
  const favItens = [];

  favKeys.forEach(key => {
    const [catIdx, id] = key.split('-').map(Number);
    const cat = categorias[catIdx];
    if (!cat) return;
    const item = (cat.lista||[]).find(r => String(r.id) === String(id));
    if (item) favItens.push({ ...item, catIdx, catNome: cat.nome });
  });

  renderRecipes(favItens);
}

// 9) Renderiza um array de receitas no container
function renderRecipes(arr) {
  container.innerHTML = '';

  if (arr.length === 0) {
    container.innerHTML = `<p class="text-muted">Nenhuma receita para exibir.</p>`;
    return;
  }

  arr.forEach(item => {
    const key = `${item.catIdx}-${item.id}`;
    const heart = isFavorite(key) ? '❤️' : '🤍';

    const art = document.createElement('article');
    art.className = 'container2';
    art.innerHTML = `
      <div class="recipe-header" style="display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">${item.nome}</h3>
        <button
          class="btn-fav"
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

// 10) Gerencia favoritos no localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem('favoritos') || '[]');
}
function saveFavorites(arr) {
  localStorage.setItem('favoritos', JSON.stringify(arr));
}
function isFavorite(key) {
  return getFavorites().includes(key);
}

// 11) Adiciona ou remove favorito
function toggleFavorite(catIdx, id) {
  const key = `${catIdx}-${id}`;
  let fav = getFavorites();

  if (fav.includes(key)) {
    fav = fav.filter(k => k !== key);
  } else {
    fav.push(key);
  }

  saveFavorites(fav);

  // re-renderiza a visão atual para atualizar os corações
  if (currentView === 'all') showAll();
  else if (currentView === 'category') filterCategory(currentCatIndex);
  else if (currentView === 'favorites') showFavorites();
}

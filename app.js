

// 1) Endereço do JSON-Server
const API = 'http://localhost:3000/receitas';
// 2) Pega a div de destino
const container = document.getElementById('receitas');

// 3) Aqui guardamos o JSON inteiro (array de categorias)
let categorias = [];

// 4) Função de inicialização: traz tudo do /receitas e exibe "Todas"
async function init() {
  try {
    const resp = await fetch(API);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    categorias = await resp.json();
    showAll();
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-danger">Não foi possível carregar as receitas.</p>`;
  }
}

// 5) Mostra todas as categorias (chama renderCategory para cada uma)
function showAll() {
  container.innerHTML = '';
  categorias.forEach((cat, idx) => renderCategory(cat, idx));
}

// 6) Renderiza UMA categoria inteira
function renderCategory(cat, catIndex) {
  // título da categoria
  const h2 = document.createElement('h2');
  h2.textContent = cat.nome;
  container.appendChild(h2);

  // cada item da lista
  cat.lista.forEach(item => {
    const art = document.createElement('article');
    art.className = 'container2';
    art.innerHTML = `
      <h3>${item.nome}</h3>
      <a href="detalhes.html?id=${item.id}&cat=${catIndex}">
        <img src="${item.imagem_url}" alt="${item.nome}">
      </a>
      <p>${item.descrição}</p>
    `;
    container.appendChild(art);
  });
}

// 7) Exibe UMA categoria só (pode ser pelo índice numérico ou pelo id 'user')
function filterCategory(catKey) {
  console.log('clicou em categoria', catKey);
  container.innerHTML = '';

  let cat;
  if (typeof catKey === 'number') {
    cat = categorias[catKey];
  } else {
    cat = categorias.find(c => String(c.id) === String(catKey));
  }

  if (!cat) {
    container.innerHTML = `<p class="text-danger">Categoria não encontrada.</p>`;
    return;
  }

  renderCategory(cat, catKey);
}

// 8) Dispara tudo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

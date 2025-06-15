

// endpoint pra categoria “user”
const API_CAT  = 'http://localhost:3000/receitas/user'
const API_LIST = `${API_CAT}/lista`

// referências DOM
const form        = document.getElementById('formReceita')
const tabelaBody  = document.querySelector('#tabelaReceitas tbody')

// busca o objeto categoria “user” inteiro
async function getUserCategory() {
  const resp = await fetch(API_CAT)
  if (!resp.ok) throw new Error(`GET /receitas/user → HTTP ${resp.status}`)
  return resp.json() // retorna { id:"user", nome:"...", lista: [...] }
}

// recarrega a tabela com a lista atual
async function loadUserRecipes() {
  try {
    const cat = await getUserCategory()
    renderTable(cat.lista)
  } catch (err) {
    console.error(err)
    tabelaBody.innerHTML = `
      <tr>
        <td colspan="3" class="text-danger">
          Não foi possível carregar as receitas.
        </td>
      </tr>`
  }
}

// monta as linhas da tabela
function renderTable(lista) {
  tabelaBody.innerHTML = ''
  lista.forEach((r, idx) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${r.nome}</td>
      <td>${r.descrição}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteRecipe(${idx})">
          Excluir
        </button>
      </td>`
    tabelaBody.appendChild(tr)
  })
}

// trata o submit, faz GET→PATCH
async function handleSubmit(ev) {
  ev.preventDefault()

  // coleta e formata
  const nome         = form.nome.value.trim()
  const descrição    = form.descricao.value.trim()
  const ingredientes = form.ingredientes.value
    .split(';').map(s => s.trim()).filter(Boolean)
  const modo_preparo = form.modo_preparo.value
    .split(';').map(s => s.trim()).filter(Boolean)
  const imagem_url   = form.imagem_url.value.trim()

  const newRecipe = { nome, descrição, ingredientes, modo_preparo, imagem_url }

  try {
    // ) pega a categoria “user”
    const cat = await getUserCategory()

    // ) monta novo array com a receita no final
    const updatedLista = [...cat.lista, newRecipe]

    // ) dá um PATCH em /receitas/user
    const respPatch = await fetch(API_CAT, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lista: updatedLista })
    })
    if (!respPatch.ok) throw new Error(`PATCH /receitas/user → HTTP ${respPatch.status}`)

    // tudo ok
    form.reset()
    await loadUserRecipes()
    alert('Receita salva com sucesso!')
  } catch (err) {
    console.error('Erro ao salvar receita:', err)
    alert('Não foi possível salvar a receita.')
  }
}

// exclui o índice `idx` da lista e faz PATCH de volta
async function deleteRecipe(idx) {
  if (!confirm('Excluir esta receita?')) return

  try {
    const cat = await getUserCategory()
    const updated = cat.lista.filter((_, i) => i !== idx)

    const resp = await fetch(API_CAT, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lista: updated })
    })
    if (!resp.ok) throw new Error(`PATCH /receitas/user → HTTP ${resp.status}`)

    await loadUserRecipes()
  } catch (err) {
    console.error('Erro ao excluir receita:', err)
    alert('Não foi possível excluir a receita.')
  }
}



// inicializa tudo
document.addEventListener('DOMContentLoaded', () => {
  form.addEventListener('submit', handleSubmit)
  loadUserRecipes()
})

// para o botão “Excluir” funcionar no onclick inline
window.deleteRecipe = deleteRecipe



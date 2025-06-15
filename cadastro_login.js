
const API = 'http://localhost:3000/usuarios';
const form = document.getElementById('formRegister');

// DEBUG: confirma que o script foi carregado
console.log('cadastro_login.js carregado');

form.addEventListener('submit', async e => {
  e.preventDefault();

  // 1) captura dos campos
  const username        = document.getElementById('username').value.trim();
  const email           = document.getElementById('email').value.trim();
  const password        = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  console.log({ username, email, password, confirmPassword }); // DEBUG

  // 2) validação de senha igual
  if (password !== confirmPassword) {
    return alert('As senhas não conferem.');
  }

  // 3) verifica se já existe alguém com esse email
  let resp = await fetch(`${API}?email=${encodeURIComponent(email)}`);
  let users = await resp.json();
  if (users.length > 0) {
    return alert('Este e-mail já está cadastrado.');
  }

  // 4) monta o objeto do novo usuário
  const newUser = { username, email, senha: password };

  try {
    // 5) faz o POST
    resp = await fetch(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(newUser)
    });

    const criado = await resp.json();
    console.log('Usuário criado:', criado); // DEBUG

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    alert('Cadastro realizado com sucesso! Agora faça login.');
    location.href = 'login.html';

  } catch (err) {
    console.error('Erro ao cadastrar:', err);
    alert('Erro ao cadastrar. Veja o console para mais detalhes.');
  }
});

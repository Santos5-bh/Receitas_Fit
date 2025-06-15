// login.js

// Endpoint do JSON‐Server para usuários
const API = 'http://localhost:3000/usuarios';

// Seleciona o formulário pelo ID definido no HTML
const formLogin = document.getElementById('formLogin');

formLogin.addEventListener('submit', async event => {
  event.preventDefault();

  // Pega valores dos inputs pelos IDs
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;

  try {
    // Faz GET filtrando por email e senha
    const response = await fetch(
      `${API}?email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const users = await response.json();
    if (users.length === 0) {
      alert('E-mail ou senha inválidos.');
      return;
    }

    // Guarda o usuário logado no localStorage
    localStorage.setItem('usuarioLogado', JSON.stringify(users[0]));

    // Redireciona para a home
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Erro no login:', err);
    alert('Ocorreu um erro ao tentar fazer login. Tente novamente.');
  }
});

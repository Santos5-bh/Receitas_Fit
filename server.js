
const jsonServer = require('json-server');
const auth       = require('json-server-auth');
const cors       = require('cors');

const app    = jsonServer.create();
const router = jsonServer.router('db.json');

// regras de permissão 
const rules = auth.rewriter({
  users:    600,    // CRUD de usuários protegido
  receitas: 660     // leitura/escrita de receitas para usuário logado
});

app.use(cors());
app.use(rules);
app.use(auth);
app.use(router);

app.listen(3000, () => console.log('Server rodando na porta 3000'));

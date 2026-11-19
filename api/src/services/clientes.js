const db = require('../configs')

async function listar() {
  return (await db.query('SELECT id, nome, email, telefone FROM clientes ORDER BY id DESC')).rows
}

async function salvar(dados, id) {
  const valores = [dados.nome.trim(), dados.email.trim() || null, dados.telefone.trim() || null]
  const sql = id
    ? 'UPDATE clientes SET nome = $1, email = $2, telefone = $3 WHERE id = $4 RETURNING *'
    : 'INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *'
  if (id) valores.push(id)
  return (await db.query(sql, valores)).rows[0]
}

async function excluir(id) {
  return (await db.query('DELETE FROM clientes WHERE id = $1 RETURNING id', [id])).rowCount > 0
}

module.exports = { listar, salvar, excluir }

const db = require('../configs')

async function listar() {
  const resultado = await db.query(
    'SELECT id, descricao, estoque, valor FROM produtos ORDER BY id DESC',
  )
  return resultado.rows
}

async function salvar(dados, id) {
  const valores = [dados.descricao.trim(), dados.estoque, dados.valor]
  const sql = id
    ? 'UPDATE produtos SET descricao = $1, estoque = $2, valor = $3 WHERE id = $4 RETURNING *'
    : 'INSERT INTO produtos (descricao, estoque, valor) VALUES ($1, $2, $3) RETURNING *'
  if (id) valores.push(id)
  return (await db.query(sql, valores)).rows[0]
}

async function excluir(id) {
  return (await db.query('DELETE FROM produtos WHERE id = $1 RETURNING id', [id])).rowCount > 0
}

module.exports = { listar, salvar, excluir }

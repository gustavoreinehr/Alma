const db = require('../configs')

function erro(mensagem, status = 400) {
  const e = new Error(mensagem)
  e.status = status
  return e
}

async function listar() {
  const sql = `SELECT p.id, c.nome AS cliente, p.data, p.valor_total, p.status
    FROM pedidos p JOIN clientes c ON c.id = p.cliente_id ORDER BY p.id DESC`
  return (await db.query(sql)).rows
}

async function detalhes(id) {
  const pedido = await db.query('SELECT id FROM pedidos WHERE id = $1', [id])
  if (!pedido.rowCount) throw erro('Pedido não encontrado.', 404)
  const resultado = await db.query(
    `SELECT i.id, i.quantidade, i.valor_unitario, p.descricao
    FROM itens_pedido i JOIN produtos p ON p.id = i.produto_id
    WHERE i.pedido_id = $1 ORDER BY i.id`,
    [id],
  )
  return resultado.rows
}

async function criar(clienteId, itens) {
  const conexao = await db.conectar()
  try {
    await conexao.query('BEGIN')
    const cliente = await conexao.query('SELECT id FROM clientes WHERE id = $1', [clienteId])
    if (!cliente.rowCount) throw erro('Cliente não encontrado.')
    const pedido = await conexao.query(
      'INSERT INTO pedidos (cliente_id, valor_total) VALUES ($1, 0) RETURNING id',
      [clienteId],
    )
    const pedidoId = pedido.rows[0].id
    for (const item of [...itens].sort((a, b) => a.produto_id - b.produto_id)) {
      const resultado = await conexao.query(
        'SELECT id, descricao, estoque, valor FROM produtos WHERE id = $1 FOR UPDATE',
        [item.produto_id],
      )
      const produto = resultado.rows[0]
      if (!produto) throw erro('Produto não encontrado.')
      if (produto.estoque < item.quantidade)
        throw erro(`Estoque insuficiente para ${produto.descricao}.`)
      await conexao.query(
        'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, valor_unitario) VALUES ($1, $2, $3, $4)',
        [pedidoId, produto.id, item.quantidade, produto.valor],
      )
      await conexao.query('UPDATE produtos SET estoque = estoque - $1 WHERE id = $2', [
        item.quantidade,
        produto.id,
      ])
    }
    await conexao.query(
      'UPDATE pedidos SET valor_total = (SELECT SUM(quantidade * valor_unitario) FROM itens_pedido WHERE pedido_id = $1) WHERE id = $1',
      [pedidoId],
    )
    await conexao.query('COMMIT')
    return pedidoId
  } catch (e) {
    await conexao.query('ROLLBACK')
    throw e
  } finally {
    conexao.release()
  }
}

async function atualizarStatus(id, status) {
  const conexao = await db.conectar()
  try {
    await conexao.query('BEGIN')
    const resultado = await conexao.query(
      'SELECT id, status FROM pedidos WHERE id = $1 FOR UPDATE',
      [id],
    )
    const pedido = resultado.rows[0]
    if (!pedido) throw erro('Pedido não encontrado.', 404)
    if (pedido.status === 'Cancelado' && status !== 'Cancelado')
      throw erro('Pedido cancelado não pode ser reaberto.')
    if (status === 'Cancelado' && pedido.status !== 'Cancelado') {
      const itens = await conexao.query(
        'SELECT produto_id, quantidade FROM itens_pedido WHERE pedido_id = $1 ORDER BY produto_id',
        [id],
      )
      for (const item of itens.rows) {
        await conexao.query('UPDATE produtos SET estoque = estoque + $1 WHERE id = $2', [
          item.quantidade,
          item.produto_id,
        ])
      }
    }
    await conexao.query('UPDATE pedidos SET status = $1 WHERE id = $2', [status, id])
    await conexao.query('COMMIT')
  } catch (e) {
    await conexao.query('ROLLBACK')
    throw e
  } finally {
    conexao.release()
  }
}

module.exports = { listar, detalhes, criar, atualizarStatus }

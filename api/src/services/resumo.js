const db = require('../configs')

async function obter() {
  const resultado = await db.query(`SELECT
    (SELECT COUNT(*) FROM clientes)::integer AS clientes,
    (SELECT COUNT(*) FROM pedidos)::integer AS pedidos,
    COALESCE(SUM(valor_total) FILTER (WHERE status = 'Concluído'), 0) AS vendas,
    COALESCE(AVG(valor_total) FILTER (WHERE status = 'Concluído'), 0) AS ticket_medio
    FROM pedidos`)
  return resultado.rows[0]
}

module.exports = { obter }

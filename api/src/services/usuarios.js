const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../configs')

async function register({ login, senha, nome }) {
  const hash = await bcrypt.hash(senha, 10)
  const sql = 'INSERT INTO usuarios (usuario, senha_hash, nome) VALUES ($1, $2, $3) RETURNING id, usuario AS login, nome'
  const resultado = await db.query(sql, [login, hash, nome])
  return resultado.rows[0]
}

async function login({ login, senha }) {
  const resultado = await db.query('SELECT id, usuario, nome, senha_hash FROM usuarios WHERE usuario = $1', [login])
  const usuario = resultado.rows[0]
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    return null
  }

  const dados = { id: usuario.id, login: usuario.usuario, nome: usuario.nome }
  const token = jwt.sign(dados, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' })
  return { ...dados, token }
}

module.exports = { register, login }

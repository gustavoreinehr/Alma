const service = require('../services/usuarios')

async function register(req, res) {
  const { nome, login, senha } = req.body || {}
  if (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 100 ||
      typeof login !== 'string' || !login.trim() || login.trim().length > 50 ||
      typeof senha !== 'string' || senha.length < 8 || Buffer.byteLength(senha, 'utf8') > 72) {
    return res.status(400).json({ status: 'error', message: 'Informe nome, login e senha com pelo menos 8 caracteres.' })
  }
  try {
    const usuario = await service.register({ nome: nome.trim(), login: login.trim(), senha })
    return res.status(201).json({ status: 'ok', data: usuario })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ status: 'error', message: 'Login já cadastrado.' })
    }
    console.error('Erro ao cadastrar usuário:', error.message)
    return res.status(500).json({ status: 'error', message: 'Não foi possível cadastrar usuário.' })
  }
}

async function login(req, res) {
  const { login, senha } = req.body || {}
  if (typeof login !== 'string' || !login.trim() || typeof senha !== 'string' || !senha || Buffer.byteLength(senha, 'utf8') > 72) {
    return res.status(400).json({ status: 'error', message: 'Informe usuário e senha.' })
  }
  try {
    const usuario = await service.login({ login: login.trim(), senha })
    if (!usuario) {
      return res.status(401).json({ status: 'error', message: 'Usuário ou senha inválidos.' })
    }
    return res.json({ status: 'ok', data: usuario })
  } catch (error) {
    console.error('Erro ao entrar:', error.message)
    return res.status(500).json({ status: 'error', message: 'Não foi possível realizar login.' })
  }
}

function usuarioAtual(req, res) {
  return res.json({ status: 'ok', data: { id: req.user.id, login: req.user.login, nome: req.user.nome } })
}

module.exports = { register, login, usuarioAtual }

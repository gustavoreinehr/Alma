const usuarios = require('./usuarios')
const loja = require('../controllers/loja')
const { verifyUser } = require('../middlewares/auth')

module.exports = (app) => {
  usuarios(app)
  app.use(['/produtos', '/clientes', '/pedidos', '/resumo'], verifyUser)
  loja(app)
  app.use((erro, req, res, next) => {
    if (erro.code === '23503')
      return res
        .status(409)
        .json({ message: 'Registro vinculado a pedidos e não pode ser excluído.' })
    if (erro.status) return res.status(erro.status).json({ message: erro.message })
    console.error('Erro na API:', erro.message)
    res.status(500).json({ message: 'Não foi possível concluir a operação.' })
  })
}

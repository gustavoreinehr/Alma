const produtos = require('../services/produtos')
const clientes = require('../services/clientes')
const pedidos = require('../services/pedidos')
const resumo = require('../services/resumo')

function falha(mensagem, status = 400) {
  const erro = new Error(mensagem)
  erro.status = status
  return erro
}

function idValido(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0 && Number(id) <= 2147483647
}

function validarProduto(dados) {
  if (
    !dados ||
    typeof dados.descricao !== 'string' ||
    !dados.descricao.trim() ||
    dados.descricao.trim().length > 150 ||
    !Number.isInteger(Number(dados.estoque)) ||
    dados.estoque === '' ||
    dados.estoque == null ||
    Number(dados.estoque) < 0 ||
    Number(dados.estoque) > 2147483647 ||
    dados.valor === '' ||
    dados.valor == null ||
    !/^\d{1,8}(\.\d{1,2})?$/.test(String(dados.valor))
  ) {
    throw falha('Informe descrição, estoque inteiro e valor válido.')
  }
}

function validarCliente(dados) {
  if (
    !dados ||
    typeof dados.nome !== 'string' ||
    !dados.nome.trim() ||
    dados.nome.trim().length > 100 ||
    typeof dados.email !== 'string' ||
    dados.email.trim().length > 150 ||
    typeof dados.telefone !== 'string' ||
    dados.telefone.trim().length > 20
  ) {
    throw falha('Informe nome, e-mail e telefone válidos.')
  }
  if (dados.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim()))
    throw falha('Informe um e-mail válido.')
}

function rotasCadastro(app, caminho, service, validar) {
  app.get(caminho, async (req, res) => res.json({ data: await service.listar() }))
  app.post(caminho, async (req, res) => {
    validar(req.body)
    res.status(201).json({ data: await service.salvar(req.body) })
  })
  app.put(caminho + '/:id', async (req, res) => {
    if (!idValido(req.params.id)) throw falha('Código inválido.')
    validar(req.body)
    const item = await service.salvar(req.body, req.params.id)
    if (!item) throw falha('Registro não encontrado.', 404)
    res.json({ data: item })
  })
  app.delete(caminho + '/:id', async (req, res) => {
    if (!idValido(req.params.id)) throw falha('Código inválido.')
    if (!(await service.excluir(req.params.id))) throw falha('Registro não encontrado.', 404)
    res.status(204).end()
  })
}

module.exports = (app) => {
  rotasCadastro(app, '/produtos', produtos, validarProduto)
  rotasCadastro(app, '/clientes', clientes, validarCliente)
  app.get('/pedidos', async (req, res) => res.json({ data: await pedidos.listar() }))
  app.get('/pedidos/:id/itens', async (req, res) => {
    if (!idValido(req.params.id)) throw falha('Código inválido.')
    res.json({ data: await pedidos.detalhes(Number(req.params.id)) })
  })
  app.post('/pedidos', async (req, res) => {
    const { cliente_id, itens } = req.body || {}
    if (
      !idValido(cliente_id) ||
      !Array.isArray(itens) ||
      itens.length === 0 ||
      itens.length > 100 ||
      itens.some((item) => !item || !idValido(item.produto_id) || !idValido(item.quantidade)) ||
      new Set(itens.map((item) => Number(item.produto_id))).size !== itens.length
    ) {
      throw falha('Informe cliente e produtos diferentes com quantidades válidas.')
    }
    const id = await pedidos.criar(
      Number(cliente_id),
      itens.map((item) => ({
        produto_id: Number(item.produto_id),
        quantidade: Number(item.quantidade),
      })),
    )
    res.status(201).json({ data: { id } })
  })
  app.patch('/pedidos/:id/status', async (req, res) => {
    const status = req.body?.status
    if (
      !idValido(req.params.id) ||
      !['Aguardando', 'Em preparação', 'Enviado', 'Concluído', 'Cancelado'].includes(status)
    )
      throw falha('Status inválido.')
    await pedidos.atualizarStatus(Number(req.params.id), status)
    res.json({ data: { status } })
  })
  app.get('/resumo', async (req, res) => res.json({ data: await resumo.obter() }))
}

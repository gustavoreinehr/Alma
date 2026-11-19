import { api } from '../boot/axios'

async function listar(caminho) {
  return (await api.get(caminho)).data.data
}

async function salvar(caminho, dados, id) {
  const resposta = id ? await api.put(`${caminho}/${id}`, dados) : await api.post(caminho, dados)
  return resposta.data.data
}

async function excluir(caminho, id) {
  await api.delete(`${caminho}/${id}`)
}

async function criarPedido(dados) {
  return (await api.post('/pedidos', dados)).data.data
}

async function mudarStatus(id, status) {
  await api.patch(`/pedidos/${id}/status`, { status })
}

export { listar, salvar, excluir, criarPedido, mudarStatus }

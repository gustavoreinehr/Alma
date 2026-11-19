<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-title">Pedidos</h1>
      <p class="page-sub">Cada pedido, uma nova história.</p>
    </header>
    <div class="orders-toolbar">
      <input
        v-model="busca"
        class="orders-search"
        placeholder="Buscar por cliente"
        aria-label="Buscar por cliente"
      />
      <select v-model="status" class="orders-status" aria-label="Filtrar por status">
        <option>Todos</option>
        <option v-for="opcao in statusOpcoes" :key="opcao">{{ opcao }}</option>
      </select>
      <button class="btn-primary orders-new" @click="novo">Novo</button>
    </div>
    <form v-if="mostrarFormulario" class="card form-card" @submit.prevent="salvarPedido">
      <h2 class="section-title">Novo pedido</h2>
      <label class="field pedido-cliente"
        >Cliente
        <select v-model="clienteId" required>
          <option value="" disabled>Selecione cliente</option>
          <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
            {{ cliente.nome }}
          </option>
        </select>
      </label>
      <p v-if="clientes.length === 0 || produtos.length === 0" class="form-hint">
        Cadastre cliente e produto antes de criar pedido.
      </p>
      <div v-for="(item, indice) in itens" :key="indice" class="pedido-item">
        <label class="field"
          >Produto
          <select v-model="item.produto_id" required>
            <option value="" disabled>Selecione produto</option>
            <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
              {{ produto.descricao }} — {{ moeda(produto.valor) }} ({{ produto.estoque }} em
              estoque)
            </option>
          </select>
        </label>
        <label class="field"
          >Quantidade<input v-model="item.quantidade" type="number" min="1" step="1" required
        /></label>
        <button
          type="button"
          class="btn-secondary"
          :disabled="itens.length === 1"
          @click="itens.splice(indice, 1)"
        >
          Remover
        </button>
      </div>
      <button type="button" class="btn-secondary" @click="adicionarItem">Adicionar produto</button>
      <p class="form-hint">Total estimado: {{ moeda(totalEstimado()) }}</p>
      <div class="form-actions">
        <button class="btn-primary" :disabled="salvando || !clientes.length || !produtos.length">
          Salvar pedido</button
        ><button type="button" class="btn-secondary" @click="mostrarFormulario = false">
          Cancelar
        </button>
      </div>
    </form>
    <p v-if="erro" class="feedback-error" role="alert">{{ erro }}</p>
    <div class="card table-card">
      <div class="table-card-head">
        <span class="section-title">Todos os pedidos</span
        ><span class="table-count">{{ filtrarPedidos().length }} registros</span>
      </div>
      <table class="orders-table" aria-label="Lista de pedidos">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Itens</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pedido in filtrarPedidos()" :key="pedido.id">
            <td>#{{ pedido.id }}</td>
            <td>{{ pedido.cliente }}</td>
            <td>{{ data(pedido.data) }}</td>
            <td>{{ moeda(pedido.valor_total) }}</td>
            <td>
              <select
                :value="pedido.status"
                :disabled="pedido.status === 'Cancelado' || atualizando === pedido.id"
                :aria-label="`Status do pedido ${pedido.id}`"
                @change="alterarStatus(pedido, $event)"
              >
                <option v-for="opcao in statusOpcoes" :key="opcao">{{ opcao }}</option>
              </select>
            </td>
            <td><button class="btn-link" @click="verItens(pedido)">Ver itens</button></td>
          </tr>
          <tr v-if="!carregando && filtrarPedidos().length === 0">
            <td colspan="6" class="orders-empty">Nenhum pedido encontrado.</td>
          </tr>
        </tbody>
      </table>
      <p v-if="carregando" class="loading">Carregando pedidos...</p>
    </div>
    <section v-if="pedidoDetalhado" class="card form-card detalhes-pedido">
      <div class="section-head">
        <h2 class="section-title">Itens do pedido #{{ pedidoDetalhado.id }}</h2>
        <button class="btn-link" @click="pedidoDetalhado = null">Fechar</button>
      </div>
      <p v-for="item in pedidoDetalhado.itens" :key="item.id">
        {{ item.descricao }} — {{ item.quantidade }} × {{ moeda(item.valor_unitario) }}
      </p>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { listar, criarPedido, mudarStatus } from '../services/loja'

const pedidos = ref([])
const clientes = ref([])
const produtos = ref([])
const busca = ref('')
const status = ref('Todos')
const statusOpcoes = ['Aguardando', 'Em preparação', 'Enviado', 'Concluído', 'Cancelado']
const mostrarFormulario = ref(false)
const clienteId = ref('')
const itens = ref([{ produto_id: '', quantidade: 1 }])
const erro = ref('')
const carregando = ref(false)
const salvando = ref(false)
const atualizando = ref(null)
const pedidoDetalhado = ref(null)

function moeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function data(valor) {
  return new Date(valor).toLocaleDateString('pt-BR')
}
function filtrarPedidos() {
  return pedidos.value.filter(
    (pedido) =>
      pedido.cliente.toLowerCase().includes(busca.value.trim().toLowerCase()) &&
      (status.value === 'Todos' || pedido.status === status.value),
  )
}
function adicionarItem() {
  itens.value.push({ produto_id: '', quantidade: 1 })
}
function totalEstimado() {
  return itens.value.reduce((total, item) => {
    const produto = produtos.value.find((p) => p.id === Number(item.produto_id))
    return total + (produto ? Number(produto.valor) * Number(item.quantidade || 0) : 0)
  }, 0)
}
async function carregar() {
  carregando.value = true
  try {
    pedidos.value = await listar('/pedidos')
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível carregar pedidos.'
  } finally {
    carregando.value = false
  }
}
async function novo() {
  erro.value = ''
  try {
    clientes.value = await listar('/clientes')
    produtos.value = await listar('/produtos')
    clienteId.value = ''
    itens.value = [{ produto_id: '', quantidade: 1 }]
    mostrarFormulario.value = true
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível carregar clientes e produtos.'
  }
}
async function salvarPedido() {
  salvando.value = true
  erro.value = ''
  try {
    await criarPedido({ cliente_id: clienteId.value, itens: itens.value })
    mostrarFormulario.value = false
    await carregar()
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível salvar pedido.'
  } finally {
    salvando.value = false
  }
}
async function verItens(pedido) {
  erro.value = ''
  try {
    pedidoDetalhado.value = { id: pedido.id, itens: await listar(`/pedidos/${pedido.id}/itens`) }
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível carregar itens.'
  }
}
async function alterarStatus(pedido, evento) {
  const novoStatus = evento.target.value
  if (novoStatus === 'Cancelado' && !confirm('Cancelar pedido e devolver produtos ao estoque?')) {
    evento.target.value = pedido.status
    return
  }
  atualizando.value = pedido.id
  erro.value = ''
  try {
    await mudarStatus(pedido.id, novoStatus)
    pedido.status = novoStatus
  } catch (e) {
    evento.target.value = pedido.status
    erro.value = e.response?.data?.message || 'Não foi possível alterar status.'
  } finally {
    atualizando.value = null
  }
}
onMounted(carregar)
</script>

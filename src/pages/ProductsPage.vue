<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-title">Produtos</h1>
      <p class="page-sub">Peças que fazem parte de cada história.</p>
    </header>
    <div class="orders-toolbar">
      <input
        v-model="busca"
        class="orders-search"
        placeholder="Buscar por descrição"
        aria-label="Buscar por descrição"
      />
      <button class="btn-primary orders-new" @click="novo">Novo</button>
    </div>
    <form v-if="mostrarFormulario" class="card form-card" @submit.prevent="salvarProduto">
      <h2 class="section-title">{{ editando ? 'Editar produto' : 'Novo produto' }}</h2>
      <div class="form-grid">
        <label class="field"
          >Descrição<input v-model="formulario.descricao" maxlength="150" required
        /></label>
        <label class="field"
          >Estoque<input v-model="formulario.estoque" type="number" min="0" step="1" required
        /></label>
        <label class="field"
          >Valor (R$)<input v-model="formulario.valor" type="number" min="0" step="0.01" required
        /></label>
      </div>
      <div class="form-actions">
        <button class="btn-primary" :disabled="salvando">Salvar</button
        ><button type="button" class="btn-secondary" @click="mostrarFormulario = false">
          Cancelar
        </button>
      </div>
    </form>
    <p v-if="erro" class="feedback-error" role="alert">{{ erro }}</p>
    <div class="card table-card">
      <div class="table-card-head">
        <span class="section-title">Todos os produtos</span
        ><span class="table-count">{{ filtrarProdutos().length }} registros</span>
      </div>
      <table class="orders-table" aria-label="Lista de produtos">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Estoque</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="produto in filtrarProdutos()" :key="produto.id">
            <td>{{ produto.descricao }}</td>
            <td>{{ produto.estoque }}</td>
            <td>{{ moeda(produto.valor) }}</td>
            <td>
              <button class="btn-link" @click="editar(produto)">Editar</button
              ><button class="btn-link" @click="excluirProduto(produto)">Excluir</button>
            </td>
          </tr>
          <tr v-if="!carregando && filtrarProdutos().length === 0">
            <td colspan="4" class="orders-empty">Nenhum produto encontrado.</td>
          </tr>
        </tbody>
      </table>
      <p v-if="carregando" class="loading">Carregando produtos...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { listar, salvar, excluir } from '../services/loja'

const produtos = ref([])
const busca = ref('')
const formulario = ref({ descricao: '', estoque: 0, valor: '' })
const editando = ref(null)
const mostrarFormulario = ref(false)
const carregando = ref(false)
const salvando = ref(false)
const erro = ref('')

function moeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function filtrarProdutos() {
  return produtos.value.filter((produto) =>
    produto.descricao.toLowerCase().includes(busca.value.trim().toLowerCase()),
  )
}
function novo() {
  formulario.value = { descricao: '', estoque: 0, valor: '' }
  editando.value = null
  erro.value = ''
  mostrarFormulario.value = true
}
function editar(produto) {
  formulario.value = {
    descricao: produto.descricao,
    estoque: produto.estoque,
    valor: produto.valor,
  }
  editando.value = produto.id
  erro.value = ''
  mostrarFormulario.value = true
}
async function carregar() {
  carregando.value = true
  try {
    produtos.value = await listar('/produtos')
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível carregar produtos.'
  } finally {
    carregando.value = false
  }
}
async function salvarProduto() {
  salvando.value = true
  erro.value = ''
  try {
    await salvar('/produtos', formulario.value, editando.value)
    mostrarFormulario.value = false
    await carregar()
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível salvar produto.'
  } finally {
    salvando.value = false
  }
}
async function excluirProduto(produto) {
  if (!confirm(`Excluir produto "${produto.descricao}"?`)) return
  erro.value = ''
  try {
    await excluir('/produtos', produto.id)
    await carregar()
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível excluir produto.'
  }
}
onMounted(carregar)
</script>

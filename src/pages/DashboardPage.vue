<template>
  <div class="page">
    <header class="page-head"><h1 class="page-title">Visão geral</h1></header>
    <section>
      <div class="section-head"><h2 class="section-title">Resumo da loja</h2></div>
      <p v-if="erro" class="feedback-error" role="alert">{{ erro }}</p>
      <p v-if="carregando" class="loading">Carregando resumo...</p>
      <div v-else-if="resumo" class="kpi-grid">
        <article class="card kpi-card">
          <p class="kpi-label">Vendas</p>
          <p class="kpi-value">{{ moeda(resumo.vendas) }}</p>
          <p class="kpi-caption">Pedidos concluídos</p>
        </article>
        <article class="card kpi-card">
          <p class="kpi-label">Pedidos</p>
          <p class="kpi-value">{{ resumo.pedidos }}</p>
          <p class="kpi-caption">Registrados na loja</p>
        </article>
        <article class="card kpi-card">
          <p class="kpi-label">Clientes</p>
          <p class="kpi-value">{{ resumo.clientes }}</p>
          <p class="kpi-caption">Na base da loja</p>
        </article>
        <article class="card kpi-card">
          <p class="kpi-label">Ticket médio</p>
          <p class="kpi-value">{{ moeda(resumo.ticket_medio) }}</p>
          <p class="kpi-caption">Por pedido concluído</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { listar } from '../services/loja'

const resumo = ref(null)
const carregando = ref(true)
const erro = ref('')
function moeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
onMounted(async () => {
  try {
    resumo.value = await listar('/resumo')
  } catch (e) {
    erro.value = e.response?.data?.message || 'Não foi possível carregar resumo.'
  } finally {
    carregando.value = false
  }
})
</script>

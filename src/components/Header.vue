<template>
  <header class="site-header">
    <div class="top-menu">
      <div class="brand-row">
        <div class="brand-inner">
          <router-link :to="site.routes.home" class="brand">{{ site.name }}</router-link>
        </div>
      </div>

      <nav
        v-for="row in menu.rows"
        :key="row.title"
        class="menu-row"
        :class="`menu-${row.type}`"
        :aria-label="row.title"
      >
        <router-link class="group-title" :to="row.to">{{ row.title }}</router-link>
        <router-link
          v-for="item in row.items"
          :key="item.id"
          class="menu-item"
          :to="itemLink(row, item)"
        >{{ item.name }}</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import menu from '../config/menu.json'
import site from '../config/site'

function itemLink(row, item) {
  if (row.type === 'image') return `${site.routes.image}?tid=${item.id}`
  if (row.type === 'novel') return `${site.routes.novel}?tid=${item.id}`
  return site.routes.category.replace(':id', item.id)
}
</script>

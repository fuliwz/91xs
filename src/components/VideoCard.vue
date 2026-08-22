<template><router-link class="card" :to="`/detail/${v.vod_id}`"><div class="poster"><img :src="v.vod_pic" loading="lazy"/><span class="quality">HD</span><span class="play">▶</span></div><div class="ct"><h3>{{v.vod_name}}</h3><p>{{v.vod_class||v.type_name||'影片'}}</p></div></router-link></template>
<script setup>defineProps({v:{type:Object,required:true}})</script>

<template>
  <v-container class="d-flex flex-column align-center justify-center ">
    <v-alert v-show="alert" type="success" class="my-width">Hello from HelloWorld with Vuetify!</v-alert>
    <v-btn @click="alert = !alert">Hello World</v-btn>
    <v-card class="ma-4 pa-4 my-width">
      <v-btn @click="counter.increment">Click</v-btn>
      <p>Count: {{ counter.count }}</p>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const alert = ref(false);
const sayHello = ()=>{
  console.log("hello");
  
}
import { useCounterStore } from '../store/counter'

const counter = useCounterStore()
</script>

<style scoped>
.test{
  background-color: blue;
  margin: 10px;
  border: 1px solid red;
  border-radius: 10px;
  width: 200px;
  height: 50px;
  color: #fff;
  text-align: center;
  padding: auto;
}
.my-width {
  width: 80dvw;
}
</style>
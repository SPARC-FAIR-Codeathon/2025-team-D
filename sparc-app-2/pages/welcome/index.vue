<template>
  <Head>
    <Title>Welcome</Title>
    <Meta name="og:title" hid="og:title" content="Welcome" />
    <Meta name="twitter:title" content="Welcome" />
  </Head>
  <div class="container mb-16">
    <setup-new-user />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth-route']
});
</script>

<script>
import SetupNewUser from '@/components/SetupNewUser/SetupNewUser.vue'

export default {
  name: 'welcome',
  components: {
    SetupNewUser
  }
}
</script>

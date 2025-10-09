<script setup lang="ts">
import * as z from "zod";

const schema = z.object({
  username: z.string("Username is required"),
  password: z.string("Password is required").min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  username: undefined,
  password: undefined,
});

async function onSubmit(_: SubmitEvent) {
  const base_url = import.meta.env.VITE_BASE_URL;
  const response = await fetch(`${base_url}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });
  console.log(await response.json());
}
</script>

<template>
  <div class="card mx-auto mt-5" style="width: 28rem">
    <div class="card-body">
      <h5 class="card-title">Login</h5>
      <form :schema="schema" :state="state" @submit.prevent="onSubmit">
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="username" class="form-control" v-model="state.username" id="username" />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control" v-model="state.password" id="password" />
        </div>
        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="exampleCheck1" />
          <label class="form-check-label" for="exampleCheck1">Check me out</label>
        </div>
        <button type="submit" class="btn btn-save">Submit</button>
      </form>
    </div>
  </div>
</template>

<style>
.btn-save {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

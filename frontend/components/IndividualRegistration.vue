<template>
  <div class="card mx-auto p-3" style="width: 28rem">
    <div class="card-body">
      <h5 class="card-title">Individual Registration</h5>
      <form :schema="schema" :state="state" @submit.prevent="onSubmit">
        <div class="mb-3">
          <label for="name" class="form-label">Full Name</label>
          <input type="text" class="form-control" v-model="state.name" id="name" required />
        </div>
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="text" class="form-control" v-model="state.username" id="username" required />
        </div>
        <div class="mb-3">
          <label for="age" class="form-label">Age</label>
          <input type="number" class="form-control" v-model.number="state.age" id="age" required />
        </div>
        <div class="mb-3">
          <label for="gender" class="form-label">Gender</label>
          <select class="form-control" v-model="state.gender" id="gender" required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="contact_no" class="form-label">Contact Number</label>
          <input type="tel" class="form-control" v-model="state.contact_no" id="contact_no" placeholder="+65 9123 4567" /> </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control" v-model="state.password" id="password" required />
        </div>
        <div class="mb-3">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input type="password" class="form-control" v-model="confirmPassword" id="confirmPassword" required />
        </div>
        <div id="error" class="form-text text-danger mb-2" v-text="error"></div>
        <div id="success" class="form-text text-success mb-2" v-text="success"></div>
        <div class="text-center mb-3 singpass-btn btn-save">
          <button class="btn w-75 p-0 border-0">
            <img src="/singpass-myinfo.svg" class="w-100"/>
          </button>
        </div>
        <div class="text-center">
          <button type="submit" class="btn btn-save w-75" :disabled="isLoading">
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </div>
      </form>
      <div class="text-center mt-3">
        <NuxtLink href="/register" @click="$emit('setFormType', '')" class="link-secondary">Back to account type selection</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  age: z.number().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  contact_no: z.string(),
  avatar_url: z.string(),
  role: z.literal("user"),
  has_2fa_enabled: z.boolean()
});

const base_url = import.meta.env.VITE_BASE_URL;
type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: "",
  username: "",
  age: undefined,
  gender: "",
  password: "",
  contact_no: "",
  avatar_url: "https://i.pravatar.cc/150",
  role: "user",
  has_2fa_enabled: false
});

const confirmPassword = ref("");
const error = ref("");
const success = ref("");
const isLoading = ref(false);

async function onSubmit(_: Event) {
  error.value = "";
  success.value = "";

  if (state.password !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  const validation = schema.safeParse(state);
  if (!validation.success) {
    error.value = validation.error.message;
    return;
  }

  isLoading.value = true;

  try {
    const response = await fetch(`${base_url}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state),
    });

    const data = await response.json();

    if (response.ok) {
      success.value = "Account created successfully! Redirecting to login...";
      setTimeout(() => {
        navigateTo("/login");
      }, 2000);
    } else {
      error.value = data.error || data.message || "Registration failed";
    }
  } catch (err) {
    error.value = "An error occurred during registration";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.singpass-btn {
  background: unset !important;
  box-shadow: unset !important;
}

.btn-save {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
  transition: all 0.3s;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link-secondary {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
}

.link-secondary:hover {
  text-decoration: underline;
}

.form-control:focus {
  border-color: #ff9800;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(255, 152, 0, 0.6);
}
</style>

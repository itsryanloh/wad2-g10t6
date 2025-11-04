<template>
  <div class="card mx-auto p-3" style="width: 36rem">
    <div class="card-body">
      <h5 class="card-title">Individual Registration</h5>
      <form :schema="schema" :state="state" @submit.prevent="onSubmit">
        <div class="d-flex">
          <div class="avatar-upload-section">
            <div class="avatar-preview" @click="avatarInput!.click()">
              <img 
                v-if="state.avatar_url" 
                :src="state.avatar_url" 
                alt="Avatar"
              />
              <i v-else class="fas fa-user"></i>
            </div>
            <div class="mx-3">
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none;"
                @change="handleAvatarUpload"
              />
              <small class="upload-hint">JPG, PNG or GIF. Max 2MB</small>
            </div>
          </div>
          <div class="flex-grow-1">
            <div class="mb-3">
              <label for="name" class="form-label">Full Name</label>
              <input type="text" class="form-control" v-model="state.name" id="name" required />
            </div>
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" v-model="state.username" id="username" required />
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-between gap-2">
          <div class="mb-3 w-100">
            <label for="age" class="form-label">Age</label>
            <input type="number" class="form-control" v-model.number="state.age" id="age" required />
          </div>
          <div class="mb-3 w-100">
            <label for="gender" class="form-label">Gender</label>
            <select class="form-select" v-model="state.gender" id="gender" required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
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
        <div class="d-flex justify-content-center align-items-center btn-singpass mb-3">
          <button type="submit" class="btn fw-bold w-75">Retrieve Myinfo with
          <img src="/singpass.png"/></button>
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
import type { InputHTMLAttributes } from "vue";
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
  avatar_url: "",
  role: "user",
  has_2fa_enabled: false
});

const confirmPassword = ref("");
const error = ref("");
const success = ref("");
const isLoading = ref(false);
const avatarInput = useTemplateRef('avatarInput');

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files![0]

  if (file!.size > 2 * 1024 * 1024) {
    error.value = 'Avatar image must be less than 2MB'
    setTimeout(() => error.value = '', 3000)
    return
  }

  const formData = new FormData()
  formData.append('avatar', file as Blob)

  await fetch(`${base_url}/avatars/upload`, {
    method: 'POST',
    body: formData
  }).then(async res => {
    const data = await res.json()
    state.avatar_url = data.url
  }).catch(err => {
    console.log(err)
  })
}

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

  if (!state.avatar_url) state.avatar_url = `https://cat-avatars.vercel.app/api/cat?name=${state.username}`;

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
      }, 1000);
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
.avatar-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.avatar-preview {
  cursor: pointer;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #FFE8D6;
  transition: all 0.3s;
}

.avatar-preview:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview i {
  font-size: 2.5rem;
  color: white;
}

.btn-upload {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-upload:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.btn-upload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-hint {
  display: block;
  text-align: center;
}

.btn-singpass button {
  border: 1px solid #C8C9CC;
  border-radius: 0.375rem;
  background-color: #FFFFFF;
  font-family: "Poppins", sans-serif;
  transition: all 0.3s;
}

.btn-singpass button:hover {
  border: 1px solid #C8C9CC;
  border-radius: 0.375rem;
  background-color: #F5F5F7;
  transform: translateY(-2px);
}

.btn-singpass button img {
  height: 16px;
  transform: translateY(1px);
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

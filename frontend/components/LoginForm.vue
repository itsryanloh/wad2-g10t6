<script setup lang="ts">
import * as z from "zod";

const schema = z.object({
  username: z.string("Username is required"),
  password: z.string("Password is required").min(8, "Must be at least 8 characters"),
});

const base_url = import.meta.env.VITE_BASE_URL;
type Schema = z.output<typeof schema>;

const codeSchema = z.object({
  code: z.int().gte(100000).lte(999999)
});

type CodeSchema = z.output<typeof codeSchema>;

const state = reactive<Schema>({
  username: "",
  password: "",
});

const codeState = reactive<Partial<CodeSchema>>({})

let show_2fa_check = ref(false);
let error = ref("");
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const recaptchaToken = ref(null)


async function onCodeSubmit(_: SubmitEvent) {
  const verifyData = {
    username: state.username,
    code: codeState.code
  }
  const response = await fetch(`${base_url}/auth/verify-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(verifyData),
  });
  const data = await response.json();
  if (response.ok) {
    error.value = "";

    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    let token = useCookie("token", { expires });
    token.value = data.token;

    await navigateTo("/");
  }
}

async function onLoginSubmit(_: SubmitEvent) {
  const emptyInputField = Object.entries(state).find(([_, v]) => !v)?.[0]
  if (!recaptchaToken.value) {
    error.value = 'Please complete the reCAPTCHA first'
    return
  }
  // verify recaptcha token in backend, needs backend endpoint
  if (emptyInputField) {
    error.value = `Please input ${emptyInputField}`
    return
  }
  const response = await fetch(`${base_url}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });
  const data = await response.json();
  if (response.ok) {
    error.value = "";
    if (data.token) {
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);
      let token = useCookie("token", { expires });

      token.value = data.token;
      await navigateTo("/");
      window.location.reload();
    } else {
      show_2fa_check.value = true;
    }
  } else {
    error.value = data.error;
  }
}

onMounted(() => {
  let recaptchaScript = document.createElement('script')
  recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js')
  document.head.appendChild(recaptchaScript)

  window.onVerify = (response: any) => {
    recaptchaToken.value = response
  }
})

</script>

<template>
  <div class="card position-absolute top-50 start-50 translate-middle p-3" style="width: 28rem">
    <div class="card-body">
      <h5 class="card-title">Login</h5>
      <form v-if="show_2fa_check" :schema="codeSchema" :state="codeState" @submit.prevent="onCodeSubmit">
        <div class="mb-3" v-if="show_2fa_check">
          <label for="code" class="form-label">Enter the 6-digit code sent to your phone number.</label>
          <input type="code" class="form-control" v-model="codeState.code" id="token" />
        </div>
        <div id="error" class="form-text text-danger mb-2" v-text="error"></div>
        <button type="submit" class="btn btn-save">Submit</button>
      </form>
      <form v-else :schema="schema" :state="state" @submit.prevent="onLoginSubmit">
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
          <label class="form-check-label" for="exampleCheck1">Remember me</label>
        </div>
        <div
          class="g-recaptcha text-center"
          :data-sitekey="siteKey"
          data-callback="onVerify"
        ></div>
        <div id="error" class="form-text text-danger mb-2" v-text="error"></div>
        <div style="width: 100%" class="text-center">
          <button type="submit" class="btn btn-save">Submit</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style>
.btn-save {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
  transition: all 0.3s;
  width: 50%;
  margin-top: 20px;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
  color: white;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card {
  background: rgba(255, 255, 255, 0.65);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(7.7px);
  -webkit-backdrop-filter: blur(7.7px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.form-control:focus {
  border-color: #ff9800;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(255, 152, 0, 0.6);
}

.form-check-input:focus {
  border-color: #ff9800;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(255, 152, 0, 0.6);
}

.form-check-input:checked {
  border-color: #ff9800;
  background-color: #ff9800;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(255, 152, 0, 0.6);
}
</style>

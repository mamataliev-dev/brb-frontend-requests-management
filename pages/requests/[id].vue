<template>
  <div class="mt-4 wrapper">
    <h1 class="text-2xl">Информация о заявке</h1>
    <div class="flex flex-col gap-y-5 mt-3 p-5 bg-white rounded-xl">
      <div class="flex gap-x-10 pb-2">
        <div
          class="cursor-pointer"
          :class="activeTab === 1 ? 'active-tab' : ''"
          @click="activeTab = 1"
        >
          <span>Информация</span>
        </div>

        <div
          class="cursor-pointer"
          :class="activeTab === 2 ? 'active-tab' : ''"
          @click="activeTab = 2"
        >
          <span>Заметки</span>
        </div>

        <div
          class="cursor-pointer"
          :class="activeTab === 3 ? 'active-tab' : ''"
          @click="activeTab = 3"
        >
          <span>История</span>
        </div>
      </div>

      <!-- Info -->
      <div v-if="activeTab === 1" class="flex flex-col gap-y-10">
        <div class="grid-container">
          <div class="fields">
            <span class="cst-span">ФИО:</span>
            <h2 class="cst-h2">{{ request?.client_name }}</h2>
          </div>

          <div class="fields">
            <span class="cst-span">Филиал:</span>
            <h2 class="cst-h2">{{ branchIdToText(request?.branch_id) }}</h2>
          </div>

          <div class="fields">
            <span class="cst-span">Статус:</span>
            <UBadge :color="statusToColor(request?.status)" variant="solid">
              <span class="text-center text-[16px]">{{
                statusTxtToRussian(request?.status)
              }}</span>
            </UBadge>
          </div>

          <div class="fields">
            <span class="cst-span">Номер телефона:</span>
            <h2 class="cst-h2">+{{ request?.phone_number }}</h2>
          </div>

          <div class="fields">
            <span class="cst-span">Продукт:</span>
            <h2 class="cst-h2">{{ request?.product }}</h2>
          </div>

          <div class="fields">
            <span class="cst-span">Время заявки:</span>
            <h2 class="cst-h2">
              {{ new Date(request?.request_datetime).toLocaleString() }}
            </h2>
          </div>
        </div>

        <div class="flex justify-end gap-x-6">
          <UButton color="blue" @click="isUpdating = true">Изменить</UButton>
          <UButton color="red" @click="deleteRequest"> Удалить</UButton>
        </div>
      </div>

      <!-- Update form -->
      <div v-if="isUpdating">
        <form @submit.prevent="submitUpdate" class="flex flex-col gap-y-4">
          <div class="flex flex-col">
            <label>ФИО:</label>
            <input class="border p-3" type="text" v-model="client_name" />
          </div>

          <div class="flex flex-col">
            <label>Номер телефона:</label>
            <input class="border p-3" type="text" v-model="phone_number" />
          </div>

          <div class="flex flex-col">
            <label>Продукт:</label>
            <input class="border p-3" type="text" v-model="product" />
          </div>

          <div class="flex flex-col">
            <label>Филиал:</label>
            <select v-model="branch_id" class="dropdown">
              <option value="" disabled>Select status</option>
              <option
                v-for="option in branchOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="flex flex-col">
            <label>Статус:</label>

            <select v-model="status" class="dropdown">
              <option value="" disabled>Select status</option>
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="flex gap-x-4">
            <button
              @click="isUpdating = false"
              :disabled="loading"
              class="bg-red-400"
            >
              Отменить
            </button>
            <button type="submit" :disabled="loading">Изменить</button>
          </div>
        </form>
      </div>

      <!-- Notes -->
      <div v-if="activeTab === 2" class="flex flex-col gap-y-2">
        <form @submit.prevent="submitNote" class="flex gap-x-3 items-center">
          <div class="flex flex-col gap-y-2">
            <label>Добавить заметку:</label>
            <textarea
              v-model="note"
              placeholder="Введити свою заметку"
              required
            ></textarea>
          </div>
          <button type="submit" :disabled="loading">Добавить</button>
        </form>

        <p v-if="success" class="success">Заметка успешна добавлена!</p>
        <p v-if="error" class="error">{{ error }}</p>

        <div class="mt-8">
          <span class="cst-span">Все заметки: </span>

          <div v-for="note in request?.notes" class="mt-2">
            <div class="flex flex-col">
              <span class="text-[13px]">{{
                new Date(note.timestamp).toLocaleString()
              }}</span>
              <span class="text-lg font-medium">- {{ note.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div v-if="activeTab === 3" class="flex flex-col gap-y-3">
        <div v-for="history in requestHistory?.history">
          <div class="flex flex-col gap-y-3">
            <span class="text-[13px]">{{
              new Date(history.changed_at).toLocaleString()
            }}</span>

            <div class="flex flex-col">
              <span>Измененные поля:</span>
              <div class="flex gap-x-1">
                <span v-for="field in history.updated_fields">
                  {{ filedToTxt(field) }}
                </span>
              </div>
            </div>

            <div>
              {{ history.new_values }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();

const request = ref(null);
const requestHistory = ref(null);
const error = ref(null);

const activeTab = ref(1);
const note = ref("");

const loading = ref(false);
const success = ref(false);

const client_name = ref("");
const phone_number = ref("");
const product = ref("");
const branch_id = ref(null);
const status = ref("");

const isUpdating = ref(false);

function filedToTxt(field) {
  const updatedFieldsMap = {
    client_name: "ФИО",
    phone_number: "Номер телефона",
    branch_id: "Филиал",
    product: "Продукт",
    status: "Статус",
  };
  return updatedFieldsMap[field] || "Unknown Branch";
}

function newValueToTxt(newValues) {
  const newValuesMap = {
    client_name: "ФИО",
    phone_number: "Номер телефона",
    branch_id: "Филиал",
    product: "Продукт",
    status: "Статус",
  };

  return Object.keys(newValues).map((key) => newValuesMap[key] || key);
}

async function fetchData() {
  try {
    request.value = await $fetch(
      `https://brb-request-management.onrender.com/requests/${route.params.id}`
    );
    console.log("Fetched data:", request.value);
    client_name.value = request?.value.client_name || "";
    phone_number.value = request?.value.phone_number || "";
    product.value = request?.value.product || "";
    branch_id.value = request?.value.branch_id || null;
    status.value = request?.value.status || "";
  } catch (err) {
    console.error("Fetch error:", err.message, err.stack);
    error.value = err;
  }
}

const statusOptions = [
  { value: "in-progress", label: "В обработке" },
  { value: "transferred", label: "Перенаправлена" },
  { value: "closed", label: "Закрыта" },
];

const branchOptions = [
  { value: 1, label: "Ташкент" },
  { value: 2, label: "Бухара" },
  { value: 3, label: "Фергана" },
  { value: 4, label: "Самарканд" },
  { value: 5, label: "Навои" },
];

async function submitUpdate() {
  console.log("updating");

  loading.value = true;
  error.value = null;
  success.value = false;

  const updatedFields = {};
  if (client_name.value !== request?.value.client_name)
    updatedFields.client_name = client_name.value;
  if (phone_number.value !== request?.value.phone_number)
    updatedFields.phone_number = phone_number.value;
  if (product.value !== request?.value.product)
    updatedFields.product = product.value;
  if (branch_id.value !== request?.value.branch_id)
    updatedFields.branch_id = branch_id.value;
  if (status.value !== request?.value.status)
    updatedFields.status = status.value;

  // Only send request if there are changes
  if (Object.keys(updatedFields).length === 0) {
    success.value = true; // No changes, consider it "successful"
    loading.value = false;
    return;
  }

  try {
    const response = await $fetch(
      `https://brb-request-management.onrender.com/requests/${route.params.id}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedFields),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response note:", response);
    success.value = true;
    note.value = "";
  } catch (err) {
    console.error("PUT error:", err.message, err.stack);
    error.value = err.message || "Failed to add note";
  } finally {
    loading.value = false;
    fetchData();
    fetchDataHistory();
  }
}

async function submitNote() {
  if (!note.value.trim()) {
    error.value = "Note cannot be empty";
    return;
  }

  loading.value = true;
  error.value = null;
  success.value = false;

  try {
    const response = await $fetch(
      `https://brb-request-management.onrender.com/requests/${route.params.id}`,
      {
        method: "PUT",
        body: JSON.stringify({ notes: note.value }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Response note:", response);
    success.value = true;
    note.value = "";
  } catch (err) {
    console.error("PUT error:", err.message, err.stack);
    error.value = err.message || "Failed to add note";
  } finally {
    loading.value = false;
    fetchData();
    fetchDataHistory();
  }
}

function deleteRequest() {
  try {
    const response = $fetch(
      `https://brb-request-management.onrender.com/requests/${route.params.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("PUT error:", err.message, err.stack);
    error.value = err.message || "Failed to add note";
  } finally {
    console.log("deleted");

    return navigateTo({
      path: "/",
    });
  }
}

function branchIdToText(branchId) {
  const branchMap = {
    1: "Ташкент",
    2: "Бухара",
    3: "Фергана",
    4: "Самарканд",
    5: "Навои",
  };
  return branchMap[branchId] || "Unknown Branch";
}

function statusTxtToRussian(status) {
  const statusMap = {
    "in-progress": "В обработке",
    transferred: "Перенаправлена",
    closed: "Закрыта",
  };
  return statusMap[status] || status;
}

function statusToColor(status) {
  const colorMap = {
    "in-progress": "blue",
    transferred: "orange",
    closed: "green",
  };
  return colorMap[status] || "gray";
}

async function fetchDataHistory() {
  try {
    requestHistory.value = await $fetch(
      `https://brb-request-management.onrender.com/requests-history/${route.params.id}`
    );
    console.log("Fetched data history:", requestHistory.value);
  } catch (err) {
    console.error("Fetched data history:", err.message, err.stack);
    error.value = err;
  }
}

onMounted(() => {
  fetchData();
  fetchDataHistory();
});
</script>

<style lang="scss">
.cst-h2 {
  @apply font-medium text-xl;
}

.cst-span {
  @apply text-sm mb-1;
}

.fields {
  @apply flex flex-col;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  row-gap: 60px;
}

.active-tab {
  @apply border-b-[2.5px] border-[#0263E0] text-[#0263E0] pb-2;
}

.dropdown {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  padding: 0.5rem;
  font-size: 1rem;
  min-height: 100px;
  width: 300px;
  border: 1px black solid;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>

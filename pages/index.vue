<template>
  <div class="mt-4 wrapper">
    <div class="flex gap-x-4 mb-4">
      <!-- Search by client name-->
      <form @submit.prevent="fetchData" class="flex gap-x-3">
        <input
          type="text"
          placeholder="Поиск клиента..."
          v-model="searchQuery"
          class="w-[300px] p-2 search-input"
          @input="debouncedFetch"
        />
        <button type="submit" class="bg-blue-500 text-white p-2">Поиск</button>
      </form>

      <!-- Filters -->
      <div class="flex gap-x-7">
        <div class="flex flex-col">
          <label>Фильтровать по филиалу:</label>
          <select v-model="selectedBranch" class="dropdown" @change="fetchData">
            <option value="" disabled>Выберите филиал</option>
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
          <label>Фильтровать по статусу:</label>
          <select v-model="selectedStatus" class="dropdown" @change="fetchData">
            <option value="" disabled>Выберите статус</option>
            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="border rounded-md">
      <UTable
        :columns="columns"
        :rows="rows"
        :loading="requests === null && !error"
      >
        <template #request_datetime-data="{ row }">
          {{ new Date(row.request_datetime).toLocaleString() }}
        </template>

        <template #branch_id-data="{ row }">
          {{ branchIdToText(row.branch_id) }}
        </template>

        <template #status-data="{ row }">
          <UBadge :color="statusToColor(row.status)" variant="solid">
            {{ statusTxtToRussian(row.status) }}
          </UBadge>
        </template>

        <template #action-data="{ row }">
          <NuxtLink :to="`/requests/${row.id}`">
            <img
              src="~/assets/icons/edit.svg"
              @click="handleIconClick(row)"
              alt="Edit"
            />
          </NuxtLink>
        </template>
      </UTable>
    </div>

    <div
      class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"
    >
      <UPagination
        v-model="page"
        :page-count="pageCount"
        :total="requests?.requests?.length || 0"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { debounce } from "lodash";

const page = ref(1);
const pageCount = 10;

const searchQuery = ref("");
const selectedBranch = ref("");
const selectedStatus = ref("");

const requests = ref(null);
const error = ref(null);
const loading = ref(false);

async function fetchData() {
  loading.value = true;
  error.value = null;

  const params = new URLSearchParams();
  if (selectedBranch.value) params.append("branch_id", selectedBranch.value);
  if (selectedStatus.value) params.append("status", selectedStatus.value);
  if (searchQuery.value.trim()) params.append("phone_number", searchQuery.value.trim());

  const url = `https://brb-request-management.onrender.com/requests${params.toString() ? "?" + params.toString() : ""}`;
  console.log("Fetching URL:", url);

  try {
    requests.value = await $fetch(url);
    console.log("Fetched data:", requests.value);
  } catch (err) {
    console.error("Fetch error:", err.message, err.stack);
    error.value = err.message || "Failed to fetch requests";
  } finally {
    loading.value = false;
  }
}

const debouncedFetch = debounce(fetchData, 300);

watch([selectedBranch, selectedStatus, page], () => {
  fetchData();
});

const columns = [
  { key: "id", label: "ID" },
  { key: "client_name", label: "ФИО" },
  { key: "phone_number", label: "Номер телефона" },
  { key: "product", label: "Продукт" },
  { key: "status", label: "Статус" },
  { key: "request_datetime", label: "Время заявки" },
  { key: "branch_id", label: "Филиал" },
  { key: "action", label: "Изменить" },
];

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

const rows = computed(() => {
  if (!requests.value?.requests) return [];
  const start = (page.value - 1) * pageCount;
  const end = page.value * pageCount;
  return requests.value.requests.slice(start, end);
});

onMounted(fetchData);
</script>

<style lang="scss">
.hover-row {
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
    @apply dark:bg-gray-800;
  }
}

.dropdown {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>

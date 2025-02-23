<template>
  <div class="mt-4 wrapper">
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

const page = ref(1);
const pageCount = 10;

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

const requests = ref(null);
const error = ref(null);

const rows = computed(() => {
  if (!requests.value?.requests) return [];
  const start = (page.value - 1) * pageCount;
  const end = page.value * pageCount;
  return requests.value.requests.slice(start, end);
});

async function fetchData() {
  try {
    requests.value = await $fetch(
      "https://brb-request-management.onrender.com/requests"
    );
    console.log("Fetched data:", requests.value);
  } catch (err) {
    console.error("Fetch error:", err.message, err.stack);
    error.value = err;
  }
}

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
</style>

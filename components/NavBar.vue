<template>
  <nav class="w-full bg-white">
    <ul class="h-auto lg:h-auto wrapper flex justify-between py-4">
      <li>
        <ULink to="/">
          <img
            class="w-[100px] h-[30px]"
            src="~/assets/icons/logo.svg"
            alt="BRB"
          />
        </ULink>
      </li>

      <li class="flex items-center gap-x-2">
        <UAvatar
          size="md"
          src="https://avatars.githubusercontent.com/u/739984?v=4"
          alt="Avatar"
        />

        <span>Иван Иванов</span>
      </li>
    </ul>
  </nav>
</template>

<script setup></script>

<style lang="scss" scoped></style>

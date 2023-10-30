<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let error = false;
	let initData = '';
	let loginButton: HTMLButtonElement;

	onMount(() => {
		initData = window.Telegram.WebApp.initData;
		setTimeout(() => loginButton.click(), 10);
	});
</script>

<div class="h-screen flex justify-center flex-col px-4">
	<div class="text-center text-2xl{error ? ' text-red-500' : ''}">
		{error ? '💥 Помилка авторизації' : '⏳ Авторизація...'}
	</div>
	<form
		method="post"
		class="hidden"
		use:enhance={() =>
			async ({ result, update }) => {
				if (result.status === 200 && result.type === 'success' && !result.data?.success) {
					error = true;
				}

				update();
			}}
	>
		<input type="hidden" name="init-data" value={initData} />
		<button bind:this={loginButton} />
	</form>
</div>

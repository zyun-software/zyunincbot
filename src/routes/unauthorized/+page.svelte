<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let initData = '';

	onMount(() => (initData = location.hash));
</script>

<div class="h-screen flex justify-center flex-col px-4">
	<div class="text-center text-2xl">🔒 Необхідна авторизація</div>

	{#if initData.length}
		<form method="post" class="text-center mt-2" use:enhance>
			<input type="hidden" name="init-data" value={initData} />
			<button class="rounded p-3 bg-tg-secondary-bg-color hover:bg-tg-button-color"
				>Авторизуватися</button
			>
		</form>
	{:else}
		<div class="text- text-center mt-2 text-tg-hint-color">🔄 Отримання даних для авторизації</div>
	{/if}
</div>

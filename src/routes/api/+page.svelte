<script lang="ts">
	import { goto } from "$app/navigation";
	import { showBackButton } from "$lib/utilities";
	import { onMount } from "svelte";

  onMount(() => showBackButton(() => goto('/')));
</script>

<h1>API</h1>

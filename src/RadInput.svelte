<script>
	import {getEventsAction,getAttributesAction} from 'svelte-chota/cmp/utils';
	import {onMount} from 'svelte';	
	import {current_component} from 'svelte/internal';

	export let value = '';
	export let group = '';

	const events = getEventsAction(current_component);
	const attrs = getAttributesAction(current_component);

	let checked = false;
	let labeled = $$props.hasOwnProperty('$$slots');

	function handleChange() {
		group = value;
	}
	
	$: checked = (group === value); 
</script>

{#if labeled}
<label>
    <input type="radio" class="radmax"
		on:change={handleChange}
		use:events	
		{checked}
	/> 
    <slot />
</label>
{:else}
<input type="radio" class="radmax"
	on:change={handleChange}
	use:events use:attrs={$$props}
	{checked}
/> 
{/if}

<style>

	.radmax
	{
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		display: inline-block;
		position: relative;
		background-color: #f1f1f1;
		color: #666;
		top: 10px;
		height: 30px;
		width: 30px;
		border: 0;
		border-radius: 50px;
		cursor: pointer;     
		margin-right: 7px;
		outline: none;
	}
	.radmax:checked::before
	{
		position: absolute;
		font: 13px/1;
		left: 11px;
		top: 1px;
		content: '\02143';
		transform: rotate(40deg);
	}
	.radmax:hover
	{
		background-color: #f7f7f7;
	}
	
	.radmax:checked
	{
		background-color: #f1f1f1;
	} 

	label
	{
		font: 15px/1.7;
		color: #333;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		cursor: pointer;
	}

</style>
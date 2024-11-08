<script lang="ts">
	import Copy from '$components/copy.svelte';
	import Modal from '$components/modal.svelte';
	import Output from '$components/output.svelte';
	import { objectKeys } from '$helpers/object';
	import { fetchStream } from '$helpers/stream';
	import { getParamsFromForm, getQueryOption, hasParams, queryOptions } from '$lib/query';
	import { key } from '$stores/key';
	import Button from '$UI/button.svelte';
	import Combobox from '$components/combobox.svelte';
	import Select from '$UI/select.svelte';
	import { GPT, gpt } from '$stores/gpt';

	let optionKey = objectKeys(queryOptions)[0];
	$: option = getQueryOption(optionKey);

	let useAdvanced = false;
	const resetAdvanced = () => (useAdvanced = false);
	$: if (option) resetAdvanced();

	enum ErrorCode {
		NoKey = 'Set your API key',
		Generic = 'Failed to contact OpenAI :('
	}
	let error: ErrorCode | null = null;
	let loading = false;

	let input = '';
	let output = '';
	$: optionKey && (output = '');
	let settingsOpen = false;

	async function search(e: SubmitEvent) {
		if (loading || !input) return;
		output = '';
		error = null;
		loading = true;

		const form = e.target as HTMLFormElement;
		const params = hasParams(option) ? getParamsFromForm(form, option.params) : undefined;

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				body: JSON.stringify({ input, type: optionKey, key: $key, params, model: $gpt }),
				headers: {
					'content-type': 'application/json'
				}
			});

			if (!response.ok) throw new Error('Network response was not ok');

			await fetchStream(response, (chunk) => {
				output += chunk;
			});
		} catch (err) {
			error = $key ? ErrorCode.Generic : ErrorCode.NoKey;
		}

		loading = false;
	}

	$: if ($key) error = null;
</script>

<svelte:head>
	<title>LangBridge</title>
	<meta name="description" content="Convert code to your programming language of choice" />
</svelte:head>

<form
	class="relative flex min-h-screen flex-col justify-between gap-4 overflow-hidden pb-8"
	on:submit={search}
>
	<div class="bg" />

	<div class="mx-auto w-full max-w-7xl px-2 lg:px-4">
		<!-- Hero -->
		<h1 class="mx-auto mt-16 max-w-5xl text-center text-3xl text-gray-600 font-bold lg:text-4xl lg:leading-tight">
			LangBridge——编程语言多系桥接<span class="gradient-text"></span>
			<span class="gradient-text"></span>
		</h1>

		<!-- Input and Output -->
		<div class="mt-8 grid w-full gap-4 lg:grid-cols-2">
			<div class="flex h-[20rem] flex-col lg:h-[40rem]">
				<label for="input" class="font-semibold">输入</label>
				<textarea
					bind:value={input}
					name="input"
					class="textarea mt-2 w-full grow overflow-auto"
					placeholder="在这里输入代码..."
				/>
			</div>
			<div class="flex h-[20rem] flex-col lg:h-[40rem]">
				<div class="flex items-center justify-between">
					<label for="output" class="font-semibold">输出</label>
					{#if output}
						<Copy value={output} />
					{/if}
				</div>

				<Output value={output} lang={option.lang} />
			</div>
		</div>

		<!-- Button and Language selector -->
		<div class="mt-8 flex items-center justify-center gap-4">
			<Button {loading} disabled={!input.trim()} type="submit">转换</Button>
			<span class="text-black">to</span>
			<Combobox
				bind:value={optionKey}
				options={Object.entries(queryOptions).map(([key, { label, icon }]) => ({
					value: key,
					label,
					icon
				}))}
			/>
		</div>

		<!-- Advanced options -->
		{#if hasParams(option)}
			<div
				class="mt-8 flex items-center justify-center gap-2"
				class:opacity-50={!useAdvanced}
				class:opacity-100={useAdvanced}
			>
				<input type="checkbox" class="checkbox" id="advanced" bind:checked={useAdvanced} />
				<label for="advanced" class="text-black">使用高级选项</label>
			</div>

			{#if useAdvanced}
				<div class="params-wrapper">
					{#each Object.keys(option.params) as key}
						{@const param = option.params[key]}
						<div
							class="flex justify-start items-center gap-2"
							class:flex-row-reverse={param.type === 'boolean'}
							class:justify-end={param.type === 'boolean'}
						>
							<label for={key}>{param.label}</label>
							{#if param.type === 'boolean'}
								<input type="checkbox" name={key} id={key} />
							{:else if param.type === 'string'}
								<Select name={key}>
									{#each param.values as value}
										<option {value}>{value}</option>
									{/each}
								</Select>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{/if}

		{#if error === ErrorCode.Generic}
			<p class="mt-4 text-center text-red-500">{error}</p>
		{/if}
		{#if error === ErrorCode.NoKey}
			<button
				class="mx-auto mt-4 block text-red-500 underline hover:text-red-400"
				on:click={() => (settingsOpen = true)}
				type="button"
			>
				设置你的API key
			</button>
		{/if}
	</div>

	<footer class="text-center">
		<p class="mt-8 text-gray-500">
			由 <a
				class="text-orange-400 underline hover:text-orange-200"
				href="https://www.ecnu.edu.cn/"
				target="_blank"
			>
				啊队队队
			</a>
			制作
		</p>
		<p class="mt-1 text-sm text-gray-500">注意：我们的LangBridge并不完全准确</p>
		<p class="text-sm text-gray-500">
			<button
				type="button"
				class="underline hover:text-gray-400"
				on:click={() => (settingsOpen = true)}
			>
				设置
			</button>
			-
			<a
				href="https://github.com/fireflyxxx/LangBridge"
				target="_blank"
				class="underline hover:text-gray-400"
			>
				项目文件
			</a>
		</p>
	</footer>
</form>

<Modal bind:open={settingsOpen} title="设置">
	<div class="flex flex-col gap-2">
		<label class="font-semibold text-gray-600" for="api-key">GPT版本: </label>
		<Select bind:value={$gpt}>
			<option value={GPT['three-dot-five']}>GPT 3.5-turbo</option>
			<option value={GPT.four}>GPT 4</option>
		</Select>
	</div>

	{#if $gpt === GPT.four}
		<p class="border-l-2 border-orange-500  text-orange-500 text-sm py-1 px-2 mt-2" role="alert">
			请确保您的API Key可以访问GPT-4
		</p>
	{/if}

	<div class="flex flex-col gap-2 mt-4">
		<label class="font-semibold text-gray-600" for="api-key">API key: </label>
		<input class="input px-2 py-2" type="password" id="api-key" bind:value={$key} />
	</div>

	<p class="mt-2 text-sm text-gray-700">
		点击<a
			class="underline hover:opacity-75"
			href="https://platform.openai.com/account/api-keys"
			target="_blank">这里</a
		>获取API Key
	</p>
</Modal>

<style lang="postcss">
    .gradient-text {
        background: linear-gradient(90deg, theme('colors.orange.500'), theme('colors.red.500'));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .bg {
        background-color: theme('colors.white');  /* 纯白色背景 */
        position: fixed;  /* 使用 fixed 定位，使其相对于视口定位 */
        top: 0;           /* 顶部位置为 0 */
        left: 0;          /* 左侧位置为 0 */
        width: 100%;      /* 宽度为 100% */
        height: 100%;     /* 高度为 100% */
        z-index: -1;      /* 确保背景层在所有内容之下 */
    }

    /*:global(.shiki) {*/
    /*    background-color: black !important;*/
    /*    color: black !important;*/
    /*    white-space: pre-wrap;*/
    /*}*/

    body, .params-wrapper {/*使用高级选项文本*/
        background-color: theme('colors.white');
        color: theme('colors.gray.800');
    }

    .params-wrapper {/*使用高级选项文本框背景 */
        @apply mx-auto;
        display: grid;

        gap: theme('spacing.4');

        background-color: theme('colors.gray.200');
        border-radius: theme('borderRadius.md');
        padding: theme('spacing.4');

        margin-top: theme('spacing.4');
        max-width: theme('maxWidth.xs');
    }

    textarea, input {
        background-color: theme('colors.white');/*输入框*/
        color: theme('colors.black');/*输入文本*/
    }

    @media screen(lg) {
        .params-wrapper {
            grid-template-columns: repeat(1, minmax(0, 1fr));
        }
    }
</style>
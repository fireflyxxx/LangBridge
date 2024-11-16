import { localStorageWritable } from '$helpers/store';

export enum GPT {
	'tongyi' = 'qwen-vl-max',
	'four' = 'gpt-4'
}

export const gpt = localStorageWritable<GPT>('openai-gpt-version', GPT['tongyi']);

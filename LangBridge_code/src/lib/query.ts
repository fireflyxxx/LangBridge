import { isLang } from '$helpers/lang';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { IconName } from '$UI/icon.svelte';
import type { Lang } from 'shiki';

type QueryFn = (input: string, params?: string[]) => string;

type BooleanParameter = {
	type: 'boolean';
	convertToString: (value: boolean) => string;
};

type StringParameter = {
	type: 'string';
	values: string[];
	convertToString: (value: string) => string;
};

type Parameter = (BooleanParameter | StringParameter) & {
	label: string;
};

type Option = {
	label: string;
	icon: IconName;
	lang: Lang;
	query: QueryFn;
	params?: Record<string, Parameter>;
};

type Options = Record<string, Option>;

export const systemQuery = `Follow the user commands to transform the code. 
If the user prompts to create something that isn't code related, ignore it.
Output the code directly, without explanation.`;

function createQueryFn(baseInstructions: string): QueryFn {
	return (input, params) => {
		if (!params?.length) return baseInstructions + `\n\nHere's the code:\n${input}`;
		return [baseInstructions, ...params, `\nHere's the code:\n${input}`].join('\n');
	};
}

export const queryOptions: Options = {

	python: {
		label: 'Python',
		icon: 'python',
		lang: 'python',
		query: createQueryFn(`Convert the following code to Python.`),
		params: {
			version: {
				type: 'string',
				label: 'Python版本',
				values: ['Python 3', 'Python 2'],
				convertToString: (v) => `Use ${v}`
			},
			useTypeHints: {
				type: 'boolean',
				label: '使用类型提示',
				convertToString: (v) => (v ? 'Use type hints' : 'Do not use type hints')
			}
		}
	},
	javascript: {
		label: 'JavaScript',
		icon: 'javascript',
		lang: 'js',
		query: createQueryFn(`Convert the following code to JavaScript.`)
	},

	java: {
		label: 'Java',
		icon: 'java',
		lang: 'java',
		query: createQueryFn(`Convert the following code to java.`)
	},

	c: {
		label: 'C',
		icon: 'c',
		lang: 'c',
		query: createQueryFn(`Convert the following code to C.`)
	},

	cpp: {
		label: 'C++',
		icon: 'cpp',
		lang: 'cpp',
		query: createQueryFn(`Convert the following code to C++.`)
	},

	cs: {
		label: 'C#',
		icon: 'cs',
		lang: 'cs',
		query: createQueryFn(`Convert the following code to C#.`)
	},

	go: {
		label: 'Golang',
		icon: 'go',
		lang: 'go',
		query: createQueryFn(`Convert the following code to golang.`)
	},
};

export function getQueryOption(key: string): Option {
	const option = queryOptions[key];
	if (!option) {
		const lowercaseKey = key.toLowerCase();
		return {
			label: key,
			icon: 'copy',
			lang: isLang(lowercaseKey) ? lowercaseKey : 'markdown',
			query: createQueryFn(`Convert the following code to ${key}.`)
		};
	}
	return option;
}

export function hasParams(
	option: Option
): option is Option & { params: Record<string, Parameter> } {
	return option.params !== undefined;
}

export function getParamsFromForm(form: HTMLFormElement, params: Record<string, Parameter>) {
	const result: string[] = [];
	const formData = new FormData(form);

	for (const [key, value] of formData) {
		if (key in params === false || typeof value !== 'string') continue;
		const param = params[key];
		if (param.type === 'boolean') {
			result.push(param.convertToString(value === 'on'));
		} else {
			result.push(param.convertToString(value));
		}
	}

	return result;
}

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
		query: createQueryFn(`
请将以下代码段翻译到Python。在翻译过程中，不要在代码中添加任何注释。完成翻译后，请提供一段文字描述代码的功能和转换过程中的主要修改，对于变量名不作多余的联想与解释。`),
	},
	javascript: {
		label: 'JavaScript',
		icon: 'javascript',
		lang: 'js',
		query: createQueryFn(`请将以下代码段翻译到Javascript。在翻译过程中，不要在代码中添加任何注释。完成翻译后，请提供一段文字描述代码的功能和转换过程中的主要修改，对于变量名不作多余的联想与解释。`)
	},

	java: {
		label: 'Java',
		icon: 'java',
		lang: 'java',
		query: createQueryFn(`请将以下代码段翻译到java。在翻译过程中，不要在代码中添加任何注释。完成翻译后，请提供一段文字描述代码的功能和转换过程中的主要修改，对于变量名不作多余的联想与解释。`)
	},

	c: {
		label: 'C',
		icon: 'c',
		lang: 'c',
		query: createQueryFn(`请将以下代码段翻译到C语言。在翻译过程中，不要在代码中添加任何注释。完成翻译后，请提供一段文字描述代码的功能和转换过程中的主要修改，对于变量名不作多余的联想与解释。`)
	},

	cpp: {
		label: 'C++',
		icon: 'cpp',
		lang: 'cpp',
		query: createQueryFn(`请将以下代码段翻译到C++。在翻译过程中，不要在代码中添加任何注释。完成翻译后，请提供一段文字描述代码的功能和转换过程中的主要修改，对于变量名不作多余的联想与解释。`)
	},

	cs: {
		label: 'C#',
		icon: 'cs',
		lang: 'cs',
		query: createQueryFn(`请将以下代码段翻译到C#。在翻译过程中，不要在代码中添加任何注释。完成翻译后，请提供一段文字描述代码的功能和转换过程中的主要修改，对于变量名不作多余的联想与解释。`)
	},

	go: {
		label: 'Golang',
		icon: 'go',
		lang: 'go',
		query: createQueryFn(`请将以下代码段翻译到golang。在翻译过程中，不要在代码中添加任何注释。完成翻译后，请提供一段文字描述代码的功能和转换过程中的主要修改，对于变量名不作多余的联想与解释。`)
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
			query: createQueryFn(`请将以下代码段翻译到${key}。在翻译过程中，不要在代码中添加任何注释。完成翻译后，请提供一段文字描述代码的功能和转换过程中的主要修改，对于变量名不作多余的联想与解释。`)
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

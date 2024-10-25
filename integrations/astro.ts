import type { AstroIntegration } from 'astro'
import { Commantor, type Options } from 'commantor'
import fs from 'node:fs/promises'
import path from 'node:path/posix'

const commantor = new Commantor({})
let config: Options & { path: string, hooks?: Record<string, Array<string> | string> }

async function runHook(it: string) {
	let hooks = config.hooks?.[it] ?? []
	if (typeof hooks === 'string') {
		hooks = [hooks]
	}
	for await (const hook of hooks) {
		await commantor.run(hook)
	}
}

interface Params {
	path?: string
}

/**
 * launch the integration
 * @returns the routing integration
 */
const integration: (params?: Params) => AstroIntegration = (initCtx) => ({
	name: 'Routing',
	hooks: {
		'astro:config:setup': async () => {
			const test = await fs.readFile(initCtx?.path ?? './cmd.ts', 'utf8')

			// retrieve config from config file
			// eslint-disable-next-line no-eval
			config = eval('const t = ' + test.slice(test.indexOf('{'), test.lastIndexOf('}') + 1) + ';t') as typeof config

			// load commands into commantor
			await commantor.loadCommands(path.resolve(process.cwd(), config.path))

			// run the first hook
			await runHook('astro:config:setup')
		},
		'astro:config:done': async () => runHook('astro:config:done'),
		'astro:server:setup': async () => runHook('astro:server:setup'),
		'astro:server:start': async () => runHook('astro:server:start'),
		'astro:server:done': async () => runHook('astro:server:done'),
		'astro:build:start': async () => runHook('astro:build:start'),
		'astro:build:setup': async () => runHook('astro:build:setup'),
		'astro:build:generated': async () => runHook('astro:build:generated'),
		'astro:build:ssr': async () => runHook('astro:build:ssr'),
		'astro:build:done': async () => runHook('astro:build:done')
	}
})

export default integration

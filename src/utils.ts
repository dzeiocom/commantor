import fs from 'node:fs/promises'
import path from 'node:path'
import type { Command, Options } from './interfaces'

export function parseParams(items: Array<string>): {
	params: Array<string>
	options: Record<string, string | true>
} {
	const options: Record<string, string | true> = {}
	const params: Array<string> = []
	let currKey: string | null = null
	for (const item of items) {
		if (item.startsWith('-')) {
			if (currKey) {
				options[currKey] = true
			}
			currKey = item.slice(item.at(1) === '-' ? 2 : 1)
			if (currKey.includes('=')) {
				const [key, value] = currKey.split('=')
				options[key as string] = value as string
				currKey = null
			}
		} else if (currKey) {
			options[currKey] = item
			currKey = null
		} else {
			params.push(item)
		}
	}

	if (currKey) {
		options[currKey] = true
	}

	return {
		params,
		options
	}
}

export async function listfiles(folder: string): Promise<Array<string>> {
	const files = await fs.readdir(folder)
	const res: Array<string> = []
	for (const file of files) {
		const item = `${folder}${path.sep}${file}`
		if ((await fs.stat(item)).isDirectory()) {
			res.push(...(await listfiles(item)))
		} else {
			res.push(item)
		}
	}
	return res
}

export async function getCommands(basePath: string, opts?: Options): Promise<Array<{ path: string, cmd: Command }>> {
	let dir: string
	try {
		dir = __dirname
	} catch {
		dir = import.meta.dirname
	}
	if (!dir) {
		throw new Error('the current directory is not obtainable through __dirname or import.meta.dirname :(')
	}
	const res: Awaited<ReturnType<typeof getCommands>> = []
	for (const file of await listfiles(basePath)) {
		if (opts?.debug) {
			console.log('debug: loading', file)
		}

		try {
			const imported = await import(path.relative(dir, file)).then((it) => it.default)

			res.push({
				path: file,
				cmd: imported
			})
		} catch (e) {
			if (opts?.debug) {
				console.error('debug:', e)
				console.error('debug: couldn\'t load command from', file)
			}
		}
	}
	return res
}

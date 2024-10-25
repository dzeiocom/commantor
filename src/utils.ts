import fs from 'node:fs/promises'
import path from 'node:path/posix'
import { Command } from './interfaces'

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
				options[key] = value
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
		const path = `${folder}/${file}`
		if ((await fs.stat(path)).isDirectory()) {
			res.push(...(await listfiles(path)))
		} else {
			res.push(path)
		}
	}
	return res
}

export async function getCommands(basePath: string): Promise<Array<{ path: string, cmd: Command }>> {
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
		console.log('loading', file)

		try {
			const imported = await import(path.relative(dir, file)).then((it) => it.default)

			res.push({
				path: file,
				cmd: imported
			})
		} catch (e) {
			console.error(e)
			console.error('couldn\'t load command from', file)
		}
	}
	return res
}

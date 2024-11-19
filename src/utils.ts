import fs from 'node:fs/promises'
import path from 'node:path'
import type { Command, Options } from './interfaces'

// --help -h -pouet --pokemon pouet --pokemon=pouet
// if `-`.length === 1

function findParamByNameOrAliases(key: string, definition: Command['params']) {
	for (const def of definition ?? []) {
		if (def.name === key || def.aliases?.includes(key)) {
			return def
		}
	}
	return undefined
}

export function parseParams(items: Array<string>, definition: Command['params']): {
	params: Array<string>
	options: Record<string, string | true | Array<string>>
} {
	const options: Record<string, string | true | Array<string>> = {}
	const params: Array<string> = []
	let currKey: NonNullable<Command['params']>[number] | undefined = undefined
	let idx = 0
	let item = items[idx]
	const max = Math.min(1000, items.length * 4)
	let loopIndex = 0
	while (idx < items.length && loopIndex < max) {
		loopIndex++
		if (item.startsWith('-')) {
			const isShortKey = item.at(1) !== '-'

			// if already existing key in process, expose it if possible
			if (currKey && (currKey.value === 'boolean' || currKey?.valueOptional)) {
				options[currKey.name] = true
			} else if (currKey && !options[currKey.name]) {
				console.error(`the key ${currKey.name} ${item} should have a value, instead it is empty !`)
			}

			// reset currKey
			currKey = undefined

			// find the param by it's key
			if (isShortKey) {
				currKey = findParamByNameOrAliases(item.at(1)!, definition)
			} else {
				let keyTmp = item.slice(2)
				if (keyTmp.includes('=')) {
					keyTmp = keyTmp.slice(0, keyTmp.indexOf('='))
				}
				currKey = findParamByNameOrAliases(keyTmp, definition)
			}

			// param not found :(
			if (!currKey) {
				console.error(`parameter ${item} is not available for the current command`)
				item = items[++idx]
				continue
			}

			// current param is a boolean
			if(currKey.value === 'boolean') {
				options[currKey.name] = true
				currKey = undefined
				if (item.includes('=')) {
					console.warn('item contains an invalid value, ignoring it')
				}
				item = items[++idx]
				continue
			}

			// split text with equal
			if (item.includes('=')) {
				const value = item.slice(item.indexOf('=') + 1)
				item = value
				continue
			}
		} else if (currKey) {
			if (currKey.multiple) {
				if (!options[currKey.name]) {
					options[currKey.name] = []
				}
				(options[currKey.name] as Array<string>).push(...item.split(','))
			} else {
				options[currKey.name] = item
				currKey = undefined
			}
		} else {
			params.push(item)
		}
		item = items[++idx]
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

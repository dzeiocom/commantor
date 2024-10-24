import fs from 'node:fs/promises'
import path from 'node:path/posix'
import help from './help'

/**
 * The options given to startup the library
 */
interface Options {
	/**
	* the Main script current directory
	*/
	path: string
}

/**
 * The context given the the command
 */
interface Context extends Options {
	/**
	 * The list of arguments given by the client
	 */
	args: Array<string>
	params: Record<string, string | boolean>
	/**
	 * The list of detected commands in the repo
	 */
	commands: Array<Command>
	/**
	 * The command string used
	 */
	command: string

	/**
	 * the current working directory
	 */
	cwd: string
}

/**
 * The response wanted from the library
 */
export interface CommandResponse {
	code: number
}

export interface Command {
	name: string
	description?: string
	params?: Array<{
		name: string
		aliases?: Array<string>
		description?: string
		value?: 'string' | 'boolean' | 'number'
	}>
	run(input: Context): Promise<CommandResponse> | CommandResponse
}

const builtinCommands: Array<Command> = [
	help
]

function parseParams(items: Array<string>): {
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

async function createContext(opts: Options): Promise<Context> {

	const { params, options } = parseParams(process.argv.slice(2))
	const ctx = {
		params: options,
		args: params.slice(1),
		commands: await getCommands(path.resolve(process.cwd(), opts.path)),
		command: params[0] ?? 'help',
		cwd: process.cwd(),
		...opts
	}
	return ctx
}

async function listfiles(folder: string): Promise<Array<string>> {
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

async function getCommands(basePath: string): Promise<Array<Command>> {
	const files = (await listfiles(basePath))
		.map((it) => import(path.relative(__dirname, it)).then((it) => it.default))
	return builtinCommands.concat(await Promise.all(files))
}

/**
 * Command Director = Commantor BREF
 * @param opts The options to specify how the
 */
export default async function (opts: Options) {
	const context = await createContext(opts)
	for (const command of context.commands) {
		if (command.name === context.command) {
			const res = await command.run(context)
			process.exit(res.code)
		}
	}

	console.log(
		`command "${context.command}" not found, please use "help" to get the list of commands`,
	)
}

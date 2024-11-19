
/**
 * The options given to startup the library
 */
export interface Options {
	debug?: boolean
 }

export type AstroHooks = 'astro:config:setu' | 'astro:config:done' |
	'astro:server:setup' | 'astro:server:start' |
	'astro:server:done' | 'astro:build:start' |
	'astro:build:setup' | 'astro:build:generated' |
	'astro:build:ssr' | 'astro:build:done'

/**
 * The context given the the command
 */
export interface Context extends Options {
	/**
	 * The list of arguments given by the client
	 */
	args: Array<string>
	params: Record<string, string | true | Array<string>>
	/**
	 * The list of detected commands in the repo
	 */
	commands: Array<LoadedCommand>
	/**
	 * The command string used
	 */
	command: string

	/**
	 * the current working directory
	 */
	cwd: string

	logger: Record<'info' | 'log' | 'warn' | 'err' | 'debug' | 'error', (...params: Parameters<typeof console.log>) => void>
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
		multiple?: boolean
		valueOptional?: boolean
		value?: 'string' | 'boolean' | 'number'
	}>
	run(input: Context): Promise<CommandResponse> | CommandResponse
}

export interface LoadedCommand extends Command {
	/**
	 * The absolute path of the command file
	 */
	path?: string | undefined
}

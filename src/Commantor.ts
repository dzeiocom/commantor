import codegen from './commands/code/generate';
import help from './commands/help';
import type { Command, CommandResponse, Context, LoadedCommand, Options } from './interfaces';
import { getCommands, parseParams } from './utils';

export default class Commantor {
	// the loaded commands
	private commands: Array<LoadedCommand> = [
		help,
		codegen
	]

	public constructor(public readonly options: Options) { }

	/**
	 * Load commands from a specific folder and subfolders
	 */
	public async loadCommands(basePath: string) {
		const cmds = await getCommands(basePath)
		for (const cmd of cmds) {
			this.addCommand(cmd.cmd, cmd.path)
		}
	}

	public addCommand(cmd: Command, path?: string) {
		const loaded = cmd as LoadedCommand
		loaded.path = path
		this.commands.push(loaded)
	}

	public async run(args: Array<string> | string): Promise<CommandResponse> {
		const ctx = this.createContext(typeof args === 'string' ? args.split(' ') : args)

		for (const command of ctx.commands) {
			if (command.name === ctx.command) {
				const res = await command.run(ctx)
				return res
			}
		}
		console.log(
			`command "${ctx.command}" not found, please use "help" to get the list of commands`,
		)

		return {
			code: 255
		}
	}

	private createContext(command: Array<string>): Context {
		const { params, options } = parseParams(command)
		const ctx = {
			params: options,
			args: params.slice(1),
			commands: this.commands,
			command: params[0] ?? 'help',
			cwd: process.cwd()
		}
		return ctx
	}
}

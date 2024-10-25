import fs from 'node:fs/promises'
import path from 'node:path/posix'
import Commantor from './Commantor'
import { Command, Options } from './interfaces'

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

async function getCommands(basePath: string): Promise<Array<{path: string, cmd: Command}>> {
	const files = (await listfiles(basePath))
		.map(async (it) => ({
			path: it,
			cmd: await import(path.relative(__dirname, it)).then((it) => it.default)
		}))
	return await Promise.all(files)
}

/**
 * Command Director = Commantor BREF
 * @param opts The options to specify how the
 */
export default async function (options: { path: string } & Options) {
	const commandor = new Commantor(options)
	const cmds = await getCommands(path.resolve(process.cwd(), options.path))
	for (const cmd of cmds) {
		commandor.addCommand(cmd.cmd, cmd.path)
	}

	const res = await commandor.run(process.argv.slice(2))
	process.exit(res.code)
}

export * from './interfaces'
export {
	Commantor
}


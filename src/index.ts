import path from 'node:path'
import Commantor from './Commantor'
import type { Options } from './interfaces'

/**
 * Command Director = Commantor
 * @param opts The options to specify how the
 */
export default async function <Hooks extends string>(options: { path: string, hooks?: Partial<Record<Hooks, Array<string> | string>> } & Options) {
	const commantor = new Commantor(options)
	await commantor.loadCommands(path.resolve(process.cwd(), options.path), options)

	const res = await commantor.run(process.argv.slice(2))
	process.exit(res.code)
}

export * from './interfaces'
export {
	Commantor
}


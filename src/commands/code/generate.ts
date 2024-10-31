import fs from 'node:fs/promises'
import path from 'node:path'
import type { Command } from "../.."
export default {
	name: 'commantor:generate',
	description: 'Generate a code accessible version of Commantor at the specified location',
	async run({ commands, args, logger }) {
		let location = args[0]
		if (args.length !== 1 || !location) {
			logger.log('Missing the path argument')
			return {
				code: 1
			}
		}

		if (!location.endsWith('.ts')) {
			logger.error('Please name a file ending with `.ts`')
			return {
				code: 1
			}
		}
		location = path.resolve(location)
		let file = `import { Commantor } from 'commantor'\n`
		const folder = location.slice(0, location.lastIndexOf(path.sep))

		let imports: Array<string> = []
		for (const command of commands) {
			if (!command.path) {
				logger.debug('skipping', command.name, 'due to missing path')
				continue
			}
			const importName = command.name.replace(/[.:]/g, '')
			imports.push(importName)
			logger.debug('Adding', command.path)
			file += `import ${importName} from './${path.relative(folder, command.path).replace(/\\/g, '/')}'\n`
		}
		file += `
const cmd = new Commantor({})

${imports.map((it) => `cmd.addCommand(${it})`).join('\n')}

export default cmd
`
		await fs.mkdir(folder, { recursive: true })
		await fs.writeFile(location, file)
		logger.info('done making', location)
		return {
			code: 0,
		}
	}
} as Command

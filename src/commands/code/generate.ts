import fs from 'node:fs/promises'
import path from 'node:path/posix'
import { Command } from "../.."
export default {
	name: 'commantor:generate',
	description: 'Generate a code accessible version of Commantor at the specified location',
	async run({ commands, args }) {
		if (args.length !== 1) {
			console.log('Missing the path argument')
			return {
				code: 1
			}
		}
		let location = args[0]
		if (!location.endsWith('.ts')) {
			console.error('Please name a file ending with `.ts`')
			return {
				code: 1
			}
		}
		location = path.resolve(location)
		let file = `import { Commantor } from 'commantor'\n`
		const folder = location.slice(0, location.lastIndexOf('/'))

		let imports: Array<string> = []
		for (const command of commands) {
			if (!command.path) {
				continue
			}
			const importName = command.name.replace(/[.:]/g, '')
			imports.push(importName)
			file += `import ${importName} from './${path.relative(folder, command.path)}'\n`
		}
		file += `
const cmd = new Commantor({})

${imports.map((it) => `cmd.addCommand(${it})`).join('\n')}

export default cmd
`
		await fs.mkdir(folder, { recursive: true })
		await fs.writeFile(location, file)
		return {
			code: 0,
		}
	}
} as Command

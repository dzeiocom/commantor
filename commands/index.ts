import type { Command } from '../src'

const command: Command = {
	name: 'test',
	description: 'Get the current version of the database',
	async run(ctx) {
		console.log(ctx)
		return {
			code: 0
		}
	},
}
export default command

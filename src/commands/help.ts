import type { Command } from ".."

export default {
	name: 'help',
	description: '',
	run({ commands }) {
		console.table(
			commands.map((command) => ({
				name: command.name,
				description: command.description ?? 'n/a',
			})),
		)
		return {
			code: 0,
		}
	}
} as Command

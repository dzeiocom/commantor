import type { Command } from '../src'

const command: Command = {
	name: 'test',
	description: 'Get the current version of the database',
	params: [{
		name: 'help',
		aliases: ['h'],
		value: 'boolean'
	}, {
		name: 'scrapper',
		aliases: ['source', 'website', 'w'],
		value: 'string',
	}, {
		name: 'sets',
		aliases: ['s'],
		value: 'string',
		multiple: true
	}, {
		name: 'languages',
		aliases: ['langs', 'l'],
		value: 'string',
		multiple: true
	}],
	async run({ params, args }) {
		console.log(params, args)
		return {
			code: 0
		}
	},
}
export default command

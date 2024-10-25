# Commantor

Create a file named `cmd.ts` in you workspace then paste the code below AND CHANGE the path given

```ts
#!/usr/bin/env bun
/**
 * Initialize Commantor for a terminal usage
 *
 * Simply run `./cmd.ts` to check it out !
 */
import commantor from 'commantor'

void commantor({
	path: './src/commands',
})
```

example command to get the current version of the database :

```ts
import type { Command } from 'commantor'
import DaoFactory from 'models/DaoFactory'

const command: Command = {
	name: 'migrations:current',
	description: 'Get the current version of the database',
	async run() {
		const client = await DaoFactory.client()
		await client.connect()
		const ver = await client.getVersion()
		if (ver < 0) {
			console.log('no database :(')
		} else {
			console.log(`Current database version: ${new Date(ver)}`)
		}
		return {
			code: 0
		}
	},
}
export default command
```

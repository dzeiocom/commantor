export function parseParams(items: Array<string>): {
	params: Array<string>
	options: Record<string, string | true>
} {
	const options: Record<string, string | true> = {}
	const params: Array<string> = []
	let currKey: string | null = null
	for (const item of items) {
		if (item.startsWith('-')) {
			if (currKey) {
				options[currKey] = true
			}
			currKey = item.slice(item.at(1) === '-' ? 2 : 1)
			if (currKey.includes('=')) {
				const [key, value] = currKey.split('=')
				options[key] = value
				currKey = null
			}
		} else if (currKey) {
			options[currKey] = item
			currKey = null
		} else {
			params.push(item)
		}
	}

	if (currKey) {
		options[currKey] = true
	}

	return {
		params,
		options
	}
}

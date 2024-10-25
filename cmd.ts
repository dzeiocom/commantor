#!/usr/bin/env bun
/**
 * Initialize Commantor for a terminal usage
 *
 * Simply run `./cmd.ts` to check it out !
 */
import commantor, { AstroHooks } from './src'

void commantor<AstroHooks>({
	path: './commands'
})

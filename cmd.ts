#!/usr/bin/env bun
/**
 * This file is a shortcut to `src/commands/index.ts`
 *
 * It allows you to run commands that will change things in the codebase
 *
 * to start, run `./cmd.ts`
 */
import Commador from './src'

void Commador({
	path: './commands',
})

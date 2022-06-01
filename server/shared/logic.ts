import type { Player as Logic } from '../../api/types'
import { GRAVITY } from './consts'

import * as Rect from './rect'
import * as Level from './level'

const respawn = new Map<string, { accumulatedTime: number }>()

const respawnKey = (id: string) => id

export function queueRespawn(player: Logic) {
	player.enabled = false
	player.velocity.y = 0
	respawn.set(respawnKey(player.id), { accumulatedTime: 0 })
}

export function simRespawn(player: Logic, dt: number) {
	const key = respawnKey(player.id)
	if (respawn.has(key)) {
		const rs = respawn.get(key)!
		rs.accumulatedTime += dt
		if (rs.accumulatedTime >= 0.5) {
			respawn.delete(key)
			player.location.x = Math.max(180, player.location.x - 120)
			player.location.y = 220
			player.velocity.y = 0
			player.enabled = true
		}
	}
}

export function playerMove(x: number, y: number, player: Logic, dt: number) {
	if (!player.enabled) {
		return { x, y }
	}

	if (player.input.space) {
		player.velocity.y = -GRAVITY.y * 0.5
	}

	player.velocity.y = Math.min(250, player.velocity.y + GRAVITY.y * dt)

	x += player.velocity.x * dt
	y += player.velocity.y * dt

	return { x, y }
}

export function collisions(playerRect: Rect.Rectangle) {
	let died = false
	for (const pipe of Level.level.pipes) {
		if (!Rect.intersects(playerRect, pipe.rect)) {
			continue
		}
		died = true
	}

	// ground
	if (Rect.intersects(playerRect, Level.level.ground)) {
		died = true
	}

	// goal
	if (Rect.intersects(playerRect, Level.level.goal)) {
		return {
			goal: true,
		}
	}

	return {
		goal: false,
		died,
	}
}

export function end(player: Logic) {
	player.input.space = false
}

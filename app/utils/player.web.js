import AsyncStorage from '@react-native-async-storage/async-storage'
import { nextRandomIndex, prevRandomIndex, saveQueue } from '~/utils/tools'
import LocalPlayer from '~/utils/player/playerLocal'
import * as HeadlessPlayer from '~/utils/player/playerHeadless'
import State from '~/utils/playerState'

export const IS_DOCKER_HEADLESS = !!process.env.EXPO_PUBLIC_IS_HEADLESS

const getPlayer = () => global.webPlayerType === 'headless' ? HeadlessPlayer : LocalPlayer

export const switchPlayer = async (type) => {
	global.webPlayerType = type
	await AsyncStorage.setItem('webPlayerType', type)
}

export const initService = async () => {
	if (IS_DOCKER_HEADLESS) {
		const saved = await AsyncStorage.getItem('webPlayerType')
		global.webPlayerType = saved || 'headless'
	} else {
		global.webPlayerType = 'local'
		LocalPlayer.initService()
	}
}

export const initPlayer = async (songDispatch) => {
	return getPlayer().initPlayer(songDispatch)
}

export const useEvent = (song, songDispatch) => {
	if (global.webPlayerType === 'headless') HeadlessPlayer.useEvent(song, songDispatch, nextSong)
}

export const updateTime = () => {
	const localTime = LocalPlayer.updateTime()
	const headlessTime = HeadlessPlayer.updateTime()
	return global.webPlayerType === 'headless' ? headlessTime : localTime
}

export const downloadSong = async (url, _id) => fetch(url)

export const unloadSong = async () => { }

export const loadSong = async (config, queue, index) => { return getPlayer().loadSong(config, queue, index) }

export const playSong = async (config, songDispatch, queue, index) => {
	await loadSong(config, queue, index)
	songDispatch({ type: 'setQueue', queue, index })
	setRepeat(songDispatch, 'next')
	saveQueue(config, queue, index)
}

export const setIndex = async (config, songDispatch, queue, index) => {
	if (queue && index >= 0 && index < queue.length) {
		await loadSong(config, queue, index)
		songDispatch({ type: 'setIndex', index })
	}
}

export const nextSong = async (config, song, songDispatch) => {
	if (!song.queue) return
	if (song.actionEndOfSong === 'random') await setIndex(config, songDispatch, song.queue, nextRandomIndex())
	else {
		if (!global.repeatQueue && song.index === song.queue.length - 1) return
		await setIndex(config, songDispatch, song.queue, (song.index + 1) % song.queue.length)
	}
	if (song.actionEndOfSong === 'repeat') await setRepeat(songDispatch, 'next')
}

export const previousSong = async (config, song, songDispatch) => {
	if (!song.queue) return
	if (song.actionEndOfSong === 'random') await setIndex(config, songDispatch, song.queue, prevRandomIndex())
	else {
		if (!global.repeatQueue && song.index === 0) return
		await setIndex(config, songDispatch, song.queue, (song.queue.length + song.index - 1) % song.queue.length)
	}
	if (song.actionEndOfSong === 'repeat') await setRepeat(songDispatch, 'next')
}

export const reload = async () => { return getPlayer().reload() }

export const pauseSong = async () => { return getPlayer().pauseSong() }

export const resumeSong = async () => { return getPlayer().resumeSong() }

export const stopSong = async () => { return getPlayer().stopSong() }

export const setPosition = async (position) => { return getPlayer().setPosition(position) }

export const setVolume = async (volume) => { return getPlayer().setVolume(volume) }

export const getVolume = () => { return getPlayer().getVolume() }

export const updateVolume = () => { return getPlayer().updateVolume() }

export const secondToTime = (second) => {
	if (!second) return '00:00'
	if (second === Infinity) return '∞:∞'
	return `${String((second - second % 60) / 60).padStart(2, '0')}:${String((second - second % 1) % 60).padStart(2, '0')}`
}

export const tuktuktuk = (songDispatch) => { return getPlayer().tuktuktuk(songDispatch) }

export const setRepeat = async (songdispatch, action) => {
	await songdispatch({ type: 'setActionEndOfSong', action })
}

export const isVolumeSupported = () => { return getPlayer().isVolumeSupported() }

export const resetAudio = (songDispatch) => { return getPlayer().resetAudio(songDispatch) }

export const saveState = async () => { return getPlayer().saveState() }

export const restoreState = async (state) => {
	if (!state) return
	if (state.position > 0) await setPosition(state.position)
	if (state.isPlaying) await resumeSong()
}

export const removeFromQueue = async (songDispatch, index) => {
	songDispatch({ type: 'removeFromQueue', index })
}

export const addToQueue = (songDispatch, track, index = null) => {
	songDispatch({ type: 'addToQueue', track, index })
}

export default {
	initService,
	initPlayer,
	useEvent,
	switchPlayer,
	updateTime,
	playSong,
	nextSong,
	previousSong,
	pauseSong,
	resumeSong,
	stopSong,
	setPosition,
	setVolume,
	getVolume,
	isVolumeSupported,
	updateVolume,
	secondToTime,
	tuktuktuk,
	setRepeat,
	reload,
	resetAudio,
	addToQueue,
	removeFromQueue,
	setIndex,
	saveState,
	restoreState,
	State,
}

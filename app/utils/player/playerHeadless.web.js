import { configureBaseUrl } from '~/utils/remote/headlessApi'

configureBaseUrl(() => `http://${window.location.hostname}:${window.location.port}`)

export {
	initPlayer,
	useEvent,
	loadSong,
	pauseSong,
	resumeSong,
	stopSong,
	setPosition,
	setVolume,
	getVolume,
	updateTime,
	updateVolume,
	saveState,
	resetAudio,
	isVolumeSupported,
	downloadSong,
	unloadSong,
	tuktuktuk,
	reload,
} from '~/utils/remote/headlessApi'

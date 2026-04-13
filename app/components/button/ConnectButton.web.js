import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '~/contexts/theme'
import { useConfig } from '~/contexts/config'
import { useSong, useSongDispatch } from '~/contexts/song'
import IconButton from '~/components/button/IconButton'
import OptionsPopup from '~/components/popup/OptionsPopup'
import Player from '~/utils/player'
import { IS_DOCKER_HEADLESS } from '../../utils/player.web'

const ConnectButton = ({ size = 23, color = null, style = {} }) => {
	const { t } = useTranslation()
	const theme = useTheme()
	const config = useConfig()
	const song = useSong()
	const songDispatch = useSongDispatch()
	const [modalVisible, setModalVisible] = React.useState(false)
	const [playerType, setPlayerType] = React.useState(global.webPlayerType || 'headless')

	if (!IS_DOCKER_HEADLESS) return null

	const OUTPUT_TYPES = [
		{ name: t('Local'), value: 'local' },
		{ name: t('Remote'), value: 'headless' },
	]

	const switchTo = async (type) => {
		if (type === playerType) return
		setModalVisible(false)
		const savedState = await Player.saveState()
		await Player.stopSong()
		await Player.switchPlayer(type)
		setPlayerType(type)
		if (song?.queue && song?.index !== undefined) {
			await Player.playSong(config, songDispatch, song.queue, song.index)
			await Player.restoreState(savedState)
		}
	}

	const options = OUTPUT_TYPES.map((item) => ({
		name: item.name,
		icon: item.value === playerType ? 'check' : 'volume-up',
		onPress: () => switchTo(item.value),
	}))

	return (
		<>
			<IconButton
				icon="tv"
				style={style}
				color={playerType === 'headless' ? theme.primaryTouch : (color || theme.primaryText)}
				size={size}
				onPress={() => setModalVisible(true)}
			/>
			<OptionsPopup
				visible={modalVisible}
				close={() => setModalVisible(false)}
				options={options}
			/>
		</>
	)
}

export default ConnectButton

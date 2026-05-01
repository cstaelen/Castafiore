import React from 'react'
import { View, Text, Modal, ScrollView, Pressable, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/FontAwesome'

import { useTheme } from '~/contexts/theme'
import { useConfig } from '~/contexts/config'
import { useSong, useSongDispatch } from '~/contexts/song'
import IconButton from '~/components/button/IconButton'
import SlideBar from '~/components/button/SlideBar'
import Player from '~/utils/player'
import { IS_DOCKER_HEADLESS } from '~/utils/player.web'

const ConnectButton = ({ size = 23, color = null, style = {} }) => {
	const { t } = useTranslation()
	const theme = useTheme()
	const config = useConfig()
	const song = useSong()
	const songDispatch = useSongDispatch()
	const [modalVisible, setModalVisible] = React.useState(false)
	const [playerType, setPlayerType] = React.useState(global.webPlayerType || 'headless')
	const volume = Player.updateVolume()
	const { width } = useWindowDimensions()

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

	return (
		<>
			<IconButton
				icon="tv"
				style={style}
				color={playerType === 'headless' ? theme.primaryTouch : (color || theme.primaryText)}
				size={size}
				onPress={() => setModalVisible(true)}
			/>
			{modalVisible && (
				<Modal
					transparent={true}
					onRequestClose={() => setModalVisible(false)}
					statusBarTranslucent={true}
					visible={modalVisible}
				>
					<ScrollView
						style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}
						contentContainerStyle={{ justifyContent: 'flex-end', minHeight: '100%' }}
					>
						<Pressable
							onPress={() => setModalVisible(false)}
							style={{ width: '100%', flex: 1, minHeight: 100 }}
						/>
						<View style={{
							width: '100%',
							paddingTop: 15,
							paddingBottom: 30,
							backgroundColor: theme.secondaryBack,
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
						}}>
							{OUTPUT_TYPES.map((item) => (
								<Pressable
									key={item.value}
									onPress={() => switchTo(item.value)}
									style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 45, gap: 10 }}
								>
									<Icon
										name={item.value === playerType ? 'check' : 'volume-up'}
										size={14}
										color={theme.secondaryText}
										style={{ width: 25, textAlign: 'center' }}
									/>
									<Text style={{ color: theme.primaryText, fontSize: 16 }}>{item.name}</Text>
								</Pressable>
							))}
							<Pressable
								onPress={() => setModalVisible(false)}
								style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 45, gap: 10 }}
							>
								<Icon name="close" size={14} color={theme.secondaryText} style={{ width: 25, textAlign: 'center' }} />
								<Text style={{ color: theme.primaryText, fontSize: 16 }}>{t('Cancel')}</Text>
							</Pressable>
							{width < 768 && Player.isVolumeSupported() && (
								<View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 12, maxWidth: "300px" }}>
									<IconButton
										icon={volume ? 'volume-up' : 'volume-off'}
										size={18}
										color={theme.secondaryText}
										style={{ width: 25, alignItems: 'center' }}
										onPress={() => Player.setVolume(volume ? 0 : 1)}
									/>
									<SlideBar
										progress={volume}
										onStart={(progress) => Player.setVolume(progress)}
										onChange={(progress) => Player.setVolume(progress)}
										stylePress={{ flex: 1, height: 36, paddingVertical: 12 }}
										styleBar={{ width: '100%', height: '100%', borderRadius: 4, backgroundColor: theme.primaryBack, overflow: 'hidden' }}
										styleProgress={{ backgroundColor: theme.primaryTouch }}
										isBitogno={true}
									/>
								</View>
							)}
						</View>
					</ScrollView>
				</Modal>
			)}
		</>
	)
}

export default ConnectButton

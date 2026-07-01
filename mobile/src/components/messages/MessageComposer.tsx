import { SymbolView } from 'expo-symbols';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

type ChatComposerMessageType = 'text' | 'image' | 'audio' | 'sticker';

type ChatComposerPayload = {
    type: ChatComposerMessageType;
    text?: string;
    mediaUrl?: string;
    audioUri?: string;
    blob?: Blob;
    stickerUrl?: string;
};

type MessageComposerProps = {
    onSendText: (text: string) => void;
    onSend?: (payload: ChatComposerPayload) => void;
    onTyping?: () => void;
    onStopTyping?: () => void;
    onOpenImagePicker?: () => void;
    onOpenStickerPicker?: () => void;
    onOpenCamera?: () => void;
    onToggleMicrophone?: () => void;
};

export default function MessageComposer({
    onSendText,
    onSend,
    onTyping,
    onStopTyping,
    onOpenImagePicker,
    onOpenStickerPicker,
    onOpenCamera,
    onToggleMicrophone
}: MessageComposerProps) {
    const [text, setText] = useState('');
    const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const inputRef = useRef<TextInput>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const recordPulseAnim = useRef(new Animated.Value(1)).current;
    const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const recordingStartedAtRef = useRef<number | null>(null);
    const isRecordingRef = useRef(false);
    const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);

    const hasText = text.trim().length > 0;

    useEffect(() => {
        if (!isRecording) {
            recordPulseAnim.stopAnimation();
            recordPulseAnim.setValue(1);
            return;
        }

        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(recordPulseAnim, {
                    toValue: 1.25,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                }),
                Animated.timing(recordPulseAnim, {
                    toValue: 1,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                })
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [isRecording, recordPulseAnim]);

    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, []);

    function handleChangeText(value: string) {
        setText(value);

        if (value.trim()) {
            onTyping?.();
            return;
        }

        onStopTyping?.();
    }

    function handleSend() {
        const value = text.trim();

        if (!value) {
            return;
        }

        onSend?.({
            type: 'text',
            text: value
        });

        // onSendText(value);
        setText('');
        setIsPlusMenuOpen(false);
        onStopTyping?.();
    }

    function handlePlusPress() {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.92,
                duration: 80,
                useNativeDriver: true
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true
            })
        ]).start();

        setIsPlusMenuOpen(current => !current);
    }

    function handleMenuAction(callback?: () => void) {
        setIsPlusMenuOpen(false);
        callback?.();
    }

    async function startRecording() {
        try {
            setIsPlusMenuOpen(false);
            onToggleMicrophone?.();

            const permission = await AudioModule.requestRecordingPermissionsAsync();

            if (!permission.granted) {
                return;
            }

            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true
            });

            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();

            recordingStartedAtRef.current = Date.now();
            isRecordingRef.current = true;
            setRecordingTime(0);
            setIsRecording(true);

            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(current => current + 1);
            }, 1000);
        } catch (error) {
            console.warn('[MESSAGE_COMPOSER] start recording failed', error);
            clearRecordingState();
        }
    }

    async function cancelRecording() {
        try {
            if (audioRecorder.isRecording) {
                await audioRecorder.stop();
            }
        } catch (error) {
            console.warn('[MESSAGE_COMPOSER] cancel recording failed', error);
        } finally {
            await resetAudioMode();
            clearRecordingState();
        }
    }

    async function finishRecording() {
        const startedAt = recordingStartedAtRef.current;
        const durationMs = startedAt ? Date.now() - startedAt : 0;

        try {
            if (audioRecorder.isRecording) {
                await audioRecorder.stop();
            }

            if (durationMs < 1000) {
                console.log('[MESSAGE_COMPOSER] audio canceled because it is shorter than 1 second');
                return;
            }

            const audioUri = audioRecorder.uri;

            if (audioUri) {
                const response = await fetch(audioUri);
                const audioBlob: any = await response.blob();

                onSend?.({
                    type: 'audio',
                    blob: audioBlob,
                    audioUri,
                    mediaUrl: audioUri
                });
            }
        } catch (error) {
            console.warn('[MESSAGE_COMPOSER] finish recording failed', error);
        } finally {
            await resetAudioMode();
            clearRecordingState();
        }
    }

    async function resetAudioMode() {
        try {
            await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true
            });
        } catch (error) {
            console.warn('[MESSAGE_COMPOSER] reset audio mode failed', error);
        }
    }

    function clearRecordingState() {
        setIsRecording(false);
        setRecordingTime(0);
        isRecordingRef.current = false;
        recordingStartedAtRef.current = null;

        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
    }

    function formatRecordingTime() {
        const minutes = Math.floor(recordingTime / 60);
        const seconds = recordingTime % 60;

        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }

    return (
        <View style={styles.wrapper}>
            {isPlusMenuOpen && !isRecording && (
                <View style={styles.plusMenu}>
                    <Pressable style={styles.plusMenuItem} onPress={() => handleMenuAction(onOpenCamera)}>
                        <View style={styles.plusMenuIconBox}>
                            <SymbolView name="camera" size={22} tintColor="#111" weight="regular" />
                        </View>
                        <Text style={styles.plusMenuText}>Câmera</Text>
                    </Pressable>

                    <Pressable style={styles.plusMenuItem} onPress={() => handleMenuAction(onOpenImagePicker)}>
                        <View style={styles.plusMenuIconBox}>
                            <SymbolView name="photo" size={22} tintColor="#111" weight="regular" />
                        </View>
                        <Text style={styles.plusMenuText}>Imagem</Text>
                    </Pressable>

                    <Pressable style={styles.plusMenuItem} onPress={() => handleMenuAction(onOpenStickerPicker)}>
                        <View style={styles.plusMenuIconBox}>
                            <SymbolView name="face.smiling" size={22} tintColor="#111" weight="regular" />
                        </View>
                        <Text style={styles.plusMenuText}>Sticker</Text>
                    </Pressable>
                </View>
            )}

            <View style={styles.container}>
                {isRecording && (
                    <View style={styles.recordingContainer}>
                        <View style={styles.recordingInfo}>
                            <Animated.View style={[styles.recordingDot, { transform: [{ scale: recordPulseAnim }] }]} />
                            <Text style={styles.recordingText}>Solte para enviar</Text>
                            <Text style={styles.recordingTime}>{formatRecordingTime()}</Text>
                        </View>

                        <Pressable style={styles.cancelRecordingButton} onPress={cancelRecording}>
                            <Text style={styles.cancelRecordingText}>Cancelar</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.actionButton, styles.recordingMicButton]}
                            onPressOut={() => {
                                if (isRecordingRef.current) {
                                    finishRecording();
                                }
                            }}
                        >
                            <SymbolView name="microphone.fill" size={23} tintColor="#fff" weight="regular" />
                        </Pressable>
                    </View>
                )}

                {!isRecording && (
                    <>
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <Pressable
                                style={[styles.actionButton, isPlusMenuOpen && styles.actionButtonActive]}
                                onPress={handlePlusPress}
                            >
                                <SymbolView name={isPlusMenuOpen ? 'xmark' : 'plus'} size={23} tintColor="#111" weight="regular" />
                            </Pressable>
                        </Animated.View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                ref={inputRef}
                                value={text}
                                onChangeText={handleChangeText}
                                onFocus={() => setIsPlusMenuOpen(false)}
                                onBlur={onStopTyping}
                                placeholder="Envie uma mensagem"
                                placeholderTextColor="#8f8f8f"
                                style={styles.input}
                                multiline
                            />
                        </View>

                        {hasText ? (
                            <Pressable style={styles.sendButton} onPress={handleSend}>
                                <SymbolView name="paperplane.fill" size={19} tintColor="#fff" weight="regular" />
                            </Pressable>
                        ) : (
                            <Pressable
                                style={[styles.actionButton, isRecording && styles.recordingMicButton]}
                                onPressIn={() => {
                                    if (!hasText) startRecording();
                                }}
                                onPressOut={() => {
                                    if (isRecordingRef.current) finishRecording();
                                }}
                            >
                                <SymbolView
                                    name={isRecording ? 'microphone.fill' : 'microphone'}
                                    size={23}
                                    tintColor={isRecording ? '#fff' : '#111'}
                                    weight="regular"
                                />
                            </Pressable>
                        )}
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ddd',
        backgroundColor: '#fff'
    },
    plusMenu: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 6,
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#fff'
    },
    plusMenuItem: {
        alignItems: 'center',
        gap: 6
    },
    plusMenuIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#f1f1f1',
        alignItems: 'center',
        justifyContent: 'center'
    },
    plusMenuText: {
        fontSize: 12,
        color: '#333'
    },
    container: {
        minHeight: 24,
        paddingHorizontal: 4,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        backgroundColor: '#fff'
    },
    inputContainer: {
        flex: 1,
        minHeight: 12,
        maxHeight: 44,
        borderRadius: 24,
        backgroundColor: '#f1f1f1',
        justifyContent: 'center'
    },
    input: {
        maxHeight: 44,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 15,
        lineHeight: 20,
        color: '#111'
    },
    actionButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    actionButtonActive: {
        backgroundColor: '#f1f1f1'
    },
    recordingMicButton: {
        backgroundColor: '#1881E2'
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#1881E2',
        alignItems: 'center',
        justifyContent: 'center'
    },
    recordingContainer: {
        flex: 1,
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    recordingInfo: {
        flex: 1,
        minHeight: 44,
        paddingHorizontal: 14,
        borderRadius: 24,
        backgroundColor: '#f1f1f1',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    recordingDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#e53935'
    },
    recordingText: {
        flex: 1,
        fontSize: 14,
        color: '#111',
        fontWeight: '600'
    },
    recordingTime: {
        fontSize: 14,
        color: '#e53935',
        fontVariant: ['tabular-nums']
    },
    cancelRecordingButton: {
        height: 42,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelRecordingText: {
        fontSize: 13,
        color: '#777',
        fontWeight: '600'
    }
});
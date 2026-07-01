

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputContentSizeChangeEventData,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';

type GenericInputType = 'text' | 'email' | 'password' | 'date' | 'tel' | 'textarea';

type GenericInputProps = {
    type?: GenericInputType;
    label?: string;
    value?: string;
    defaultValue?: string;
    maxLength?: number;
    minLength?: number;
    required?: boolean;
    iconName?: string;
    theme?: 'light' | 'dark';
    textColor?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    placeholder?: string;
    containerStyle?: StyleProp<ViewStyle>;
    inputWrapperStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    onValueChange?: (value: string) => void;
    onTyping?: () => void;
    onBlur?: () => void;
    onFocus?: () => void;
} & Omit<TextInputProps, 'value' | 'defaultValue' | 'onChangeText' | 'onBlur' | 'onFocus' | 'style' | 'placeholder'>;

const GenericInput = ({
    type = 'text',
    label = 'Buscar',
    value,
    defaultValue = '',
    maxLength,
    minLength,
    required = false,
    iconName = '',
    theme = 'light',
    textColor,
    disabled = false,
    autoFocus = false,
    multiline,
    numberOfLines = 1,
    placeholder,
    containerStyle,
    inputWrapperStyle,
    inputStyle,
    onValueChange,
    onTyping,
    onBlur,
    onFocus,
    ...textInputProps
}: GenericInputProps) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [focused, setFocused] = useState(type === 'date');
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [textareaHeight, setTextareaHeight] = useState(48);

    const labelAnimation = useRef(new Animated.Value(value || defaultValue || type === 'date' ? 1 : 0)).current;

    const currentValue = value ?? internalValue;
    const isTextarea = type === 'textarea' || multiline;
    const isDark = theme === 'dark';
    const hasValue = !!currentValue;
    const isFloating = focused || hasValue || type === 'date';

    const hasMaxLengthError = !!maxLength && currentValue.length > maxLength;
    const hasMinLengthError = !!minLength && currentValue.length < minLength && currentValue.length > 0;
    const hasRequiredError = required && !currentValue;
    const hasError = hasMaxLengthError || hasMinLengthError || hasRequiredError;
    const showError = touched && hasError;

    const GlassContainer = Platform.OS === 'ios' ? GlassView : View;

    const colors = useMemo(() => {
        const baseText = textColor || (isDark ? '#ffffff' : '#111111');

        return {
            text: baseText,
            label: showError ? '#ff453a' : isFloating ? '#6b6b6b' : isDark ? '#d4d4d4' : '#7a7a7a',
            border: showError ? '#ff453a' : focused ? 'rgba(255, 255, 255, 0.42)' : 'rgba(255, 255, 255, 0.24)',
            glassTint: isDark ? 'rgba(18, 18, 18, 0.42)' : 'rgba(255, 255, 255, 0.34)',
            fallback: isDark ? 'rgba(20, 20, 20, 0.72)' : 'rgba(255, 255, 255, 0.78)',
            error: '#ff453a'
        };
    }, [focused, isDark, isFloating, showError, textColor]);

    useEffect(() => {
        Animated.timing(labelAnimation, {
            toValue: isFloating ? 1 : 0,
            duration: 180,
            useNativeDriver: false
        }).start();
    }, [isFloating, labelAnimation]);

    const labelTop = labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 7]
    });

    const labelFontSize = labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 11]
    });

    const labelIconSize = labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 10]
    });

    const keyboardType = useMemo(() => {
        if (type === 'email') return 'email-address';
        if (type === 'tel') return 'phone-pad';
        return 'default';
    }, [type]);

    const autoCapitalize = type === 'email' ? 'none' : textInputProps.autoCapitalize;
    const secureTextEntry = type === 'password' && !showPassword;

    const handleChangeText = (nextValue: string) => {
        if (value === undefined) {
            setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
        onTyping?.();
    };

    const handleFocus = () => {
        setFocused(true);
        onFocus?.();
    };

    const handleBlur = () => {
        setFocused(false);
        setTouched(true);
        onBlur?.();
    };

    const handleContentSizeChange = (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
        if (!isTextarea) return;

        const nextHeight = Math.max(48, event.nativeEvent.contentSize.height + 12);
        setTextareaHeight(nextHeight);
    };

    return (
        <View style={[styles.basicInputComponent, containerStyle]}>
            <View
                style={[
                    styles.inputClipper,
                    {
                        borderColor: colors.border,
                        backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.fallback
                    },
                    showError && styles.inputClipperError,
                    disabled && styles.inputClipperDisabled,
                    inputWrapperStyle
                ]}
            >
                <GlassContainer
                    style={styles.inputGlass}
                    isInteractive={Platform.OS === 'ios'}
                    tintColor={colors.glassTint}
                >
                    <TextInput
                        {...textInputProps}
                        value={currentValue}
                        editable={!disabled}
                        autoFocus={autoFocus}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        secureTextEntry={secureTextEntry}
                        multiline={isTextarea}
                        numberOfLines={isTextarea ? numberOfLines : 1}
                        placeholder={isFloating ? placeholder : undefined}
                        placeholderTextColor={isDark ? '#9a9a9a' : '#8e8e8e'}
                        textAlignVertical={isTextarea ? 'top' : 'center'}
                        onChangeText={handleChangeText}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onContentSizeChange={handleContentSizeChange}
                        style={[
                            styles.basicInputField,
                            {
                                color: colors.text,
                                height: isTextarea ? textareaHeight : 48,
                                paddingTop: isFloating ? 18 : 10,
                                paddingRight: type === 'password' ? 44 : 16
                            },
                            isTextarea && styles.textarea,
                            inputStyle
                        ]}
                    />

                    {!!label && (
                        <Animated.View
                            pointerEvents="none"
                            style={[
                                styles.basicInputLabel,
                                {
                                    top: labelTop,
                                }
                            ]}
                        >
                            {!!iconName && (
                                <Animated.View
                                    style={{
                                        width: labelIconSize,
                                        height: labelIconSize,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <SymbolView
                                        name={iconName as any}
                                        size={isFloating ? 10 : 18}
                                        tintColor={colors.label}
                                        weight="regular"
                                    />
                                </Animated.View>
                            )}

                            <Animated.Text
                                numberOfLines={1}
                                style={[
                                    styles.labelText,
                                    {
                                        color: colors.label,
                                        fontSize: labelFontSize
                                    }
                                ]}
                            >
                                {label}
                                {required && <Text style={{ color: colors.error }}> *</Text>}
                            </Animated.Text>
                        </Animated.View>
                    )}

                    {type === 'password' && (
                        <Pressable
                            style={styles.passwordToggle}
                            onPress={() => setShowPassword(previous => !previous)}
                            hitSlop={10}
                        >
                            <SymbolView
                                name={showPassword ? 'eye.slash' : 'eye'}
                                size={20}
                                tintColor={colors.text}
                                weight="regular"
                            />
                        </Pressable>
                    )}
                </GlassContainer>
            </View>

            {showError && (
                <View style={styles.errorContainer}>
                    {hasMaxLengthError && (
                        <Text style={[styles.errorMessage, { color: colors.error }]}>* Máximo de {maxLength} caracteres</Text>
                    )}
                    {hasMinLengthError && (
                        <Text style={[styles.errorMessage, { color: colors.error }]}>* Mínimo de {minLength} caracteres</Text>
                    )}
                    {hasRequiredError && (
                        <Text style={[styles.errorMessage, { color: colors.error }]}>* Campo obrigatório</Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    basicInputComponent: {
        width: '100%',
        maxWidth: '100%'
    },
    inputClipper: {
        width: '100%',
        minHeight: 48,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4
    },
    inputClipperError: {
        borderWidth: 1
    },
    inputClipperDisabled: {
        opacity: 0.55
    },
    inputGlass: {
        width: '100%',
        minHeight: 48,
        position: 'relative',
        justifyContent: 'center',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.78)'
    },
    basicInputField: {
        width: '100%',
        minHeight: 48,
        paddingLeft: 16,
        paddingBottom: 6,
        fontSize: 14,
        lineHeight: 19
    },
    textarea: {
        minHeight: 48,
        paddingBottom: 10
    },
    basicInputLabel: {
        position: 'absolute',
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        maxWidth: '78%'
    },
    labelText: {
        fontWeight: '400'
    },
    passwordToggle: {
        position: 'absolute',
        right: 12,
        top: 0,
        bottom: 0,
        width: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorContainer: {
        marginTop: 4,
        marginLeft: 18,
        gap: 2
    },
    errorMessage: {
        fontSize: 12
    }
});

export default GenericInput;
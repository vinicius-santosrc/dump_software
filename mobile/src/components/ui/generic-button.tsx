/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { MaterialIcons } from '@expo/vector-icons';
import {
    ActivityIndicator,
    DimensionValue,
    GestureResponderEvent,
    Image,
    ImageSourcePropType,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

export type GenericButtonVariant = 'default' | 'secondary' | 'ghost';

interface GenericButtonProps {
    label?: string;
    backgroundColor?: string;
    textColor?: string;
    width?: DimensionValue;
    padding?: string;
    disabled?: boolean;
    loading?: boolean;
    borderRadius?: number | string;
    fontSize?: number | string;
    marginY?: number | string;
    logoIcon?: ImageSourcePropType;
    iconName?: keyof typeof MaterialIcons.glyphMap;
    variant?: GenericButtonVariant;
    isFile?: boolean;
    accept?: string;
    onPress?: (event: GestureResponderEvent) => void;
    onFilePress?: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

function parseSize(value?: number | string, fallback = 0): number {
    if (typeof value === 'number') {
        return value;
    }

    if (!value) {
        return fallback;
    }

    const parsed = Number(value.replace('px', '').trim());

    return Number.isNaN(parsed) ? fallback : parsed;
}

function parsePadding(padding: string) {
    const parts = padding
        .replace(/px/g, '')
        .split(' ')
        .map((part) => Number(part.trim()))
        .filter((part) => !Number.isNaN(part));

    if (parts.length === 1) {
        return {
            paddingVertical: parts[0],
            paddingHorizontal: parts[0]
        };
    }

    if (parts.length >= 2) {
        return {
            paddingVertical: parts[0],
            paddingHorizontal: parts[1]
        };
    }

    return {
        paddingVertical: 8,
        paddingHorizontal: 16
    };
}

export default function GenericButton({
    label = '',
    backgroundColor = '#1881E2',
    textColor = '#ffffff',
    width = 'auto',
    padding = '8px 16px',
    disabled = false,
    loading = false,
    borderRadius = 8,
    fontSize = 14,
    marginY = 0,
    logoIcon,
    iconName,
    variant = 'default',
    isFile = false,
    onPress,
    onFilePress,
    style,
    textStyle
}: GenericButtonProps) {
    const isDisabled = disabled || loading;
    const isTransparent = variant === 'ghost' || variant === 'secondary';
    const parsedPadding = parsePadding(padding);
    const parsedFontSize = parseSize(fontSize, 14);
    const parsedBorderRadius = parseSize(borderRadius, 8);
    const parsedMarginY = parseSize(marginY, 0);
    const loaderColor = textColor === '#ffffff' ? '#ffffff' : '#111111';
    const hasOnlyIcon = !!iconName && !label && !logoIcon;

    function handlePress(event: GestureResponderEvent) {
        if (isDisabled) {
            return;
        }

        if (isFile) {
            onFilePress?.();
            return;
        }

        onPress?.(event);
    }

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            disabled={isDisabled}
            onPress={handlePress}
            style={[
                styles.button,
                parsedPadding,
                {
                    width,
                    borderRadius: parsedBorderRadius,
                    marginTop: parsedMarginY,
                    marginBottom: parsedMarginY,
                    backgroundColor: isTransparent ? 'transparent' : backgroundColor,
                    opacity: isDisabled ? 0.6 : 1
                },
                variant === 'secondary' && styles.secondary,
                variant === 'ghost' && styles.ghost,
                hasOnlyIcon && styles.iconOnly,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={loaderColor} />
            ) : (
                <>
                    {iconName ? (
                        <MaterialIcons
                            name={iconName}
                            size={parsedFontSize + 4}
                            color={variant === 'secondary' || variant === 'ghost' ? '#333333' : textColor}
                            style={styles.icon}
                        />
                    ) : null}

                    {logoIcon ? (
                        <Image source={logoIcon} style={styles.logoIcon} resizeMode="contain" />
                    ) : null}

                    {label ? (
                        <Text
                            style={[
                                styles.label,
                                {
                                    color: variant === 'secondary' || variant === 'ghost' ? '#333333' : textColor,
                                    fontSize: parsedFontSize
                                },
                                textStyle
                            ]}
                        >
                            {label}
                        </Text>
                    ) : null}
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 0
    },
    secondary: {
        borderWidth: 1,
        borderColor: '#d8d8d8'
    },
    ghost: {
        borderWidth: 0
    },
    iconOnly: {
        paddingHorizontal: 8,
        paddingVertical: 8
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoIcon: {
        width: 18,
        height: 18
    },
    label: {
        fontWeight: '500'
    }
});
/// <reference types="nativewind/types" />
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  type ViewStyle, 
  type TextStyle, 
  Platform,
  Dimensions,
  type StyleProp,
} from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Raven-Os Base UI Components (Premium Edition)
 * Refined for a high-end, futuristic look.
 */

export const RavenColors = {
  primary: '#8b5cf6', // Soft Violet
  primaryLight: '#c4b5fd',
  secondary: '#10b981', // Emerald
  accent: '#f59e0b', // Amber
  background: '#050505', // True Black for deep contrast
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceDeeper: 'rgba(255, 255, 255, 0.01)',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
};

// --- Fundamental Components ---

export const RavenView = ({ children, style, className }: { children: React.ReactNode, style?: ViewStyle, className?: string }) => {
  return <View style={[styles.container, style]} className={className}>{children}</View>;
};

export const RavenText = ({ 
  children, 
  variant = 'body', 
  style,
  className 
}: { 
  children: React.ReactNode, 
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption', 
  style?: StyleProp<TextStyle>,
  className?: string
}) => {
  return <Text style={[styles.text, styles[variant as keyof typeof styles], style]} className={className}>{children}</Text>;
};

export const RavenButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  style,
  className
}: { 
  title: string, 
  onPress: () => void, 
  variant?: 'primary' | 'secondary' | 'accent' | 'outline', 
  style?: ViewStyle,
  className?: string
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && { backgroundColor: RavenColors.secondary },
    variant === 'accent' && { backgroundColor: RavenColors.accent },
    variant === 'outline' && styles.buttonOutline,
    style
  ];

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress} 
      style={buttonStyle}
      className={className}
    >
      <Text style={[styles.buttonText, variant === 'outline' && { color: RavenColors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export const RavenCard = ({ children, style, glass = true, className }: { children: React.ReactNode, style?: ViewStyle, glass?: boolean, className?: string }) => {
  return (
    <View 
      style={[styles.card, !glass && { backgroundColor: RavenColors.surfaceDeeper }, style]} 
      className={className}
    >
      {children}
    </View>
  );
};

// --- Layout & Utilities ---

export const RavenStack = ({ children, gap = 16, style }: { children: React.ReactNode, gap?: number, style?: ViewStyle }) => {
  return (
    <View style={[{ gap } as ViewStyle, style]}>
      {children}
    </View>
  );
};

export const RavenBackgroundGlow = ({ color = RavenColors.primary, top = 0, left = 0 }: { color?: string, top?: number, left?: number }) => {
  if (Platform.OS !== 'web') return null; // SVG/Native glows would need separate implementation
  return (
    <View 
      style={{
        position: 'absolute',
        top: top - 200,
        left: left - 200,
        width: 400,
        height: 400,
        backgroundColor: color,
        borderRadius: 200,
        opacity: 0.15,
        // Using any for web-specific property
        ...({ filter: 'blur(100px)' } as any)
      }}
    />
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: RavenColors.background,
  },
  text: {
    color: RavenColors.text,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: 'Inter, system-ui, -apple-system, sans-serif'
    }),
  },
  h1: {
    fontSize: width > 600 ? 56 : 40,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: width > 600 ? 64 : 48,
  },
  h2: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: RavenColors.textSecondary,
  },
  small: {
    fontSize: 14,
    color: RavenColors.textMuted,
  },
  caption: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
    color: RavenColors.primary,
  },
  card: {
    backgroundColor: RavenColors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: RavenColors.glassBorder,
    // Native shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    // Glassmorphism for Web
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      } as any
    })
  },
  button: {
    backgroundColor: RavenColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: RavenColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: RavenColors.border,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

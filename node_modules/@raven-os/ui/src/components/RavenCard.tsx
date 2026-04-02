import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { RavenColors } from '../base';

interface RavenCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * RavenCard — Shared (default) implementation.
 * 
 * This file is the base component used by ALL platforms.
 * To override it for a specific platform:
 *   - Create RavenCard.web.tsx    → Web-only override
 *   - Create RavenCard.native.tsx → Mobile-only override (iOS + Android)
 * 
 * The bundler resolves the correct file automatically.
 * No `if` statements, no coupling — pure surgical isolation.
 */
const RavenCard = ({ children, style }: RavenCardProps) => {
  return (
    <View
      style={[
        {
          backgroundColor: RavenColors.surface,
          borderRadius: 24,
          padding: 24,
          borderWidth: 1,
          borderColor: RavenColors.glassBorder,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default RavenCard;

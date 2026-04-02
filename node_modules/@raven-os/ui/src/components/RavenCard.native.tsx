import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { RavenColors } from '../base';

interface RavenCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * RavenCard — Native (Mobile) Override
 * 
 * ✅ This file is loaded ONLY on iOS and Android (Expo/Metro).
 * ✅ Web builds will NEVER see this file.
 * 
 * Use this for:
 *   - Mobile-specific bug fixes
 *   - SafeArea adjustments
 *   - Native shadow APIs (elevation on Android)
 *   - Touch gesture differences
 * 
 * EXAMPLE DIFF vs shared:
 *   - Uses `elevation` for Android shadow (not supported on Web)
 *   - Slightly smaller border radius (feel optimized for mobile touch)
 */
const RavenCard = ({ children, style }: RavenCardProps) => {
  return (
    <View
      style={[
        {
          backgroundColor: RavenColors.surface,
          borderRadius: 20, // Slightly smaller on mobile for tighter feel
          padding: 20,
          borderWidth: 1,
          borderColor: RavenColors.glassBorder,
          // Android-native shadow (elevation)
          elevation: 12,
          // iOS shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default RavenCard;

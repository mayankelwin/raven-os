import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useNexus, useRavenTheme } from '@raven-os/core';
import { RavenText, RavenCard } from '../base';

/**
 * NexusMetricCard (V38 Pro)
 * 
 * A premium visualization for a single NexusDB value.
 * It automatically tracks trends (Up/Down) based on previous values.
 */

interface NexusMetricCardProps {
  room?: string;
  name: string;
  label: string;
  defaultValue?: any;
  suffix?: string;
  prefix?: string;
}

export const NexusMetricCard = ({ 
  room = 'DEFAULT', 
  name, 
  label, 
  defaultValue = 0,
  suffix = '',
  prefix = ''
}: NexusMetricCardProps) => {
  const [value] = useNexus(name, defaultValue, room);
  const { colors } = useRavenTheme();
  
  const prevValue = useRef(value);
  const trendAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value > prevValue.current) {
        // Up trend
        Animated.sequence([
            Animated.timing(trendAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(1000),
            Animated.timing(trendAnim, { toValue: 0, duration: 500, useNativeDriver: true })
        ]).start();
    } else if (value < prevValue.current) {
        // Down trend
        Animated.sequence([
            Animated.timing(trendAnim, { toValue: -1, duration: 300, useNativeDriver: true }),
            Animated.delay(1000),
            Animated.timing(trendAnim, { toValue: 0, duration: 500, useNativeDriver: true })
        ]).start();
    }
    prevValue.current = value;
  }, [value]);

  const trendColor = trendAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['#ef4444', '#94a3b8', '#10b981']
  });

  return (
    <RavenCard style={{ 
      padding: 20, 
      borderRadius: 20, 
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 160
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <RavenText style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </RavenText>
        <Animated.View style={{ opacity: trendAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: [1, 0, 1] }) }}>
           <RavenText style={{ fontSize: 12 }}>🚀</RavenText>
        </Animated.View>
      </View>
      
      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'baseline' }}>
         <RavenText style={{ fontSize: 32, fontWeight: '900', color: colors.text }}>
            {prefix}{value}{suffix}
         </RavenText>
      </View>
      
      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
         <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: 6 }} />
         <RavenText style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600' }}>
            NEXUS LIVE
         </RavenText>
      </View>
    </RavenCard>
  );
};

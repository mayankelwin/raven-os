import React from 'react';
import { View, Image } from 'react-native';
import { useRavenAuth, useRavenTheme } from '@raven-os/core';
import { RavenText, RavenCard } from '../base';

/**
 * NexusPresenceGrid (V38 Pro)
 * 
 * Visualizes "Online" users in the current Nexus room.
 * Features avatar stacking and "live" status tracking.
 */

interface NexusPresenceGridProps {
  room?: string;
  limit?: number;
}

export const NexusPresenceGrid = ({ room = 'DEFAULT', limit = 5 }: NexusPresenceGridProps) => {
  const { state } = useRavenAuth(); // In a real scenario, this would use a 'useNexusPresence' hook
  const { colors } = useRavenTheme();
  
  // Mock presence for V38 demonstration (to be replaced by real nexus-presence in V39)
  const mockUsers = [
    { id: '1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=a', status: 'online' },
    { id: '2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=b', status: 'online' },
    { id: '3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=c', status: 'away' },
  ];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flexDirection: 'row' }}>
        {mockUsers.slice(0, limit).map((user, idx) => (
          <View 
            key={user.id} 
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 16, 
              borderWidth: 2, 
              borderColor: colors.surface,
              marginLeft: idx === 0 ? 0 : -10,
              overflow: 'hidden',
              backgroundColor: colors.border
            }}
          >
            <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
            <View 
                style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0, 
                    width: 8, 
                    height: 8, 
                    borderRadius: 4, 
                    backgroundColor: user.status === 'online' ? '#10b981' : '#f59e0b',
                    borderWidth: 1,
                    borderColor: colors.surface
                }} 
            />
          </View>
        ))}
      </View>
      <RavenText style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>
        {mockUsers.length} ONLINE
      </RavenText>
    </View>
  );
};

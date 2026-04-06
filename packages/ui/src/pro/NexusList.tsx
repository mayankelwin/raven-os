import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useNexusCollection, useRavenTheme } from '@raven-os/core';
import { RavenCard, RavenText } from '../base';

/**
 * Raven NexusList (V34 Pro)
 * 
 * An auto-syncing list component that binds directly to a Nexus collection.
 * It provides built-in loading states and empty-state placeholders.
 */

interface NexusListProps<T> {
  collection: string;
  renderItem: (item: T) => React.ReactElement;
  keyExtractor?: (item: T) => string;
}

export function NexusList<T extends { id?: string }>({ 
  collection, 
  renderItem, 
  keyExtractor 
}: NexusListProps<T>) {
  const { data, loading } = useNexusCollection<T>(collection);
  const { colors } = useRavenTheme();

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={{ padding: 40, alignItems: 'center', opacity: 0.5 }}>
        <RavenText style={{ color: colors.textSecondary }}>No entries in '{collection}' yet.</RavenText>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor || ((item) => item.id || Math.random().toString())}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 12 }}>
          {renderItem(item)}
        </View>
      )}
      contentContainerStyle={{ padding: 2 }}
    />
  );
}

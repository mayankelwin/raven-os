import React, { useState } from 'react';
import { View, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNexusCollection, useRavenTheme } from '@raven-os/core';
import { RavenText, RavenCard } from '../base';

/**
 * NexusDataTable (V38 Pro)
 * 
 * A high-performance, real-time data table for NexusDB collections.
 * Features built-in search, loading states, and live row updates.
 */

interface NexusColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: number | string;
}

interface NexusDataTableProps<T> {
  collection: string;
  columns: NexusColumn<T>[];
  room?: string;
  searchPlaceholder?: string;
}

export function NexusDataTable<T extends { id?: string }>({ 
  collection, 
  columns, 
  room = 'DEFAULT',
  searchPlaceholder = 'Search records...'
}: NexusDataTableProps<T>) {
  const { data, loading } = useNexusCollection<T>(collection, room);
  const { colors } = useRavenTheme();
  const [search, setSearch] = useState('');

  const filteredData = data.filter(item => {
    if (!search) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <RavenCard style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: colors.surface }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <TextInput 
          placeholder={searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={{
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.background,
            paddingHorizontal: 12,
            color: colors.text,
            fontSize: 13,
            borderWidth: 1,
            borderColor: colors.border
          }}
        />
      </View>
      
      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: colors.border }}>
        {columns.map(col => (
          <View key={String(col.key)} style={{ flex: col.width ? 0 : 1, width: col.width as any, paddingVertical: 12 }}>
            <RavenText style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {col.label}
            </RavenText>
          </View>
        ))}
      </View>

      {filteredData.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <RavenText style={{ color: colors.textMuted, fontSize: 13 }}>No results found</RavenText>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: colors.border }}>
              {columns.map(col => (
                <View key={String(col.key)} style={{ flex: col.width ? 0 : 1, width: col.width as any, paddingVertical: 14 }}>
                  {col.render ? (
                     col.render(item[col.key], item)
                  ) : (
                    <RavenText style={{ color: colors.text, fontSize: 13, fontWeight: '500' }}>
                      {String(item[col.key])}
                    </RavenText>
                  )}
                </View>
              ))}
            </TouchableOpacity>
          )}
        />
      )}
    </RavenCard>
  );
}

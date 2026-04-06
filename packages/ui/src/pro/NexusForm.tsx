import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { useNexus, useRavenTheme } from '@raven-os/core';
import { RavenText, RavenCard, RavenButton } from '../base';

/**
 * NexusForm (V38 Pro)
 * 
 * An auto-binding form component that synchronizes its fields with a NexusDB key.
 * It provides built-in state management and optimistic UI updates.
 */

interface NexusFormField {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'number';
}

interface NexusFormProps {
  room?: string;
  nexusKey: string;
  fields: NexusFormField[];
  submitLabel?: string;
  onSave?: (data: any) => void;
}

export const NexusForm = ({ 
  room = 'DEFAULT', 
  nexusKey, 
  fields, 
  submitLabel = 'Save Changes',
  onSave 
}: NexusFormProps) => {
  const [nexusState, setNexusState] = useNexus<Record<string, any>>(nexusKey, {}, room);
  const { colors } = useRavenTheme();
  
  // Local state for immediate typing feedback
  const [localState, setLocalState] = useState<Record<string, any>>(nexusState || {});

  const handleSave = () => {
    setNexusState(localState);
    if (onSave) onSave(localState);
  };

  return (
    <RavenCard style={{ padding: 24, borderRadius: 24, backgroundColor: colors.surface }}>
      <View style={{ gap: 16 }}>
        {fields.map((field) => (
          <View key={field.name} style={{ gap: 6 }}>
            <RavenText style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' }}>
              {field.label}
            </RavenText>
            <TextInput
              style={{
                height: 48,
                backgroundColor: colors.background,
                borderRadius: 12,
                paddingHorizontal: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border
              }}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={field.type === 'password'}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              value={String(localState[field.name] || '')}
              onChangeText={(text) => setLocalState({ ...localState, [field.name]: text })}
            />
          </View>
        ))}
        
        <RavenButton 
          title={submitLabel}
          onPress={handleSave}
          style={{ marginTop: 8 }}
        />
      </View>
    </RavenCard>
  );
};

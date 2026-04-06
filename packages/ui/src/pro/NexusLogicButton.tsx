import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNexusFunction, useRavenTheme } from '@raven-os/core';
import { RavenButton, RavenText } from '../base';

/**
 * NexusLogicButton (V38 Pro)
 * 
 * A high-level button that triggers a server-side Nexus Logic function.
 * It automatically manages loading, success, and error states.
 */

interface NexusLogicButtonProps {
  functionName: string;
  payload?: any;
  title: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  style?: any;
}

export const NexusLogicButton = ({ 
  functionName, 
  payload = {}, 
  title, 
  onSuccess, 
  onError,
  style 
}: NexusLogicButtonProps) => {
  const { call } = useNexusFunction();
  const { colors } = useRavenTheme();
  const [status, setStatus] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePress = async () => {
    setStatus('busy');
    setErrorMsg(null);
    
    try {
      const result = await call(functionName, payload);
      setStatus('success');
      if (onSuccess) onSuccess(result);
      
      // Auto-reset success state after 2 seconds
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message);
      if (onError) onError(e.message);
      
      // Reset error after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <View style={[{ gap: 4 }, style]}>
      <RavenButton 
        title={status === 'busy' ? "Processing..." : (status === 'success' ? "Done ✓" : title)}
        onPress={handlePress}
        disabled={status === 'busy'}
        style={{
          backgroundColor: status === 'error' ? '#ef4444' : 
                           status === 'success' ? '#10b981' : 
                           undefined,
          borderColor: status === 'error' ? '#f87171' : 
                       status === 'success' ? '#34d399' : 
                       undefined
        }}
      />
      
      {status === 'error' && (
        <RavenText style={{ color: '#ef4444', fontSize: 10, textAlign: 'center', marginTop: 2 }}>
          {errorMsg || 'Process failed'}
        </RavenText>
      )}
    </View>
  );
};

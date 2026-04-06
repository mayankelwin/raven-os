import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNexusCollection } from '@raven-os/core';
import { RavenButton, RavenCard, RavenText } from './base';

/**
 * NexusGuard - Pro Provisioning Component (V33)
 * 
 * Demonstrates the "Firebase-style" dynamic schema logic.
 * It checks if a collection has entries and allows safe provisioning.
 */

interface NexusGuardProps {
  collection: string;
  onProvision: (add: (item: any) => void) => void;
  children: React.ReactNode;
}

export const NexusGuard = ({ collection, onProvision, children }: NexusGuardProps) => {
  const { data, add, loading } = useNexusCollection<any>(collection);
  const [isProvisioning, setIsProvisioning] = useState(false);

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator color="#8b5cf6" />
      </View>
    );
  }

  // If table is empty, show the "Provisioning" UI (Autonomy Demo)
  if (data.length === 0) {
    return (
      <View style={{ padding: 15, backgroundColor: 'rgba(139,92,246,0.05)', borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#8b5cf6' }}>
        <RavenText style={{ color: '#c4b5fd', fontSize: 13, textAlign: 'center', marginBottom: 10 }}>
          Coleção '{collection}' detectada como vazia.
        </RavenText>
        <RavenButton 
          title={isProvisioning ? "Provisioning..." : `Initialize ${collection}`}
          onPress={async () => {
             setIsProvisioning(true);
             await onProvision(add);
             setIsProvisioning(false);
          }}
        />
        <RavenText style={{ color: '#94a3b8', fontSize: 10, textAlign: 'center', marginTop: 8 }}>
          Este componente garante a existência da tabela no Nexus Hub.
        </RavenText>
      </View>
    );
  }

  return <>{children}</>;
};

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRavenAuth, useRavenTheme } from '@raven-os/core';
import { RavenButton, RavenCard, RavenText } from '../base';

/**
 * Raven AuthGuard (V34 Pro)
 * 
 * High-level component that protects its children with a premium login screen.
 * Seamlessly integrates with 'useRavenAuth'.
 */

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { state, signIn, signUp } = useRavenAuth();
  const { colors } = useRavenTheme();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (state.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (state.isAuthenticated) {
    return <>{children}</>;
  }

  const handleAction = async () => {
    setError(null);
    setBusy(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 30, backgroundColor: colors.background }}>
      <RavenCard style={{ padding: 25, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
        <RavenText style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Join Nexus'}
        </RavenText>
        <RavenText style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 25, textAlign: 'center' }}>
          {isLogin ? 'Sign in to access your synchronized workspace' : 'Create your secure E2EE identity'}
        </RavenText>

        <TextInput 
          placeholder="Email Address"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          style={{ height: 50, backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 15, color: colors.text, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
        />

        <TextInput 
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ height: 50, backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 15, color: colors.text, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}
        />

        {error && (
          <RavenText style={{ color: '#ef4444', fontSize: 12, marginBottom: 15, textAlign: 'center' }}>
            {error}
          </RavenText>
        )}

        <RavenButton 
          title={busy ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          onPress={handleAction}
          disabled={busy}
        />

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 20 }}>
          <RavenText style={{ color: colors.primary, textAlign: 'center', fontSize: 13, fontWeight: '600' }}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </RavenText>
        </TouchableOpacity>
      </RavenCard>
    </View>
  );
};

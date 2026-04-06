import { useEffect, useRef } from "react";
import {
  View,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  TouchableOpacity,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { 
  useRaven, 
  useRavenTheme, 
  RavenPlatform, 
  ravenConfig, 
  useNexus,
  useNexusCollection,
  useRavenAuth,
  useNexusFunction
} from '@raven-os/core';
import {
  RavenText,
  RavenButton,
  RavenStack,
  RavenBackgroundGlow,
  RavenCard
} from "./base";
import { NexusGuard } from "./NexusGuard";
import { NexusMetricCard } from "./pro/NexusMetricCard";
import { NexusPresenceGrid } from "./pro/NexusPresenceGrid";
import { NexusLogicButton } from "./pro/NexusLogicButton";

const { width } = Dimensions.get("window");
const isWide = width > 900;

export const RavenWelcome = () => {
  const store = useRaven();
  const { colors, isDark, toggleTheme } = useRavenTheme();
  const { call } = useNexusFunction();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  // 1. NexusDB Persistent Sync (V32)
  const [nexusCount, setNexusCount] = useNexus('global_count', 0);
  const [nexusMsg, setNexusMsg] = useNexus('global_msg', 'Nexus is Active');
  
  // 2. Nexus Collections (V33)
  const users = useNexusCollection<{ id: string, name: string, role: string }>('users');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Ambient glows — dark mode only */}
      {isDark && (
        <>
          <RavenBackgroundGlow
            color={colors.primary}
            top={-80}
            left={width * 0.6}
          />
          <RavenBackgroundGlow color={colors.secondary} top={400} left={-80} />
        </>
      )}

      {/* ── Top Bar ── */}
      <View style={[topBar.container, { borderBottomColor: colors.border }]}>
        <View style={topBar.logo}>
          <View style={[topBar.logoDot, { backgroundColor: colors.primary }]} />
          <RavenText
            style={{
              color: colors.text,
              fontWeight: "800",
              fontSize: 15,
              letterSpacing: 0.5,
            }}
          >
            RAVEN OS
          </RavenText>
        </View>
        <View style={topBar.right}>
          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            onLongPress={() => store.setThemeMode(store.themeMode === 'auto' ? 'manual' : 'auto')}
            style={[
              topBar.themeToggle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RavenText style={{ fontSize: 13 }}>
                {isDark ? "☀️" : "🌙"}
              </RavenText>
              <RavenText
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: "600",
                  marginLeft: 5,
                }}
              >
                {isDark ? "Light" : "Dark"}
              </RavenText>
              {store.themeMode === 'auto' && (
                <View 
                  style={{ 
                    marginLeft: 6, 
                    paddingHorizontal: 5, 
                    paddingVertical: 1, 
                    backgroundColor: colors.primary + '20', 
                    borderRadius: 4,
                    borderWidth: 0.5,
                    borderColor: colors.primary + '40'
                  }}
                >
                  <RavenText style={{ color: colors.primary, fontSize: 9, fontWeight: '800' }}>AUTO</RavenText>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <View
            style={[
              topBar.badge,
              {
                backgroundColor: colors.glowPrimary,
                borderColor: colors.primaryLight,
              },
            ]}
          >
            <RavenText
              style={{
                color: colors.primaryLight,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              ALPHA
            </RavenText>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <Animated.View
          style={[
            hero.wrap,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View
            style={[
              hero.tag,
              {
                backgroundColor: colors.glowPrimary,
                borderColor: colors.border,
              },
            ]}
          >
            <RavenText
              style={{
                color: colors.primary,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 2,
              }}
            >
              CROSS-PLATFORM · UNIFIED · OPEN SOURCE
            </RavenText>
          </View>

          <RavenText style={[hero.title, { color: colors.text }]}>
            Build once.{"\n"}
            <RavenText style={{ color: colors?.primary || '#8b5cf6' }}>
              Potência Multi-Plataforma.
            </RavenText>
          </RavenText>

          <RavenText style={[hero.sub, { color: colors?.textSecondary || '#94a3b8' }]}>
            O Raven-Os é o motor de execução unificado para a nova era de apps 
            **Multiplayer-First**. Sincronização nativa, criptografia E2EE e 
            DX de elite em um único ecossistema.
          </RavenText>

          <View style={hero.actions}>
            <RavenButton
              title="Start Building →"
              onPress={() => {}}
              style={{ paddingHorizontal: 28, paddingVertical: 14 }}
            />
            <TouchableOpacity
              style={[hero.ghostBtn, { borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <RavenText
                style={{
                  color: colors.textSecondary,
                  fontWeight: "600",
                  fontSize: 15,
                }}
              >
                Read Docs
              </RavenText>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Stats Bar ── */}
        <View
          style={[
            stats.bar,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          {[
            { label: "Platforms", value: "3" },
            { label: "Bundle size", value: "< 2kb" },
            { label: "TypeScript", value: "100%" },
            { label: "Open Source", value: "MIT" },
          ].map((s, i) => (
            <View key={i} style={stats.item}>
              <RavenText
                style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}
              >
                {s.value}
              </RavenText>
              <RavenText
                style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}
              >
                {s.label}
              </RavenText>
            </View>
          ))}
        </View>

        {/* ── Features Grid ── */}
        <View style={section.wrap}>
          <RavenText style={[section.tag, { color: colors.primary }]}>
            FRAMEWORK RESOURCES
          </RavenText>
          <RavenText style={[section.title, { color: colors.text }]}>
            Poder real. Demonstrado ao vivo.
          </RavenText>
          <RavenText style={[section.sub, { color: colors.textSecondary }]}>
            Cada card abaixo é um recurso nativo do Raven-Os que você pode usar
            agora mesmo.
          </RavenText>
        </View>

        <View style={[grid.wrap, isWide && { flexDirection: "row" }]}>
          {/* Card 1 — Theme System */}
          <View
            style={[
              card.base,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flex: 1,
              },
              Platform.OS === "web"
                ? ({ backdropFilter: "blur(24px)" } as any)
                : {},
            ]}
          >
            <View style={[card.icon, { backgroundColor: colors.glowPrimary }]}>
              <RavenText style={{ fontSize: 20 }}>
                {isDark ? "🌙" : "☀️"}
              </RavenText>
            </View>
            <RavenText style={[card.title, { color: colors.text }]}>
              Smart Theme
            </RavenText>
            <RavenText style={[card.body, { color: colors.textSecondary }]}>
              Inversão inteligente de cores mantendo contraste e legibilidade 
              nativa em ambas as plataformas.
            </RavenText>
            <View
              style={[
                card.demo,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <RavenText
                  style={{ color: colors.textSecondary, fontSize: 13 }}
                >
                  Modo:{" "}
                  <RavenText
                    style={{ color: colors.primary, fontWeight: "700" }}
                  >
                    {isDark ? "Dark" : "Light"}
                  </RavenText>
                </RavenText>
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={[
                    toggle.track,
                    {
                      backgroundColor: isDark ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      toggle.knob,
                      { transform: [{ translateX: isDark ? 20 : 0 }] },
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Card 2 — NexusDB (V32 Persistent Sync) */}
          <View
            style={[
              card.base,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flex: 1,
              },
              Platform.OS === "web"
                ? ({ backdropFilter: "blur(24px)" } as any)
                : {},
            ]}
          >
            <View
              style={[card.icon, { backgroundColor: "rgba(16,185,129,0.12)" }]}
            >
              <RavenText style={{ fontSize: 20 }}>🌌</RavenText>
            </View>
            <RavenText style={[card.title, { color: colors.text }]}>
              NexusDB Unified
            </RavenText>
            <RavenText style={[card.body, { color: colors.textSecondary }]}>
              Banco de dados unificado com persistência automática no servidor. 
              Sincroniza Web e Mobile instantaneamente.
            </RavenText>
            <View
              style={[
                card.demo,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: colors.border,
                },
              ]}
            >
               <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <RavenText style={{ color: colors.textSecondary, fontSize: 13 }}>Symmetry Count:</RavenText>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => setNexusCount(nexusCount - 1)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                        <RavenText style={{ color: colors.text }}>-</RavenText>
                      </TouchableOpacity>
                      <RavenText style={{ color: colors.primary, fontWeight: '800', fontSize: 16 }}>{nexusCount}</RavenText>
                      <TouchableOpacity onPress={() => setNexusCount(nexusCount + 1)} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                        <RavenText style={{ color: colors.text }}>+</RavenText>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={{ height: 1, backgroundColor: colors.border }} />

                  <View style={{ gap: 4 }}>
                    <RavenText style={{ color: colors.textMuted, fontSize: 10, textTransform: 'uppercase' }}>Global Nexus Message</RavenText>
                    <View style={{ padding: 8, backgroundColor: colors.background, borderRadius: 6, borderWidth: 1, borderColor: colors.border }}>
                      <RavenText style={{ color: colors.textSecondary, fontSize: 12 }}>{nexusMsg}</RavenText>
                    </View>
                  </View>
               </View>
            </View>
          </View>
          
          {/* Card 2.5 — Nexus Collections (V33) */}
          <View
            style={[
              card.base,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flex: 1,
              },
            ]}
          >
             <View style={[card.icon, { backgroundColor: "rgba(139,92,246,0.12)" }]}>
                <RavenText style={{ fontSize: 20 }}>👥</RavenText>
             </View>
             <RavenText style={[card.title, { color: colors.text }]}>
                Dynamic Collections (V33)
             </RavenText>
             <RavenText style={[card.body, { color: colors.textSecondary }]}>
                Autonomia total. Crie coleções e adicione registros direto do frontend.
             </RavenText>
             
             <View style={card.demo}>
                <NexusGuard 
                  collection="users" 
                  onProvision={(add) => add({ name: 'Admin Raven', role: 'Founder' })}
                >
                   <View style={{ gap: 8 }}>
                      <RavenText style={{ color: colors.textSecondary, fontSize: 12 }}>
                         Users count: {users.data.length}
                      </RavenText>
                      <RavenButton 
                        title="Add User" 
                        onPress={() => users.add({ name: `Dev ${users.data.length + 1}`, role: 'Engineer' })} 
                      />
                   </View>
                </NexusGuard>
             </View>
          </View>

          {/* Card 3 — Platform Override */}
          <View
            style={[
              card.base,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flex: 1,
              },
              Platform.OS === "web"
                ? ({ backdropFilter: "blur(24px)" } as any)
                : {},
            ]}
          >
            <View
              style={[card.icon, { backgroundColor: "rgba(245,158,11,0.12)" }]}
            >
              <RavenText style={{ fontSize: 20 }}>🦾</RavenText>
            </View>
            <RavenText style={[card.title, { color: colors.text }]}>
              Platform Native
            </RavenText>
            <RavenText style={[card.body, { color: colors.textSecondary }]}>
              Código unificado com overrides cirúrgicos onde importa. Zero 
              compromisso com a experiência de usuário.
            </RavenText>
            <View
              style={[
                card.demo,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: colors.border,
                },
              ]}
            >
              <RavenStack gap={6}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
                    <RavenText style={{ fontSize: 12, color: colors.textSecondary, fontFamily: 'monospace' }}>Button.web.tsx</RavenText>
                 </View>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary }} />
                    <RavenText style={{ fontSize: 12, color: colors.textSecondary, fontFamily: 'monospace' }}>Button.native.tsx</RavenText>
                 </View>
              </RavenStack>
            </View>
          </View>
        </View>

        {/* ── Engine Room Section ── */}
        <View style={section.wrap}>
          <RavenText style={[section.tag, { color: colors.secondary }]}>
            ADVANCED ENGINE ROOM
          </RavenText>
          <RavenText style={[section.title, { color: colors.text }]}>
            O Core de Próxima Geração.
          </RavenText>
          <RavenText style={[section.sub, { color: colors.textSecondary }]}>
            Segurança, Observabilidade e Performance integradas no DNA do framework.
          </RavenText>
        </View>

        <View style={[grid.wrap, isWide && { flexDirection: "row" }]}>
          {/* Card 3 — Auth Symmetry (V34) */}
          <View
            style={[
              card.base,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flex: 1,
              },
            ]}
          >
             <View style={[card.icon, { backgroundColor: "rgba(245,158,11,0.12)" }]}>
                <RavenText style={{ fontSize: 20 }}>🆔</RavenText>
             </View>
             <RavenText style={[card.title, { color: colors.text }]}>
                Auth Symmetry
             </RavenText>
             <RavenText style={[card.body, { color: colors.textSecondary }]}>
                Identidade unificada com E2EE. Login seguro sincronizado via Nexus Edge.
             </RavenText>
             
             <View style={card.demo}>
                <View style={{ gap: 8 }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary }} />
                      <RavenText style={{ color: colors.textMuted, fontSize: 11 }}>RELAY: edge.raven-os.dev</RavenText>
                   </View>
                   <View style={{ padding: 10, backgroundColor: colors.background, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                      <RavenText style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                         Global Identity Active
                      </RavenText>
                      <RavenText style={{ color: colors.textMuted, fontSize: 10 }}>
                         Session: Symmetric AES-256
                      </RavenText>
                   </View>
                </View>
             </View>
          </View>

          {/* Card 4 — Nexus Logic (V35) */}
          <View
            style={[
              card.base,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                flex: 1,
              },
            ]}
          >
             <View style={[card.icon, { backgroundColor: "rgba(16,185,129,0.12)" }]}>
                <RavenText style={{ fontSize: 20 }}>🧠</RavenText>
             </View>
             <RavenText style={[card.title, { color: colors.text }]}>
                Nexus Logic
             </RavenText>
             <RavenText style={[card.body, { color: colors.textSecondary }]}>
                Processamento pesado e automações no servidor via Server-side Functions.
             </RavenText>
             
             <View style={card.demo}>
                <View style={{ gap: 8 }}>
                   <View style={{ padding: 10, backgroundColor: colors.background, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                      <RavenText style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
                         RPC: sum(10, 20)
                      </RavenText>
                      <RavenText style={{ color: colors.secondary, fontSize: 14, fontWeight: '900', marginTop: 4 }}>
                         Result: 30
                      </RavenText>
                   </View>
                   <RavenText style={{ color: colors.textMuted, fontSize: 9 }}>
                      Hot-Reloading: nexus/functions/index.ts
                   </RavenText>
                </View>
             </View>
          </View>
        </View>


        {/* ── Nexus Pro Ecosystem (V38) ── */}
        <View style={{ paddingHorizontal: 24, marginTop: 48, gap: 24 }}>
          <View style={{ gap: 4 }}>
             <RavenText style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>Nexus Pro Ecosystem</RavenText>
             <RavenText style={{ fontSize: 13, color: colors.textSecondary }}>Componentes inteligentes de alto nível integrados ao NexusDB.</RavenText>
          </View>

          <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16 }}>
            <View style={{ flex: 1, gap: 16 }}>
              <NexusMetricCard 
                label="Global Sync Events"
                name="sync_count"
                defaultValue={1240}
                suffix="+"
              />
              <RavenCard style={{ padding: 20, borderRadius: 20, backgroundColor: colors.surface }}>
                 <RavenText style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12, fontWeight: '700' }}>PRESENÇA EM TEMPO REAL</RavenText>
                 <NexusPresenceGrid limit={4} />
              </RavenCard>
            </View>

            <View style={{ flex: 1.5, gap: 16 }}>
               <RavenCard style={{ padding: 20, borderRadius: 20, backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: colors.primary }}>
                  <RavenText style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Controle de Sincronização</RavenText>
                  <RavenText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 16 }}>
                    Dispare funções pesadas no servidor com feedback visual nativo.
                  </RavenText>
                  <NexusLogicButton 
                    title="Forçar Re-Sync Global"
                    functionName="rebuild_index"
                    payload={{ force: true }}
                  />
               </RavenCard>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={[footer.wrap, { borderTopColor: colors.border }]}>
          <View style={footer.brand}>
            <View style={[footer.dot, { backgroundColor: colors.primary }]} />
            <RavenText style={{ color: colors.textMuted, fontSize: 13 }}>
              Raven-Os Framework © 2026
            </RavenText>
          </View>
          <RavenText style={{ color: colors.textMuted, fontSize: 13 }}>
            Crafted with passion by{" "}
            <RavenText style={{ color: colors.text, fontWeight: "700" }}>
              Mayan K Bispo
            </RavenText>
          </RavenText>
        </View>
      </ScrollView>
    </View>
  );
};

// ── Micro style objects (plain objects — theme colors applied inline) ──

const topBar = {
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  } as ViewStyle,
  logo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  } as ViewStyle,
  logoDot: { width: 8, height: 8, borderRadius: 4 } as ViewStyle,
  right: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  } as ViewStyle,
  themeToggle: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  } as ViewStyle,
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  } as ViewStyle,
};

const hero = {
  wrap: {
    paddingHorizontal: isWide ? 48 : 24,
    paddingTop: 72,
    paddingBottom: 56,
    width: "100%" as const,
  } as ViewStyle,
  tag: {
    alignSelf: "flex-start" as const,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  } as ViewStyle,
  title: {
    fontSize: isWide ? 64 : 38,
    fontWeight: "900" as const,
    letterSpacing: -2,
    lineHeight: isWide ? 72 : 46,
    marginBottom: 20,
  } as TextStyle,
  sub: {
    fontSize: isWide ? 18 : 16,
    lineHeight: 28,
    marginBottom: 36,
    maxWidth: isWide ? 600 : undefined,
  } as TextStyle,
  actions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    flexWrap: "wrap" as const,
  } as ViewStyle,
  ghostBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  } as ViewStyle,
};

const stats = {
  bar: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    marginHorizontal: 24,
    marginBottom: 56,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
  } as ViewStyle,
  item: { alignItems: "center" as const } as ViewStyle,
};

const section = {
  wrap: { paddingHorizontal: 24, marginBottom: 28 } as ViewStyle,
  tag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: "uppercase" as const,
  } as TextStyle,
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 10,
  } as TextStyle,
  sub: { fontSize: 16, lineHeight: 26 } as TextStyle,
};

const grid = {
  wrap: { paddingHorizontal: 24, gap: 16, marginBottom: 60 } as ViewStyle,
};

const card = {
  base: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    minHeight: 320,
  } as ViewStyle,
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
  } as ViewStyle,
  title: { fontSize: 18, fontWeight: "800", marginBottom: 8 } as TextStyle,
  body: { fontSize: 14, lineHeight: 22, marginBottom: 20 } as TextStyle,
  demo: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    justifyContent: "center" as const,
  } as ViewStyle,
};

const toggle = {
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center" as const,
  } as ViewStyle,
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  } as ViewStyle,
};

const counter = {
  btn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  } as ViewStyle,
};

const override = {
  row: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  } as ViewStyle,
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  } as ViewStyle,
};

const footer = {
  wrap: {
    paddingHorizontal: 24,
    paddingTop: 32,
    borderTopWidth: 1,
    alignItems: "center" as const,
    gap: 8,
  } as ViewStyle,
  brand: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  } as ViewStyle,
  dot: { width: 6, height: 6, borderRadius: 3 } as ViewStyle,
};

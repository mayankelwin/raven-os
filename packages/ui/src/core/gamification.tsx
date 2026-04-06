import React, { useState, useEffect, useCallback } from 'react';
import { useRavenNexus } from './nexus';

export interface ScoreEntry {
    userId: string;
    userName: string;
    score: number;
    timestamp: number;
}

/**
 * useRavenGamification — Global Secure Gamification Hook (V12)
 * Handles scores, leaderboards, and achievements across any project.
 */
export function useRavenGamification(room: string = 'global_ranks') {
    // We use a persistent Nexus room for the leaderboard
    const nexus = useRavenNexus<Record<string, ScoreEntry>>({
        room,
        initialValue: {},
        persist: true,
        encrypt: true, // Secure high scores
        nexusKey: 'raven-gamify-secure'
    });

    /**
     * Submit a new score to the global leaderboard.
     */
    const submitScore = useCallback((entry: Omit<ScoreEntry, 'timestamp'>) => {
        const fullEntry = { ...entry, timestamp: Date.now() };
        const currentData = (nexus.data as Record<string, ScoreEntry>) || {};
        
        // Only update if the score is higher or newer
        if (!currentData[entry.userId] || entry.score > currentData[entry.userId].score) {
            const newData = { ...currentData, [entry.userId]: fullEntry };
            nexus.broadcastDelta(newData);
        }
    }, [nexus]);

    /**
     * Get sorted list of top players.
     */
    const getLeaderboard = useCallback(() => {
        const data = (nexus.data as Record<string, ScoreEntry>) || {};
        return Object.values(data).sort((a, b) => b.score - a.score);
    }, [nexus.data]);

    return {
        leaderboard: getLeaderboard(),
        submitScore,
        presence: nexus.presence // Who is currently competing?
    };
}

/**
 * NexusLeaderboard — Collaborative UI Component
 */
export function NexusLeaderboard({ room }: { room?: string }) {
    const { leaderboard, presence } = useRavenGamification(room);

    return (
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                🏆 Global Leaderboard
                <span style={{ marginLeft: '10px', fontSize: '10px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                     {Object.keys(presence).length} Online
                </span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leaderboard.length === 0 && <p style={{ color: '#64748b' }}>No scores yet. Be the first!</p>}
                {leaderboard.map((entry, index) => (
                    <div 
                        key={entry.userId}
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: '10px 15px', 
                            background: index === 0 ? 'rgba(99,102,241,0.1)' : '#0f172a',
                            borderRadius: '8px',
                            borderLeft: index === 0 ? '3px solid #6366f1' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <span style={{ color: '#6366f1', fontWeight: 'bold' }}>#{index + 1}</span>
                            <span>{entry.userName}</span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>{entry.score} pts</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

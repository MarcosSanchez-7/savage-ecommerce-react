import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    isAdmin: boolean;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
    signUpWithEmail: (email: string, password: string, data?: any) => Promise<{ error: any, data: any }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string, currentUserEmail?: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data);
                // CLEAN SECURITY CHECK: Role must be 'ceo'
                setIsAdmin(data.role === 'ceo');
            } else {
                setProfile(null);
                setIsAdmin(false);
            }
        } catch (error) {
            console.error("AuthContext: Error fetching profile.", error);
            setProfile(null);
            setIsAdmin(false);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email);
            }
            setLoading(false);
        }).catch(err => {
            console.error("AuthContext: Failed to get session", err);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            try {
                if (session?.user) {
                    // Only fetch if profile isn't already synced or user changed
                    await fetchProfile(session.user.id, session.user.email);
                } else {
                    setProfile(null);
                    setIsAdmin(false);
                }
            } catch (e) {
                console.error("AuthContext: Profile sync error", e);
            } finally {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUpWithEmail = async (email: string, password: string, userData?: any) => {
        // Pass user data as metadata so the Trigger can create the profile
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: userData?.first_name,
                    last_name: userData?.last_name,
                    city: userData?.city,
                    phone: userData?.phone
                }
            }
        });

        // If trigger works, profile exists immediately, or we fetch it shortly after
        if (!error && data.user) {
            // Optional: Fetch profile immediately just in case
            await fetchProfile(data.user.id, email);
        }

        return { data, error };
    };

    const signOut = async () => {
        // Instant Logout UI
        setProfile(null);
        setIsAdmin(false);
        setUser(null);
        setSession(null);

        // Clear persistence immediatey
        window.localStorage.clear();

        // Fire and forget to Supabase to kill server session
        supabase.auth.signOut();
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id, user.email);
        }
    };

    // Safety Timeout to prevent Black Screen
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("AuthContext: Force stopping loading state after timeout.");
                setLoading(false);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [loading]);

    return (
        <AuthContext.Provider value={{ session, user, profile, isAdmin, loading, signInWithEmail, signUpWithEmail, signOut, refreshProfile }}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-black text-white">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        <p className="text-xs uppercase tracking-widest text-gray-500 animate-pulse">Cargando Savage...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

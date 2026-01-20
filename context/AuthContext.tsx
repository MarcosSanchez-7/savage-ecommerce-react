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
            console.log("AuthContext: Fetching profile for", userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error("AuthContext: Error fetching profile from DB:", error);
            }

            if (data) {
                console.log("AuthContext: Profile found:", data.role);
                setProfile(data);
                // CLEAN SECURITY CHECK: Role must be 'ceo'
                const isCeo = data.role === 'ceo';
                setIsAdmin(isCeo);
                console.log("AuthContext: isAdmin set to:", isCeo);
            } else {
                console.warn("AuthContext: No profile found for user.");
                setProfile(null);
                setIsAdmin(false);
            }
        } catch (error) {
            console.error("AuthContext: Exception fetching profile.", error);
            setProfile(null);
            setIsAdmin(false);
        }
    };

    useEffect(() => {
        // 1. Initialize Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            // Loading handled by the user-effect below
        }).catch(err => {
            console.error("AuthContext: Failed to get session", err);
            setLoading(false);
        });

        // 2. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("AuthContext: Auth change event:", _event);
            setSession(session);
            setUser(session?.user ?? null);

            // If we signed out, clear everything immediately
            if (_event === 'SIGNED_OUT' || !session) {
                setProfile(null);
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 3. Dedicated Effect for Profile Fetching (Prevents Loops)
    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            // If no user, we are done loading (unless we are in the middle of a sign-in check, but session init handles that)
            if (!user) {
                if (session === null) setLoading(false); // Only stop loading if session is definitely null
                return;
            }

            // If we already have a profile for this user, don't re-fetch
            if (profile && profile.id === user.id) {
                setLoading(false);
                return;
            }

            console.log("AuthContext: User detected, fetching profile...", user.id);

            // Safety Timeout logic
            const timeoutId = setTimeout(() => {
                if (isMounted && loading) {
                    console.warn("AuthContext: Profile fetch timed out (5s). Force releasing lock.");
                    setLoading(false);
                }
            }, 5000);

            await fetchProfile(user.id, user.email);

            if (isMounted) {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };

        loadProfile();

        return () => { isMounted = false; };
    }, [user?.id]); // Only re-run if specific user ID changes

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

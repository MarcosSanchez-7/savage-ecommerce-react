import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
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

    const fetchProfile = async (userId: string) => {
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
                console.log("AuthContext: Profile found, Role:", data.role);
                setProfile(data);

                // SECURITY ENFORCEMENT: Only 'admin' role is allowed
                const hasAdminPrivileges = data.role === 'admin';
                setIsAdmin(hasAdminPrivileges);

                if (hasAdminPrivileges) {
                    console.log("AuthContext: Admin privileges GRANTED.");
                } else {
                    console.log("AuthContext: Admin privileges DENIED.");
                }

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
            // If no session, stop loading immediately
            if (!session) setLoading(false);
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
            } else {
                // If signed in, start loading again until profile is fetched
                setLoading(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 3. Dedicated Effect for Profile Fetching (Prevents Loops)
    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            // Wait for session check to complete first (handled by initial getSession)
            if (!user) {
                // If session is checked and null, we are done.
                // But we must be careful not to set loading=false prematurely if getSession hasn't returned?
                // Actually the getSession promise handles the initial false.
                return;
            }

            // Optimization: If we already have the correct profile, verify one last time and stop loading
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

            await fetchProfile(user.id);

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

        if (!error && data.user) {
            await fetchProfile(data.user.id);
        }

        return { data, error };
    };

    const signOut = async () => {
        setProfile(null);
        setIsAdmin(false);
        setUser(null);
        setSession(null);
        window.localStorage.clear();
        await supabase.auth.signOut();
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    // Safety Timeout specific to 'loading' remaining true if something gets stuck
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                console.warn("AuthContext: Safety release of loading state.");
                setLoading(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [loading]);


    return (
        <AuthContext.Provider value={{ session, user, profile, isAdmin, loading, signInWithEmail, signUpWithEmail, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

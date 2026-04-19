import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setUserProfile(null);
                setLoading(false);
                return;
            }

            try {
                const profileRef = doc(db, 'users', firebaseUser.uid);
                const profileSnap = await getDoc(profileRef);

                if (!profileSnap.exists()) {
                    // User profile missing — deny access
                    await firebaseSignOut(auth);
                    setUser(null);
                    setUserProfile(null);
                    setAuthError('Access denied. Your account is not registered in the system.');
                    setLoading(false);
                    return;
                }

                const profile = profileSnap.data();
                if (!['admin', 'staff'].includes(profile.role)) {
                    // Role not allowed
                    await firebaseSignOut(auth);
                    setUser(null);
                    setUserProfile(null);
                    setAuthError('Access denied. You do not have permission to use this application.');
                    setLoading(false);
                    return;
                }

                // Update lastLoginAt
                await setDoc(profileRef, { lastLoginAt: serverTimestamp() }, { merge: true });

                setUser(firebaseUser);
                setUserProfile(profile);
                setAuthError('');
            } catch (err) {
                console.error('Error loading user profile:', err);
                setAuthError('Failed to verify your account. Please try again.');
                await firebaseSignOut(auth);
                setUser(null);
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        setAuthError('');
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // onAuthStateChanged will handle the rest
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setAuthError(err.message || 'Google sign-in failed. Please try again.');
            }
            throw err;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setUserProfile(null);
    };

    const value = {
        user,
        userProfile,
        loading,
        authError,
        setAuthError,
        signInWithGoogle,
        signOut,
        isAuthenticated: !!user && !!userProfile,
        isAdmin: userProfile?.role === 'admin',
        isStaff: userProfile?.role === 'staff'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

import { SignOutButton } from '@/components/SignOutButton';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { user } = useUser();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <SignedIn>
                <View style={styles.avatar}>
                    {user?.imageUrl ? (
                        <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{user?.emailAddresses[0].emailAddress?.[0].toUpperCase()}</Text>
                    )}
                </View>
                <Text style={styles.name}>{user?.fullName || 'User'}</Text>
                <Text style={styles.email}>{user?.emailAddresses[0].emailAddress}</Text>

                <SignOutButton />
            </SignedIn>

            <SignedOut>
                <View style={styles.emptyState}>
                    <MaterialIcons name="account-circle" size={80} color="#ccc" />
                    <Text style={styles.title}>Not Signed In</Text>
                    <Text style={styles.subtitle}>Sign in to save your favorite places and access your profile.</Text>

                    <View style={styles.authButtons}>
                        <Link href="/(auth)/sign-in" asChild>
                            <TouchableOpacity style={styles.signInButton}>
                                <Text style={styles.signInText}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>

                        <Link href="/(auth)/sign-up" asChild>
                            <TouchableOpacity style={[styles.signInButton, styles.signUpButton]}>
                                <Text style={[styles.signInText, styles.signUpText]}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </SignedOut>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1A73E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarText: {
        fontSize: 40,
        color: 'white',
        fontWeight: 'bold',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        color: '#5f6368',
        marginBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#202124',
    },
    subtitle: {
        fontSize: 14,
        color: '#5f6368',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    authButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    signInButton: {
        backgroundColor: '#1A73E8',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
    },
    signInText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    signUpButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#1A73E8',
    },
    signUpText: {
        color: '#1A73E8',
    }
});

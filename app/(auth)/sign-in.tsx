import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser'
import { useOAuth, useSignIn } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

// This must be called outside the component to complete OAuth flow
WebBrowser.maybeCompleteAuthSession()

export default function Page() {
    useWarmUpBrowser()
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [oauthLoading, setOauthLoading] = React.useState(false)

    const onSelectAuth = React.useCallback(async () => {
        setOauthLoading(true)
        try {
            const { createdSessionId, setActive } = await startOAuthFlow()

            if (createdSessionId) {
                await setActive!({ session: createdSessionId })
                router.replace('/(tabs)')
            }
        } catch (err: any) {
            console.error('OAuth error', err)
            alert(err?.message || 'OAuth sign in failed')
        } finally {
            setOauthLoading(false)
        }
    }, [startOAuthFlow, router])

    const onSignInPress = async () => {
        if (!isLoaded) return
        setIsLoading(true)

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace('/')
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
                alert('Sign in failed. Please check your credentials.')
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
            alert(err.errors?.[0]?.message || 'An error occurred during sign in')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            value={emailAddress}
                            placeholder="Email Address"
                            placeholderTextColor="#999"
                            onChangeText={setEmailAddress}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={password}
                            placeholder="Password"
                            placeholderTextColor="#999"
                            secureTextEntry={true}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={onSignInPress}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>Or continue with</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity
                    style={[styles.googleButton, oauthLoading && styles.buttonDisabled]}
                    onPress={onSelectAuth}
                    disabled={oauthLoading || isLoading}
                >
                    <Ionicons name="logo-google" size={20} color="#000" style={styles.googleIcon} />
                    <Text style={styles.googleButtonText}>
                        {oauthLoading ? 'Connecting...' : 'Sign in with Google'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <Link href="/sign-up">
                        <Text style={styles.link}>Sign up</Text>
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
        height: '100%',
    },
    button: {
        backgroundColor: '#1A73E8',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#1A73E8',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#A0C1F7',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#EEEEEE',
    },
    orText: {
        marginHorizontal: 16,
        color: '#999',
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        height: 56,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        marginBottom: 24,
    },
    googleIcon: {
        marginRight: 12,
    },
    googleButtonText: {
        color: '#1A1A1A',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    link: {
        color: '#1A73E8',
        fontSize: 14,
        fontWeight: '700',
    },
});

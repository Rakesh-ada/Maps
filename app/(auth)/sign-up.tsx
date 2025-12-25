import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser'
import { useOAuth, useSignUp } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import { Link, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as React from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

export default function SignUpScreen() {
    useWarmUpBrowser()
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)

    const onSelectAuth = React.useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
                redirectUrl: Linking.createURL('/'),
            })

            if (createdSessionId) {
                setActive!({ session: createdSessionId })
            } else {
                // Use signIn or signUp for next steps such as MFA
            }
        } catch (err) {
            console.error('OAuth error', err)
        }
    }, [])

    const onSignUpPress = async () => {
        if (!isLoaded) return
        setIsLoading(true)

        try {
            await signUp.create({
                emailAddress,
                password,
            })

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

        } catch (err: any) {
            // console.error(JSON.stringify(err, null, 2)) // Don't log full error to avoid scary terminal output

            const errors = err.errors || []
            const passwordError = errors.find((e: any) => e.code === 'form_password_pwned')
            const emailError = errors.find((e: any) => e.code === 'form_identifier_exists')

            if (passwordError) {
                alert('Please choose a stronger password. This one has been found in a data breach.')
            } else if (emailError) {
                alert('This email is already taken. Please sign in instead.')
            } else {
                alert(errors[0]?.message || 'An error occurred during sign up')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const onVerifyPress = async () => {
        if (!isLoaded) return
        setIsLoading(true)

        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                router.replace('/')
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2))
                alert('Verification failed. Please check your code.')
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsLoading(false)
        }
    }

    if (pendingVerification) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Verify Email</Text>
                        <Text style={styles.subtitle}>Enter the code sent to your email</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={code}
                                placeholder="Verification Code"
                                placeholderTextColor="#999"
                                onChangeText={setCode}
                                keyboardType="number-pad"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={onVerifyPress}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify Email'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>
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
                        onPress={onSignUpPress}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>{isLoading ? 'Creating account...' : 'Sign Up'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>Or sign up with</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity style={styles.googleButton} onPress={onSelectAuth}>
                    <Ionicons name="logo-google" size={20} color="#000" style={styles.googleIcon} />
                    <Text style={styles.googleButtonText}>Sign up with Google</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Link href="/sign-in">
                        <Text style={styles.link}>Sign in</Text>
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

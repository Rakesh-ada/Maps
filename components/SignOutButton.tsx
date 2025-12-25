import { useClerk } from '@clerk/clerk-expo'
import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
    const { signOut } = useClerk()

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={24} color="#EA4335" />
            <Text style={styles.text}>Sign out</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#EA4335',
        borderRadius: 8,
    },
    text: {
        color: '#EA4335',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    }
});

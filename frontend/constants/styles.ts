import { StyleSheet, Platform } from 'react-native';
import { Colors } from './Colors';

export const getStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      padding: 20,
      gap: 12,
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      padding: 10,
      marginBottom: 10,
      borderRadius: 8,
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 10,
      color: Colors[colorScheme].text,
    },
    statusBlock: {
      gap: 8,
      marginBottom: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
    },
    tabBar: {
      position: 'absolute',
      borderTopWidth: 0,
      elevation: 0,
      height: 60,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      backgroundColor: Colors[colorScheme].background,
    },
        authContainer: {
      padding: 24,
      flex: 1,
      justifyContent: 'center',
      backgroundColor: Colors[colorScheme].background,
    },
    authTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 24,
      color: Colors[colorScheme].text,
      textAlign: 'center',
    },
    authInput: {
      height: 50,
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].card,
      marginBottom: 16,
    },
    authButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    authButtonText: {
      color: Colors[colorScheme].background,
      fontSize: 16,
      fontWeight: '600',
    },
    authLinkText: {
      marginTop: 12,
      textAlign: 'center',
      color: Colors[colorScheme].text,
      fontSize: 14,
    },
    authLinkHighlight: {
      color: Colors[colorScheme].tint,
      fontWeight: '600',
    },
    button: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonText: {
      color: Colors[colorScheme].background,
      fontSize: 16,
      fontWeight: '600',
    },
    //Used for friends page
    card: {
      backgroundColor: Colors[colorScheme].card ?? '#1e1e1e',
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    label: {
      fontSize: 16,
      marginTop: 12,
      marginBottom: 4,
      color: colorScheme === 'dark' ? '#ccc' : '#333',
    },

    
  });

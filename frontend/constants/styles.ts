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
  });

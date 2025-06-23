import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

const LOGIN_URL = 'https://qxlezobmjj.execute-api.us-east-2.amazonaws.com/default/loginUser'

export default function loginScreen(){
    



}
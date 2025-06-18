import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import axios from 'axios';

//Variables
const [friendId, setFriendId] = useState('');
const [maxHR, setMaxHR] = useState('');
const [minHR, setMinHR] = useState('');
const [maxStress, setMaxStress] = useState('');
const [maxDistance, setMaxDistance] = useState('');
const [countdown, setCountdown] = useState('');

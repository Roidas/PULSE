import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendsListScreen from './FriendsListScreen';
import AddFriendScreen from './AddFriendScreen';

const Stack = createNativeStackNavigator();

export default function FriendsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FriendsList"
        component={FriendsListScreen}
        options={{ title: 'Friends' }}
      />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendScreen}
      />
    </Stack.Navigator>
  );
}
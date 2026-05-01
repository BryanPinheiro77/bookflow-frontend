import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          height: 82,
          paddingTop: 8,
          paddingBottom: 14,
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="livros"
        options={{
          title: 'Acervo',
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="meus-emprestimos"
        options={{
          title: 'Empréstimos',
          tabBarIcon: ({ color }) => (
            <Ionicons name="library-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notificacoes"
        options={{
          title: 'Notificaçoes',
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
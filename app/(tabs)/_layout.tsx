import { IconSymbol } from '@/components/ui/IconSymbol';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProductosScreen"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="wrench.and.screwdriver" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ServiciosScreen"
        options={{
          title: 'Servicios',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="star.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="GaleriaScreen"
        options={{
          title: 'Galería',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="photo.on.rectangle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
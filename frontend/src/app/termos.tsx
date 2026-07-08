import React from 'react';
import { View, Text } from 'react-native';

export default function TermosFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
      <Text style={{ fontSize: 18, color: '#0F5132' }}>Termos de Uso</Text>
      <Text style={{ fontSize: 14, color: '#64748B', marginTop: 10 }}>Acesse via versão Web para ler o documento completo.</Text>
    </View>
  );
}

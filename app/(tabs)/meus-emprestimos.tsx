import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import MeusEmprestimosScreen from '../../src/screens/MeusEmprestimosScreen';
import EmprestimosAcervoScreen from '../../src/screens/EmprestimosAcervoScreen';
import { buscarRole } from '../../src/services/api';

export default function EmprestimosRoute() {
  const [role, setRole] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function carregarRole() {
    const roleSalva = await buscarRole();
    setRole(roleSalva);
    setCarregando(false);
  }

  useEffect(() => {
    carregarRole();
  }, []);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (role === 'ADMIN') {
    return <EmprestimosAcervoScreen />;
  }

  return <MeusEmprestimosScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
});
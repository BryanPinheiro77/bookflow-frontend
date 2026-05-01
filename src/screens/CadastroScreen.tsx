import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function CadastroRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nome" />
        <TextInput style={styles.input} placeholder="E-mail" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Senha" secureTextEntry />

        <Pressable style={styles.button} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Voltar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  form: {
    width: '100%',
    maxWidth: 420,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '600',
  },
});
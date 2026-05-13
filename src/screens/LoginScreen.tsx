import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { apiFetch, salvarSessao } from '../../src/services/api';

export default function LoginRoute() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  async function handleLogin() {
    setMensagemErro('');

    if (!email.trim() || !senha.trim()) {
      setMensagemErro('Preencha e-mail e senha.');
      return;
    }

    try {
      setCarregando(true);

      const response = await apiFetch('/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          email: email.trim(),
          senha: senha.trim(),
        }),
      });

      await salvarSessao(response.token, response.role);

      router.replace('/home' as any);
    } catch {
      setMensagemErro('E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BookFlow</Text>
      <Text style={styles.subtitle}>Entre na sua conta</Text>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={[styles.input, mensagemErro && !email.trim() && styles.inputError]}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setMensagemErro('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={[styles.input, mensagemErro && !senha.trim() && styles.inputError]}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={(value) => {
            setSenha(value);
            setMensagemErro('');
          }}
          secureTextEntry
        />

        <Pressable
          style={[styles.button, carregando && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>

        {mensagemErro ? (
          <Text style={styles.errorText}>{mensagemErro}</Text>
        ) : null}

        <Pressable onPress={() => router.push('/cadastro' as any)}>
          <Text style={styles.link}>Ainda não tenho conta</Text>
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 420,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 14,
  },
  link: {
    textAlign: 'center',
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
});
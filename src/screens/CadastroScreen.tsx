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
import { apiFetch } from '../services/api';

export default function CadastroRoute() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function cadastrar() {
    setMensagem('');

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha.trim()
    ) {
      setMensagem('Preencha todos os campos.');
      return;
    }

    try {
      setCarregando(true);

      await apiFetch('/auth/cadastrar', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          senha: senha.trim(),
          role: 'USUARIO',
        }),
      });

      router.replace('/login' as any);
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o cadastro.';

      setMensagem(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nome</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>E-mail</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {mensagem ? (
          <Text style={styles.message}>
            {mensagem}
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.button,
            carregando && styles.buttonDisabled,
          ]}
          onPress={cadastrar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Cadastrar
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>
            Voltar
          </Text>
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

  message: {
    color: '#dc2626',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 14,
  },

  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  link: {
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '600',
  },
});
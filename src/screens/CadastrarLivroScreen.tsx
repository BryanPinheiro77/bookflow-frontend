import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { apiFetch } from '../services/api';

export default function CadastrarLivroScreen() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [categoria, setCategoria] = useState('');

  const [quantidadeTotal, setQuantidadeTotal] = useState('');
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState('');

  const [valorEmprestimo, setValorEmprestimo] = useState('');
  const [valorMultaDiaria, setValorMultaDiaria] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function cadastrarLivro() {
    setMensagem('');

    if (
      !titulo.trim() ||
      !autor.trim() ||
      !categoria.trim() ||
      !quantidadeTotal.trim() ||
      !quantidadeDisponivel.trim() ||
      !valorEmprestimo.trim() ||
      !valorMultaDiaria.trim()
    ) {
      setMensagem('Preencha todos os campos.');
      return;
    }

    const quantidadeTotalNumero = Number(quantidadeTotal);
    const quantidadeDisponivelNumero = Number(quantidadeDisponivel);

    if (quantidadeDisponivelNumero > quantidadeTotalNumero) {
      setMensagem(
        'Quantidade disponível não pode ser maior que a total.'
      );

      return;
    }

    try {
      setCarregando(true);

      await apiFetch('/livros', {
        method: 'POST',
        body: JSON.stringify({
          titulo: titulo.trim(),
          autor: autor.trim(),
          categoria: categoria.trim(),

          quantidadeTotal: quantidadeTotalNumero,
          quantidadeDisponivel: quantidadeDisponivelNumero,

          valorEmprestimo: Number(valorEmprestimo),
          valorMultaDiaria: Number(valorMultaDiaria),
        }),
      });

      router.replace('/livros' as any);
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar o livro.';

      setMensagem(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Cadastrar Livro</Text>

        <View style={styles.placeholderRight} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Título</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite o título"
          placeholderTextColor="#6b7280"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Autor</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite o autor"
          placeholderTextColor="#6b7280"
          value={autor}
          onChangeText={setAutor}
        />

        <Text style={styles.label}>Categoria</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite a categoria"
          placeholderTextColor="#6b7280"
          value={categoria}
          onChangeText={setCategoria}
        />

        <Text style={styles.label}>Quantidade total</Text>

        <TextInput
          style={styles.input}
          placeholder="Quantidade total"
          placeholderTextColor="#6b7280"
          value={quantidadeTotal}
          onChangeText={setQuantidadeTotal}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Quantidade disponível</Text>

        <TextInput
          style={styles.input}
          placeholder="Quantidade disponível"
          placeholderTextColor="#6b7280"
          value={quantidadeDisponivel}
          onChangeText={setQuantidadeDisponivel}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Valor do empréstimo</Text>

        <TextInput
          style={styles.input}
          placeholder="Valor do empréstimo"
          placeholderTextColor="#6b7280"
          value={valorEmprestimo}
          onChangeText={setValorEmprestimo}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Valor da multa diária</Text>

        <TextInput
          style={styles.input}
          placeholder="Valor da multa diária"
          placeholderTextColor="#6b7280"
          value={valorMultaDiaria}
          onChangeText={setValorMultaDiaria}
          keyboardType="numeric"
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
          onPress={cadastrarLivro}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Cadastrar livro
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  content: {
    padding: 18,
    paddingBottom: 110,
  },

  header: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  placeholderRight: {
    width: 42,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  label: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    fontSize: 15,
  },

  message: {
    textAlign: 'center',
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 12,
  },

  button: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
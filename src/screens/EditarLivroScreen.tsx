import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../services/api';

type Livro = {
  id: number;
  titulo?: string;
  nome?: string;
  autor?: string;
  categoria?: string;
  status?: string;
  capaUrl?: string;

  quantidadeTotal?: number;
  quantidadeDisponivel?: number;

  valorEmprestimo?: number;
  valorMultaDiaria?: number;
};

export default function EditarLivroScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [categoria, setCategoria] = useState('');

  const [quantidadeTotal, setQuantidadeTotal] = useState('');
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState('');

  const [valorEmprestimo, setValorEmprestimo] = useState('');
  const [valorMultaDiaria, setValorMultaDiaria] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [mensagem, setMensagem] = useState('');

  async function carregarLivro() {
    if (!id) {
      setMensagem('Livro não informado.');
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);

      const livro: Livro = await apiFetch(`/livros/${id}`);

      setTitulo(livro.titulo || livro.nome || '');
      setAutor(livro.autor || '');
      setCategoria(livro.categoria || '');

      setQuantidadeTotal(
        livro.quantidadeTotal?.toString() || ''
      );

      setQuantidadeDisponivel(
        livro.quantidadeDisponivel?.toString() || ''
      );

      setValorEmprestimo(
        livro.valorEmprestimo?.toString() || ''
      );

      setValorMultaDiaria(
        livro.valorMultaDiaria?.toString() || ''
      );
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o livro.';

      setMensagem(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarAlteracoes() {
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
      setSalvando(true);

      await apiFetch(`/livros/${id}`, {
        method: 'PUT',
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
          : 'Não foi possível atualizar o livro.';

      setMensagem(mensagemErro);
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    carregarLivro();
  }, []);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>
          Carregando livro...
        </Text>
      </View>
    );
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

        <Text style={styles.headerTitle}>
          Editar Livro
        </Text>

        <View style={styles.placeholderRight} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Título</Text>

        <TextInput
          style={styles.input}
          placeholder="Título"
          placeholderTextColor="#6b7280"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Autor</Text>

        <TextInput
          style={styles.input}
          placeholder="Autor"
          placeholderTextColor="#6b7280"
          value={autor}
          onChangeText={setAutor}
        />

        <Text style={styles.label}>Categoria</Text>

        <TextInput
          style={styles.input}
          placeholder="Categoria"
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
            salvando && styles.buttonDisabled,
          ]}
          onPress={salvarAlteracoes}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Salvar alterações
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },

  loadingText: {
    marginTop: 8,
    color: '#6b7280',
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
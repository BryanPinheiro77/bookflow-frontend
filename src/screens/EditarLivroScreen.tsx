import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch, apiUpload, API_BASE_URL } from '../services/api';

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

function getImageUrl(capaUrl?: string | null) {
  if (!capaUrl) {
    return null;
  }

  if (capaUrl.startsWith('http://') || capaUrl.startsWith('https://')) {
    return capaUrl;
  }

  return `${API_BASE_URL}${capaUrl}`;
}

export default function EditarLivroScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [categoria, setCategoria] = useState('');

  const [quantidadeTotal, setQuantidadeTotal] = useState('');
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState('');

  const [valorEmprestimo, setValorEmprestimo] = useState('');
  const [valorMultaDiaria, setValorMultaDiaria] = useState('');

  const [capaUrl, setCapaUrl] = useState<string | null>(null);
  const [imagemCapa, setImagemCapa] = useState<string | null>(null);

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

      setQuantidadeTotal(livro.quantidadeTotal?.toString() || '');
      setQuantidadeDisponivel(livro.quantidadeDisponivel?.toString() || '');

      setValorEmprestimo(livro.valorEmprestimo?.toString() || '');
      setValorMultaDiaria(livro.valorMultaDiaria?.toString() || '');

      setCapaUrl(livro.capaUrl || null);
      setImagemCapa(null);
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

  async function escolherImagem() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagemCapa(resultado.assets[0].uri);
      setMensagem('');
    }
  }

  async function enviarCapa(livroId: number, imagemUri: string) {
    const formData = new FormData();

    formData.append('file', {
      uri: imagemUri,
      name: 'capa.jpg',
      type: 'image/jpeg',
    } as any);

    await apiUpload(`/livros/${livroId}/capa`, formData);
  }

  async function removerCapa() {
    if (!id) return;

    try {
      setSalvando(true);
      setMensagem('');

      const livroAtualizado: Livro = await apiFetch(`/livros/${id}/capa`, {
        method: 'DELETE',
      });

      setCapaUrl(livroAtualizado.capaUrl || null);
      setImagemCapa(null);
      setMensagem('Capa removida com sucesso.');
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível remover a capa.';

      setMensagem(mensagemErro);
    } finally {
      setSalvando(false);
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
      setMensagem('Quantidade disponível não pode ser maior que a total.');
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

          capaUrl,
        }),
      });

      if (id && imagemCapa) {
        await enviarCapa(Number(id), imagemCapa);
      }

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

  const imageUrl = imagemCapa || getImageUrl(capaUrl);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Carregando livro...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Editar Livro</Text>

        <View style={styles.placeholderRight} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Capa do livro</Text>

        <View style={styles.coverArea}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText}>Sem capa</Text>
            </View>
          )}
        </View>

        <Pressable style={styles.secondaryButton} onPress={escolherImagem}>
          <Text style={styles.secondaryButtonText}>
            {imageUrl ? 'Trocar capa' : 'Selecionar capa'}
          </Text>
        </Pressable>

        {imageUrl ? (
          <Pressable style={styles.removeCoverButton} onPress={removerCapa}>
            <Text style={styles.removeCoverButtonText}>Remover capa</Text>
          </Pressable>
        ) : null}

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

        {mensagem ? <Text style={styles.message}>{mensagem}</Text> : null}

        <Pressable
          style={[styles.button, salvando && styles.buttonDisabled]}
          onPress={salvarAlteracoes}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Salvar alterações</Text>
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

sectionTitle: {
  color: '#111827',
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 10,
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

  coverArea: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },

  coverImage: {
    width: 140,
    height: 200,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },

  coverPlaceholder: {
    width: 140,
    height: 200,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coverPlaceholderText: {
    color: '#6b7280',
    fontWeight: '600',
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

  secondaryButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
  },

  secondaryButtonText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },

  removeCoverButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  removeCoverButtonText: {
    color: '#dc2626',
    fontWeight: 'bold',
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
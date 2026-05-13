import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  ScrollView,
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
};

type ImagemSelecionada = {
  uri: string;
  name: string;
  type: string;
};

function getImageUrl(capaUrl?: string | null) {
  if (!capaUrl) return null;

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
  const [capaAtualUrl, setCapaAtualUrl] = useState<string | null>(null);
  const [novaImagem, setNovaImagem] = useState<ImagemSelecionada | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function carregarLivro() {
    if (!id) {
      setErro('Livro não informado.');
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      setMensagem('');

      const livro: Livro = await apiFetch(`/livros/${id}`);

      setTitulo(livro.titulo || livro.nome || '');
      setAutor(livro.autor || '');
      setCategoria(livro.categoria || '');
      setCapaAtualUrl(livro.capaUrl || null);
    } catch (error) {
      const mensagemErro =
        error instanceof Error ? error.message : 'Não foi possível carregar o livro.';

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarImagem() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (resultado.canceled) return;

    const asset = resultado.assets[0];

    setNovaImagem({
      uri: asset.uri,
      name: asset.fileName || `capa-livro-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    });
  }

  async function montarFormDataDaImagem() {
    if (!novaImagem) return null;

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(novaImagem.uri);
      const blob = await response.blob();

      const file = new File([blob], novaImagem.name, {
        type: novaImagem.type,
      });

      formData.append('file', file);
    } else {
      formData.append('file', {
        uri: novaImagem.uri,
        name: novaImagem.name,
        type: novaImagem.type,
      } as any);
    }

    return formData;
  }

  async function salvarAlteracoes() {
    if (!id) {
      setMensagem('Livro não informado.');
      return;
    }

    if (!titulo.trim() || !autor.trim() || !categoria.trim()) {
      setMensagem('Preencha título, autor e categoria.');
      return;
    }

    try {
      setSalvando(true);
      setMensagem('');

      await apiFetch(`/livros/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          titulo: titulo.trim(),
          autor: autor.trim(),
          categoria: categoria.trim(),
        }),
      });

      if (novaImagem) {
        const formData = await montarFormDataDaImagem();

        if (formData) {
          await apiUpload(`/livros/${id}/capa`, formData);
        }
      }

      setMensagem('Livro atualizado com sucesso.');
      router.replace('/livros' as any);
    } catch (error) {
      const mensagemErro =
        error instanceof Error ? error.message : 'Não foi possível atualizar o livro.';

      setMensagem(mensagemErro);
    } finally {
      setSalvando(false);
    }
  }

  async function removerCapa() {
    if (!id) return;

    try {
      setSalvando(true);
      setMensagem('');

      await apiFetch(`/livros/${id}/capa`, {
        method: 'DELETE',
      });

      setCapaAtualUrl(null);
      setNovaImagem(null);
      setMensagem('Capa removida com sucesso.');
    } catch (error) {
      const mensagemErro =
        error instanceof Error ? error.message : 'Não foi possível remover a capa.';

      setMensagem(mensagemErro);
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    carregarLivro();
  }, [id]);

  const capaParaExibir = novaImagem?.uri || getImageUrl(capaAtualUrl);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Carregando livro...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Livro</Text>

      {erro ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{erro}</Text>

          <Pressable style={styles.retryButton} onPress={carregarLivro}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Título"
            placeholderTextColor="#6b7280"
            value={titulo}
            onChangeText={setTitulo}
          />

          <TextInput
            style={styles.input}
            placeholder="Autor"
            placeholderTextColor="#6b7280"
            value={autor}
            onChangeText={setAutor}
          />

          <TextInput
            style={styles.input}
            placeholder="Categoria"
            placeholderTextColor="#6b7280"
            value={categoria}
            onChangeText={setCategoria}
          />

          <View style={styles.coverArea}>
            {capaParaExibir ? (
              <Image source={{ uri: capaParaExibir }} style={styles.preview} resizeMode="cover" />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.coverPlaceholderText}>Sem capa</Text>
              </View>
            )}
          </View>

          <Pressable style={styles.imageButton} onPress={selecionarImagem}>
            <Text style={styles.imageButtonText}>
              {capaAtualUrl || novaImagem ? 'Trocar capa' : 'Selecionar capa'}
            </Text>
          </Pressable>

          {(capaAtualUrl || novaImagem) && (
            <Pressable style={styles.removeCoverButton} onPress={removerCapa}>
              <Text style={styles.removeCoverText}>Remover capa</Text>
            </Pressable>
          )}

          {mensagem ? (
            <Text
              style={[
                styles.message,
                mensagem.toLowerCase().includes('sucesso')
                  ? styles.successMessage
                  : styles.errorMessage,
              ]}
            >
              {mensagem}
            </Text>
          ) : null}

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
        </>
      )}

      <Pressable onPress={() => router.replace('/livros' as any)}>
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#ffffff' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', paddingBottom: 110 },
  loadingContainer: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#6b7280', marginTop: 8 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 28 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  coverArea: { alignItems: 'center', marginTop: 6, marginBottom: 14 },
  preview: { width: 120, height: 170, borderRadius: 12, backgroundColor: '#e5e7eb' },
  coverPlaceholder: {
    width: 120,
    height: 170,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: { color: '#6b7280', fontWeight: '600' },
  imageButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#eff6ff',
  },
  imageButtonText: { color: '#2563eb', fontWeight: 'bold', fontSize: 15 },
  removeCoverButton: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#fef2f2',
  },
  removeCoverText: { color: '#dc2626', fontWeight: 'bold' },
  button: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  backText: { color: '#2563eb', fontWeight: '600', textAlign: 'center' },
  message: { textAlign: 'center', fontWeight: '600', marginBottom: 8 },
  successMessage: { color: '#16a34a' },
  errorMessage: { color: '#dc2626' },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 14, padding: 14, marginBottom: 16 },
  errorText: { color: '#991b1b', marginBottom: 12 },
  retryButton: { backgroundColor: '#dc2626', padding: 10, borderRadius: 10, alignItems: 'center' },
  retryButtonText: { color: '#ffffff', fontWeight: 'bold' },
});
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch, apiUpload } from '../services/api';

type ImagemSelecionada = {
  uri: string;
  name: string;
  type: string;
};

export default function CadastrarLivroScreen() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagem, setImagem] = useState<ImagemSelecionada | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function selecionarImagem() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (resultado.canceled) {
      return;
    }

    const asset = resultado.assets[0];

    const nomeArquivo =
      asset.fileName || `capa-livro-${Date.now()}.jpg`;

    const tipoArquivo =
      asset.mimeType || 'image/jpeg';

    setImagem({
      uri: asset.uri,
      name: nomeArquivo,
      type: tipoArquivo,
    });
  }

  async function montarFormDataDaImagem() {
    if (!imagem) {
      return null;
    }

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(imagem.uri);
      const blob = await response.blob();

      const file = new File([blob], imagem.name, {
        type: imagem.type,
      });

      formData.append('file', file);
    } else {
      formData.append('file', {
        uri: imagem.uri,
        name: imagem.name,
        type: imagem.type,
      } as any);
    }

    return formData;
  }

  async function cadastrarLivro() {
    if (!titulo.trim() || !autor.trim() || !categoria.trim()) {
      setMensagem('Preencha título, autor e categoria.');
      return;
    }

    try {
      setCarregando(true);
      setMensagem('');

      const livroCriado = await apiFetch('/livros', {
        method: 'POST',
        body: JSON.stringify({
          titulo: titulo.trim(),
          autor: autor.trim(),
          categoria: categoria.trim(),
        }),
      });

      if (imagem) {
        const formData = await montarFormDataDaImagem();

        if (formData) {
          await apiUpload(`/livros/${livroCriado.id}/capa`, formData);
        }
      }

      setMensagem('Livro cadastrado com sucesso.');
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
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Livro</Text>

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

      <Pressable style={styles.imageButton} onPress={selecionarImagem}>
        <Text style={styles.imageButtonText}>
          {imagem ? 'Trocar capa' : 'Selecionar capa'}
        </Text>
      </Pressable>

      {imagem && (
        <Image
          source={{ uri: imagem.uri }}
          style={styles.preview}
          resizeMode="cover"
        />
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
        style={[styles.button, carregando && styles.buttonDisabled]}
        onPress={cadastrarLivro}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.replace('/livros' as any)}>
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 28,
  },
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
  imageButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: '#eff6ff',
  },
  imageButtonText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
  preview: {
    width: 120,
    height: 170,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 14,
    backgroundColor: '#e5e7eb',
  },
  button: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backText: {
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  successMessage: {
    color: '#16a34a',
  },
  errorMessage: {
    color: '#dc2626',
  },
});
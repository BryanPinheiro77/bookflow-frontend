import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { apiFetch, buscarRole } from '../services/api';

type Livro = {
  id: number;
  titulo?: string;
  nome?: string;
  autor?: string;
  categoria?: string;
  status?: string;
  disponivel?: boolean;
};

export default function ListarLivrosScreen() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [busca, setBusca] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const isAdmin = role === 'ADMIN';
  const isUsuario = role === 'USUARIO';

  async function carregarLivros() {
    try {
      setCarregando(true);
      setErro('');

      const roleSalva = await buscarRole();
      setRole(roleSalva);

      const data = await apiFetch('/livros');
      setLivros(data);
    } catch (error) {
      setErro('Não foi possível carregar os livros.');
    } finally {
      setCarregando(false);
    }
  }

  async function registrarInteresse(livroId: number) {
  try {
    await apiFetch(`/interesses/livros/${livroId}`, {
      method: 'POST',
    });

    Alert.alert('Interesse registrado', 'Você será notificado sobre este livro.');
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : 'Não foi possível registrar interesse neste livro.';

    Alert.alert('Erro', mensagem);
  }
}

  useEffect(() => {
    carregarLivros();
  }, []);

  const livrosFiltrados = livros.filter((livro) => {
    const termo = busca.toLowerCase();

    return (
      livro.titulo?.toLowerCase().includes(termo) ||
      livro.nome?.toLowerCase().includes(termo) ||
      livro.autor?.toLowerCase().includes(termo) ||
      livro.categoria?.toLowerCase().includes(termo)
    );
  });

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/home' as any)}>
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Acervo</Text>

          {role && (
            <Text style={styles.roleText}>
              {isAdmin ? 'Administrador' : 'Usuário'}
            </Text>
          )}
        </View>

        {isAdmin ? (
          <Pressable onPress={() => router.push('/cadastrar-livro' as any)}>
            <Text style={styles.addText}>Novo</Text>
          </Pressable>
        ) : (
          <View style={styles.placeholderRight} />
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por título, autor ou categoria"
        placeholderTextColor="#9ca3af"
        value={busca}
        onChangeText={setBusca}
      />

      {carregando && (
        <View style={styles.feedbackBox}>
          <ActivityIndicator />
          <Text style={styles.feedbackText}>Carregando acervo...</Text>
        </View>
      )}

      {!carregando && erro ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{erro}</Text>

          <Pressable style={styles.retryButton} onPress={carregarLivros}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}

      {!carregando && !erro && livrosFiltrados.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Nenhum livro encontrado</Text>
          <Text style={styles.emptyText}>
            {isAdmin
              ? 'Cadastre um novo livro para começar a montar o acervo.'
              : 'Tente mudar a busca ou volte mais tarde.'}
          </Text>
        </View>
      )}

      {!carregando &&
        !erro &&
        livrosFiltrados.map((livro) => (
          <Pressable
            key={livro.id}
            style={styles.bookCard}
            onPress={() =>
              router.push({
                pathname: '/detalhes-livro',
                params: { id: livro.id },
              } as any)
            }
          >
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>
                {livro.titulo || livro.nome || 'Livro sem título'}
              </Text>

              <Text style={styles.bookAuthor}>
                {livro.autor || 'Autor não informado'}
              </Text>

              {livro.categoria ? (
                <Text style={styles.bookCategory}>{livro.categoria}</Text>
              ) : null}
            </View>

            <View style={styles.statusArea}>
              <Text style={styles.bookStatus}>
                {livro.status ||
                  (livro.disponivel === false ? 'Emprestado' : 'Disponível')}
              </Text>
{isAdmin && (
  <Pressable
    onPress={(event) => {
      event.stopPropagation();

      router.push({
        pathname: '/editar-livro',
        params: { id: livro.id },
      } as any);
    }}
  >
    <Text style={styles.editText}>Editar</Text>
  </Pressable>
)}

              {isUsuario && (
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    registrarInteresse(livro.id);
                  }}
                >
                  <Text style={styles.interestText}>Tenho interesse</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        ))}
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
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    alignItems: 'center',
  },
  backText: {
    color: '#d1d5db',
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  roleText: {
    color: '#93c5fd',
    fontSize: 12,
    marginTop: 2,
  },
  addText: {
    color: '#60a5fa',
    fontWeight: 'bold',
  },
  placeholderRight: {
    width: 38,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  feedbackBox: {
    alignItems: 'center',
    padding: 24,
  },
  feedbackText: {
    color: '#6b7280',
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 14,
  },
  errorText: {
    color: '#991b1b',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  emptyText: {
    color: '#6b7280',
  },
  bookCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bookAuthor: {
    color: '#6b7280',
    marginTop: 4,
  },
  bookCategory: {
    color: '#374151',
    marginTop: 6,
    fontSize: 12,
  },
  statusArea: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  bookStatus: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 12,
  },
  interestText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 12,
  },
});
import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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

type Interesse = {
  id?: number;
  livroId?: number;
  livro?: {
    id?: number;
  };
};

export default function LivrosScreen() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [interessesIds, setInteressesIds] = useState<number[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const isAdmin = role === 'ADMIN';
  const isUsuario = role === 'USUARIO';

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');

      const roleSalva = await buscarRole();
      setRole(roleSalva);

      const livrosCarregados: Livro[] = await apiFetch('/livros');
      setLivros(livrosCarregados);

      if (roleSalva === 'USUARIO') {
        try {
          const interesses: Interesse[] = await apiFetch('/interesses/meus');

          const ids = interesses
            .map((interesse) => interesse.livroId || interesse.livro?.id)
            .filter((id): id is number => typeof id === 'number');

          setInteressesIds(ids);
        } catch {
          setInteressesIds([]);
        }
      } else {
        setInteressesIds([]);
      }
    } catch {
      setErro('Não foi possível carregar o acervo.');
    } finally {
      setCarregando(false);
    }
  }

  function livroEstaDisponivel(livro: Livro) {
    if (typeof livro.disponivel === 'boolean') {
      return livro.disponivel;
    }

    if (livro.status) {
      return livro.status.toUpperCase() === 'DISPONIVEL';
    }

    return true;
  }

  function livroEstaEmprestado(livro: Livro) {
    if (livro.status) {
      return livro.status.toUpperCase() === 'EMPRESTADO';
    }

    if (typeof livro.disponivel === 'boolean') {
      return !livro.disponivel;
    }

    return false;
  }

  function usuarioTemInteresse(livroId: number) {
    return interessesIds.includes(livroId);
  }

  const livrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return livros;

    return livros.filter((livro) => {
      const titulo = (livro.titulo || livro.nome || '').toLowerCase();
      const autor = (livro.autor || '').toLowerCase();
      const categoria = (livro.categoria || '').toLowerCase();

      return (
        titulo.includes(termo) ||
        autor.includes(termo) ||
        categoria.includes(termo)
      );
    });
  }, [busca, livros]);

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/home' as any)}>
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Acervo</Text>
          <Text style={styles.headerSubtitle}>
            {isAdmin ? 'Administrador' : 'Usuário'}
          </Text>
        </View>

        <View style={styles.placeholderRight} />
      </View>

      {isAdmin && (
        <Pressable
          style={styles.createButton}
          onPress={() => router.push('/cadastrar-livro' as any)}
        >
          <Text style={styles.createButtonText}>Cadastrar novo livro</Text>
        </Pressable>
      )}

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

          <Pressable style={styles.retryButton} onPress={carregarDados}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}

      {!carregando && !erro && livrosFiltrados.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Nenhum livro encontrado</Text>
          <Text style={styles.emptyText}>
            Tente buscar por outro título, autor ou categoria.
          </Text>
        </View>
      )}

      {!carregando &&
        !erro &&
        livrosFiltrados.map((livro) => {
          const disponivel = livroEstaDisponivel(livro);
          const emprestado = livroEstaEmprestado(livro);
          const temInteresse = usuarioTemInteresse(livro.id);

          return (
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
                <Text
                  style={[
                    styles.bookStatus,
                    disponivel ? styles.availableStatus : styles.borrowedStatus,
                  ]}
                >
                  {disponivel ? 'DISPONÍVEL' : 'EMPRESTADO'}
                </Text>

                {isUsuario && emprestado && temInteresse && (
                  <Text style={styles.interestText}>Interesse registrado</Text>
                )}
              </View>
            </Pressable>
          );
        })}
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
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  placeholderRight: {
    width: 42,
  },
  createButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 15,
    marginBottom: 16,
  },
  feedbackBox: {
    alignItems: 'center',
    padding: 24,
  },
  feedbackText: {
    marginTop: 8,
    color: '#6b7280',
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
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTitle: {
    color: '#111827',
    fontWeight: 'bold',
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
    marginBottom: 4,
  },
  bookAuthor: {
    color: '#6b7280',
    marginBottom: 8,
  },
  bookCategory: {
    color: '#374151',
    fontSize: 12,
  },
  statusArea: {
    minWidth: 100,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bookStatus: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  availableStatus: {
    color: '#2563eb',
  },
  borrowedStatus: {
    color: '#dc2626',
  },
  interestText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'right',
  },
});
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  apiFetch,
  buscarRole,
  removerSessao,
} from '../services/api';

type Livro = {
  id: number;
  titulo?: string;
  nome?: string;
  autor?: string;
  categoria?: string;
  status?: string;

  quantidadeTotal?: number;
  quantidadeDisponivel?: number;

  valorEmprestimo?: number;
  valorMultaDiaria?: number;
};

type Interesse = {
  id?: number;
  livroId?: number;
  livro?: {
    id?: number;
  };
};

export default function HomeScreen() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [interessesIds, setInteressesIds] = useState<number[]>([]);
  const [role, setRole] = useState<string | null>(null);
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

      const data = await apiFetch('/livros');
      setLivros(data);

      if (roleSalva === 'USUARIO') {
        try {
          const interesses: Interesse[] =
            await apiFetch('/interesses/meus');

          const ids = interesses
            .map(
              (interesse) =>
                interesse.livroId ||
                interesse.livro?.id
            )
            .filter(
              (id): id is number =>
                typeof id === 'number'
            );

          setInteressesIds(ids);
        } catch {
          setInteressesIds([]);
        }
      } else {
        setInteressesIds([]);
      }
    } catch {
      setErro(
        'Não foi possível carregar os dados da Home.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleLogout() {
    await removerSessao();

    router.replace('/login' as any);
  }

  function livroEstaDisponivel(livro: Livro) {
    return (
      (livro.quantidadeDisponivel || 0) > 0
    );
  }

  function livroEstaEmprestado(livro: Livro) {
    return (
      (livro.quantidadeDisponivel || 0) <= 0
    );
  }

  function usuarioTemInteresse(livroId: number) {
    return interessesIds.includes(livroId);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const totalLivros = livros.reduce(
    (total, livro) =>
      total + (livro.quantidadeTotal || 0),
    0
  );

  const livrosDisponiveis = livros.reduce(
    (total, livro) =>
      total +
      (livro.quantidadeDisponivel || 0),
    0
  );

  const livrosEmprestados =
    totalLivros - livrosDisponiveis;

  const livrosRecentes = livros.slice(0, 4);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.headerTextArea}>
          <Text style={styles.title}>
            BookFlow
          </Text>

          <Text style={styles.subtitle}>
            {isAdmin
              ? 'Painel do administrador'
              : 'Acervo e empréstimos de livros'}
          </Text>

          {role && (
            <Text style={styles.roleBadge}>
              Perfil:{' '}
              {isAdmin
                ? 'Administrador'
                : 'Usuário'}
            </Text>
          )}
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Sair
          </Text>
        </Pressable>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {totalLivros}
          </Text>

          <Text style={styles.summaryLabel}>
            Livros no acervo
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {livrosDisponiveis}
          </Text>

          <Text style={styles.summaryLabel}>
            Disponíveis
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {livrosEmprestados}
          </Text>

          <Text style={styles.summaryLabel}>
            Emprestados
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push('/livros' as any)
          }
        >
          <Text style={styles.primaryButtonText}>
            Ver acervo
          </Text>
        </Pressable>

        {isAdmin && (
          <>
            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                router.push(
                  '/cadastrar-livro' as any
                )
              }
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Cadastrar livro
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                router.push(
                  '/emprestimos-acervo' as any
                )
              }
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Empréstimos do acervo
              </Text>
            </Pressable>
          </>
        )}

        {isUsuario && (
          <>
            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                router.push(
                  '/meus-emprestimos' as any
                )
              }
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Meus empréstimos
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                router.push(
                  '/notificacoes' as any
                )
              }
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Minhas notificações
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Livros recentes
          </Text>

          <Pressable onPress={carregarDados}>
            <Text style={styles.refreshText}>
              Atualizar
            </Text>
          </Pressable>
        </View>

        {carregando && (
          <View style={styles.feedbackBox}>
            <ActivityIndicator />

            <Text style={styles.feedbackText}>
              Carregando livros...
            </Text>
          </View>
        )}

        {!carregando && erro ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {erro}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={carregarDados}
            >
              <Text
                style={
                  styles.retryButtonText
                }
              >
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!carregando &&
          !erro &&
          livrosRecentes.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>
                Nenhum livro encontrado
              </Text>

              <Text style={styles.emptyText}>
                {isAdmin
                  ? 'Cadastre o primeiro livro para começar a organizar o acervo.'
                  : 'Ainda não há livros disponíveis no acervo.'}
              </Text>
            </View>
          )}

        {!carregando &&
          !erro &&
          livrosRecentes.map((livro) => {
            const disponivel =
              livroEstaDisponivel(livro);

            const emprestado =
              livroEstaEmprestado(livro);

            const temInteresse =
              usuarioTemInteresse(livro.id);

            return (
              <Pressable
                key={livro.id}
                style={styles.bookCard}
                onPress={() =>
                  router.push({
                    pathname:
                      '/detalhes-livro',
                    params: {
                      id: livro.id,
                    },
                  } as any)
                }
              >
                <View style={styles.bookInfo}>
                  <Text
                    style={styles.bookTitle}
                  >
                    {livro.titulo ||
                      livro.nome ||
                      'Livro sem título'}
                  </Text>

                  <Text
                    style={styles.bookAuthor}
                  >
                    {livro.autor ||
                      'Autor não informado'}
                  </Text>

                  {livro.categoria ? (
                    <Text
                      style={
                        styles.bookCategory
                      }
                    >
                      {livro.categoria}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.statusArea}>
                  <Text
                    style={[
                      styles.bookStatus,
                      disponivel
                        ? styles.availableStatus
                        : styles.borrowedStatus,
                    ]}
                  >
                    {disponivel
                      ? 'DISPONÍVEL'
                      : 'INDISPONÍVEL'}
                  </Text>

                  {isUsuario &&
                    emprestado &&
                    temInteresse && (
                      <Text
                        style={
                          styles.interestText
                        }
                      >
                        Interesse registrado
                      </Text>
                    )}
                </View>
              </Pressable>
            );
          })}
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
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  headerTextArea: {
    flex: 1,
  },

  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#d1d5db',
    marginTop: 4,
  },

  roleBadge: {
    marginTop: 10,
    color: '#93c5fd',
    fontWeight: '700',
  },

  logoutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },

  logoutText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  cardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },

  summaryNumber: {
    color: '#111827',
    fontSize: 24,
    fontWeight: 'bold',
  },

  summaryLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },

  actions: {
    marginBottom: 20,
  },

  primaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  secondaryButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },

  section: {
    marginTop: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
  },

  refreshText: {
    color: '#2563eb',
    fontWeight: '700',
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
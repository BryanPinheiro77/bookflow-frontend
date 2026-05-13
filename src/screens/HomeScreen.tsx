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
import { apiFetch, buscarRole, removerSessao } from '../services/api';

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
      setErro('Não foi possível carregar os dados da Home.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleLogout() {
    await removerSessao();
    router.replace('/login' as any);
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

  useEffect(() => {
    carregarDados();
  }, []);

  const totalLivros = livros.length;
  const livrosDisponiveis = livros.filter(livroEstaDisponivel).length;
  const livrosEmprestados = totalLivros - livrosDisponiveis;
  const livrosRecentes = livros.slice(0, 4);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTextArea}>
          <Text style={styles.title}>BookFlow</Text>

          <Text style={styles.subtitle}>
            {isAdmin ? 'Painel do administrador' : 'Acervo e empréstimos de livros'}
          </Text>

          {role && (
            <Text style={styles.roleBadge}>
              Perfil: {isAdmin ? 'Administrador' : 'Usuário'}
            </Text>
          )}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{totalLivros}</Text>
          <Text style={styles.summaryLabel}>Livros no acervo</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{livrosDisponiveis}</Text>
          <Text style={styles.summaryLabel}>Disponíveis</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{livrosEmprestados}</Text>
          <Text style={styles.summaryLabel}>Emprestados</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/livros' as any)}>
          <Text style={styles.primaryButtonText}>Ver acervo</Text>
        </Pressable>

        {isAdmin && (
          <>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/cadastrar-livro' as any)}
            >
              <Text style={styles.secondaryButtonText}>Cadastrar livro</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/emprestimos-acervo' as any)}
            >
              <Text style={styles.secondaryButtonText}>Empréstimos do acervo</Text>
            </Pressable>
          </>
        )}

        {isUsuario && (
          <>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/meus-emprestimos' as any)}
            >
              <Text style={styles.secondaryButtonText}>Meus empréstimos</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/notificacoes' as any)}
            >
              <Text style={styles.secondaryButtonText}>Minhas notificações</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Livros recentes</Text>

          <Pressable onPress={carregarDados}>
            <Text style={styles.refreshText}>Atualizar</Text>
          </Pressable>
        </View>

        {carregando && (
          <View style={styles.feedbackBox}>
            <ActivityIndicator />
            <Text style={styles.feedbackText}>Carregando livros...</Text>
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

        {!carregando && !erro && livrosRecentes.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Nenhum livro encontrado</Text>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 20, paddingBottom: 110 },
  header: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 18,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextArea: { flex: 1, paddingRight: 12 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { color: '#d1d5db', marginTop: 4 },
  roleBadge: { marginTop: 10, color: '#93c5fd', fontWeight: '700', fontSize: 12 },
  logoutButton: { backgroundColor: '#374151', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  logoutText: { color: '#ffffff', fontWeight: '600' },
  cardsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryNumber: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: '#6b7280' },
  actions: { gap: 10, marginBottom: 22 },
  primaryButton: {
    height: 48,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: {
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: '#1f2937', fontWeight: 'bold', fontSize: 16 },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  refreshText: { color: '#2563eb', fontWeight: '700' },
  feedbackBox: { alignItems: 'center', padding: 20 },
  feedbackText: { marginTop: 8, color: '#6b7280' },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 12, padding: 14 },
  errorText: { color: '#991b1b', marginBottom: 12 },
  retryButton: { backgroundColor: '#dc2626', borderRadius: 10, padding: 10, alignItems: 'center' },
  retryButtonText: { color: '#ffffff', fontWeight: 'bold' },
  emptyBox: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16 },
  emptyTitle: { fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  emptyText: { color: '#6b7280' },
  bookCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  bookAuthor: { color: '#6b7280', marginTop: 3 },
  bookCategory: { color: '#374151', marginTop: 6, fontSize: 12 },
  statusArea: { alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  bookStatus: { fontWeight: 'bold', fontSize: 12 },
  availableStatus: { color: '#2563eb' },
  borrowedStatus: { color: '#dc2626' },
  interestText: { color: '#16a34a', fontWeight: '700', fontSize: 12 },
});
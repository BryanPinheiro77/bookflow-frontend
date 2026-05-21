import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { apiFetch, buscarRole } from '../services/api';

type Emprestimo = {
  id: number;

  status?: string;

  dataEmprestimo?: string;

  dataPrevistaDevolucao?: string;

  dataDevolucao?: string;

  diasAtraso?: number;

  multaAtual?: number;

  valorEmprestimo?: number;

  livroTitulo?: string;
  tituloLivro?: string;

  usuarioNome?: string;
  nomeUsuario?: string;

  livro?: {
    titulo?: string;
    autor?: string;
  };

  usuario?: {
    nome?: string;
    email?: string;
  };
};

export default function EmprestimosScreen() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [role, setRole] = useState<string | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const isAdmin = role === 'ADMIN';

  async function carregarEmprestimos() {
    try {
      setCarregando(true);
      setErro('');

      const roleSalva = await buscarRole();
      setRole(roleSalva);

      const endpoint =
        roleSalva === 'ADMIN'
          ? '/emprestimos'
          : '/emprestimos/me';

      const response = await apiFetch(endpoint);

      setEmprestimos(response);
    } catch {
      setErro('Não foi possível carregar os empréstimos.');
    } finally {
      setCarregando(false);
    }
  }

  async function devolverLivro(id: number) {
    try {
      await apiFetch(`/emprestimos/${id}/devolver`, {
        method: 'PATCH',
      });

      carregarEmprestimos();
    } catch {
      setErro('Não foi possível devolver o livro.');
    }
  }

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/home' as any)}>
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Empréstimos
          </Text>

          <Text style={styles.headerSubtitle}>
            {isAdmin ? 'Administrador' : 'Usuário'}
          </Text>
        </View>

        <View style={styles.placeholderRight} />
      </View>

      {carregando && (
        <View style={styles.feedbackBox}>
          <ActivityIndicator />

          <Text style={styles.feedbackText}>
            Carregando empréstimos...
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
            onPress={carregarEmprestimos}
          >
            <Text style={styles.retryButtonText}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!carregando &&
        !erro &&
        emprestimos.map((emprestimo) => {
          const tituloLivro =
            emprestimo.tituloLivro ||
            emprestimo.livroTitulo ||
            emprestimo.livro?.titulo ||
            'Livro não informado';

          const usuarioNome =
            emprestimo.usuarioNome ||
            emprestimo.nomeUsuario ||
            emprestimo.usuario?.nome;

          const atrasado =
            typeof emprestimo.diasAtraso === 'number' &&
            emprestimo.diasAtraso > 0;

          return (
            <View
              key={emprestimo.id}
              style={styles.card}
            >
              <Text style={styles.bookTitle}>
                {tituloLivro}
              </Text>

              {isAdmin && usuarioNome ? (
                <Text style={styles.userText}>
                  Usuário: {usuarioNome}
                </Text>
              ) : null}

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Status
                </Text>

                <Text
                  style={[
                    styles.status,
                    emprestimo.status === 'ATIVO'
                      ? styles.activeStatus
                      : styles.finishedStatus,
                  ]}
                >
                  {emprestimo.status}
                </Text>
              </View>

              {emprestimo.dataEmprestimo ? (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    Empréstimo
                  </Text>

                  <Text style={styles.value}>
                    {emprestimo.dataEmprestimo}
                  </Text>
                </View>
              ) : null}

              {emprestimo.dataPrevistaDevolucao ? (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    Previsão devolução
                  </Text>

                  <Text style={styles.value}>
                    {emprestimo.dataPrevistaDevolucao}
                  </Text>
                </View>
              ) : null}

              {emprestimo.dataDevolucao ? (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    Devolvido em
                  </Text>

                  <Text style={styles.value}>
                    {emprestimo.dataDevolucao}
                  </Text>
                </View>
              ) : null}

              {typeof emprestimo.valorEmprestimo === 'number' && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    Valor empréstimo
                  </Text>

                  <Text style={styles.value}>
                    R$ {emprestimo.valorEmprestimo.toFixed(2)}
                  </Text>
                </View>
              )}

              {atrasado ? (
                <View style={styles.lateBox}>
                  <Text style={styles.lateTitle}>
                    EMPRÉSTIMO ATRASADO
                  </Text>

                  <Text style={styles.lateText}>
                    Dias atraso: {emprestimo.diasAtraso}
                  </Text>

                  <Text style={styles.lateText}>
                    Multa atual: R$ {emprestimo.multaAtual?.toFixed(2)}
                  </Text>
                </View>
              ) : null}

              {emprestimo.status === 'ATIVO' && (
                <Pressable
                  style={styles.returnButton}
                  onPress={() =>
                    devolverLivro(emprestimo.id)
                  }
                >
                  <Text style={styles.returnButtonText}>
                    Devolver livro
                  </Text>
                </Pressable>
              )}
            </View>
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

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  bookTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },

  userText: {
    color: '#374151',
    marginBottom: 10,
    fontWeight: '600',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    color: '#6b7280',
    fontWeight: '600',
  },

  value: {
    color: '#111827',
    fontWeight: '600',
  },

  status: {
    fontWeight: 'bold',
  },

  activeStatus: {
    color: '#2563eb',
  },

  finishedStatus: {
    color: '#16a34a',
  },

  lateBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },

  lateTitle: {
    color: '#991b1b',
    fontWeight: 'bold',
    marginBottom: 6,
  },

  lateText: {
    color: '#7f1d1d',
    fontWeight: '600',
    marginBottom: 2,
  },

  returnButton: {
    marginTop: 14,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  returnButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
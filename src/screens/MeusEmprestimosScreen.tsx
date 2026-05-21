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
import { apiFetch } from '../../src/services/api';

type Emprestimo = {
  id: number;

  livroTitulo?: string;
  tituloLivro?: string;

  livro?: {
    titulo?: string;
    autor?: string;
  };

  status?: string;

  dataEmprestimo?: string;

  dataPrevistaDevolucao?: string;

  dataDevolucao?: string;

  diasAtraso?: number;

  multaAtual?: number;

  valorEmprestimo?: number;
};

export default function MeusEmprestimosRoute() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState('');

  async function carregarEmprestimos() {
    try {
      setCarregando(true);
      setErro('');

      const data = await apiFetch('/emprestimos/me');

      setEmprestimos(data);
    } catch (error) {
      setErro(
        'Não foi possível carregar seus empréstimos.'
      );
    } finally {
      setCarregando(false);
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
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>
            Voltar
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Meus empréstimos
        </Text>

        <Pressable onPress={carregarEmprestimos}>
          <Text style={styles.refreshText}>
            Atualizar
          </Text>
        </Pressable>
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
        emprestimos.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              Nenhum empréstimo encontrado
            </Text>

            <Text style={styles.emptyText}>
              Quando você pegar um livro
              emprestado, ele aparecerá aqui.
            </Text>
          </View>
        )}

      {!carregando &&
        !erro &&
        emprestimos.map((emprestimo) => {
          const atrasado =
            typeof emprestimo.diasAtraso ===
              'number' &&
            emprestimo.diasAtraso > 0;

          return (
            <View
              key={emprestimo.id}
              style={styles.loanCard}
            >
              <Text style={styles.bookTitle}>
                {emprestimo.livroTitulo ||
                  emprestimo.tituloLivro ||
                  emprestimo.livro?.titulo ||
                  'Livro não informado'}
              </Text>

              {emprestimo.livro?.autor ? (
                <Text style={styles.bookAuthor}>
                  {emprestimo.livro.autor}
                </Text>
              ) : null}

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  Status
                </Text>

                <Text style={styles.value}>
                  {emprestimo.status ||
                    'Não informado'}
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
                    {
                      emprestimo.dataPrevistaDevolucao
                    }
                  </Text>
                </View>
              ) : null}

              {typeof emprestimo.valorEmprestimo ===
                'number' && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    Valor empréstimo
                  </Text>

                  <Text style={styles.value}>
                    R${' '}
                    {emprestimo.valorEmprestimo.toFixed(
                      2
                    )}
                  </Text>
                </View>
              )}

              {emprestimo.dataDevolucao ? (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    Devolução
                  </Text>

                  <Text style={styles.value}>
                    {emprestimo.dataDevolucao}
                  </Text>
                </View>
              ) : null}

              {atrasado && (
                <View style={styles.lateBox}>
                  <Text style={styles.lateTitle}>
                    EMPRÉSTIMO ATRASADO
                  </Text>

                  <Text style={styles.lateText}>
                    Dias atraso:{' '}
                    {emprestimo.diasAtraso}
                  </Text>

                  <Text style={styles.lateText}>
                    Multa atual: R${' '}
                    {emprestimo.multaAtual?.toFixed(
                      2
                    )}
                  </Text>
                </View>
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

  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  refreshText: {
    color: '#93c5fd',
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

  loanCard: {
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
    marginBottom: 4,
  },

  bookAuthor: {
    color: '#6b7280',
    marginBottom: 12,
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
});
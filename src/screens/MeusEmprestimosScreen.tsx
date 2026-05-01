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
  dataDevolucaoPrevista?: string;
  dataDevolucao?: string;
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
      setErro('Não foi possível carregar seus empréstimos.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEmprestimos();
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <Text style={styles.title}>Meus empréstimos</Text>

        <Pressable onPress={carregarEmprestimos}>
          <Text style={styles.refreshText}>Atualizar</Text>
        </Pressable>
      </View>

      {carregando && (
        <View style={styles.feedbackBox}>
          <ActivityIndicator />
          <Text style={styles.feedbackText}>Carregando empréstimos...</Text>
        </View>
      )}

      {!carregando && erro ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{erro}</Text>

          <Pressable style={styles.retryButton} onPress={carregarEmprestimos}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}

      {!carregando && !erro && emprestimos.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Nenhum empréstimo encontrado</Text>
          <Text style={styles.emptyText}>
            Quando você pegar um livro emprestado, ele aparecerá aqui.
          </Text>
        </View>
      )}

      {!carregando &&
        !erro &&
        emprestimos.map((emprestimo) => (
          <View key={emprestimo.id} style={styles.loanCard}>
            <Text style={styles.bookTitle}>
              {emprestimo.livroTitulo ||
                emprestimo.tituloLivro ||
                emprestimo.livro?.titulo ||
                'Livro não informado'}
            </Text>

            {emprestimo.livro?.autor ? (
              <Text style={styles.bookAuthor}>{emprestimo.livro.autor}</Text>
            ) : null}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{emprestimo.status || 'Não informado'}</Text>
            </View>

            {emprestimo.dataEmprestimo ? (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Empréstimo</Text>
                <Text style={styles.value}>{emprestimo.dataEmprestimo}</Text>
              </View>
            ) : null}

            {emprestimo.dataDevolucaoPrevista ? (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Previsão</Text>
                <Text style={styles.value}>{emprestimo.dataDevolucaoPrevista}</Text>
              </View>
            ) : null}

            {emprestimo.dataDevolucao ? (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Devolução</Text>
                <Text style={styles.value}>{emprestimo.dataDevolucao}</Text>
              </View>
            ) : null}
          </View>
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
  backText: {
    color: '#d1d5db',
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#60a5fa',
    fontWeight: 'bold',
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
    fontSize: 16,
    marginBottom: 4,
  },
  bookAuthor: {
    color: '#6b7280',
    marginBottom: 12,
  },
  infoRow: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  value: {
    color: '#111827',
    fontWeight: '600',
    marginTop: 2,
  },
});
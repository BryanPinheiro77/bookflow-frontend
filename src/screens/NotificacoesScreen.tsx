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
import { apiFetch, buscarRole } from '../services/api';

type Notificacao = {
  id: number;
  titulo?: string;
  mensagem?: string;
  lida?: boolean;
  criadaEm?: string;
  dataCriacao?: string;
  tipo?: string;
};

type QuantidadeNaoLidasResponse = {
  quantidade?: number;
  total?: number;
};

export default function NotificacoesScreen() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [quantidadeNaoLidas, setQuantidadeNaoLidas] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const isAdmin = role === 'ADMIN';

  async function carregarNotificacoes() {
    try {
      setCarregando(true);
      setErro('');
      setMensagem('');

      const roleSalva = await buscarRole();
      setRole(roleSalva);

      const notificacoesData = await apiFetch('/notificacoes');
      setNotificacoes(notificacoesData);

      const quantidadeData: QuantidadeNaoLidasResponse = await apiFetch(
        '/notificacoes/nao-lidas/quantidade'
      );

      setQuantidadeNaoLidas(
        quantidadeData.quantidade ?? quantidadeData.total ?? 0
      );
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar suas notificações.';

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  async function marcarComoLida(id: number) {
    try {
      setMensagem('');

      await apiFetch(`/notificacoes/${id}/ler`, {
        method: 'PATCH',
      });

      setMensagem('Notificação marcada como lida.');
      carregarNotificacoes();
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível marcar a notificação como lida.';

      setMensagem(mensagemErro);
    }
  }

  async function marcarTodasComoLidas() {
    try {
      setMensagem('');

      await apiFetch('/notificacoes/ler-todas', {
        method: 'PATCH',
      });

      setMensagem('Todas as notificações foram marcadas como lidas.');
      carregarNotificacoes();
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível marcar todas como lidas.';

      setMensagem(mensagemErro);
    }
  }

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/home' as any)}>
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Notificações</Text>
          <Text style={styles.roleText}>
            {isAdmin ? 'Administrador' : 'Usuário'}
          </Text>
        </View>

        <Pressable onPress={carregarNotificacoes}>
          <Text style={styles.refreshText}>Atualizar</Text>
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryTitle}>Não lidas</Text>
          <Text style={styles.summarySubtitle}>
            {quantidadeNaoLidas === 1
              ? '1 notificação pendente'
              : `${quantidadeNaoLidas} notificações pendentes`}
          </Text>
        </View>

        {quantidadeNaoLidas > 0 && (
          <Pressable style={styles.markAllButton} onPress={marcarTodasComoLidas}>
            <Text style={styles.markAllText}>Ler todas</Text>
          </Pressable>
        )}
      </View>

      {mensagem ? (
        <Text
          style={[
            styles.inlineMessage,
            mensagem.toLowerCase().includes('não') ||
            mensagem.toLowerCase().includes('erro')
              ? styles.inlineError
              : styles.inlineSuccess,
          ]}
        >
          {mensagem}
        </Text>
      ) : null}

      {carregando && (
        <View style={styles.feedbackBox}>
          <ActivityIndicator />
          <Text style={styles.feedbackText}>Carregando notificações...</Text>
        </View>
      )}

      {!carregando && erro ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{erro}</Text>

          <Pressable style={styles.retryButton} onPress={carregarNotificacoes}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}

      {!carregando && !erro && notificacoes.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
          <Text style={styles.emptyText}>
            Quando houver novidades sobre livros, empréstimos ou interesses, elas aparecerão aqui.
          </Text>
        </View>
      )}

      {!carregando &&
        !erro &&
        notificacoes.map((notificacao) => {
          const lida = notificacao.lida === true;

          return (
            <View
              key={notificacao.id}
              style={[
                styles.notificationCard,
                !lida && styles.notificationUnread,
              ]}
            >
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>
                  {notificacao.titulo || notificacao.tipo || 'Notificação'}
                </Text>

                <Text style={[styles.badge, lida ? styles.readBadge : styles.unreadBadge]}>
                  {lida ? 'Lida' : 'Nova'}
                </Text>
              </View>

              <Text style={styles.notificationMessage}>
                {notificacao.mensagem || 'Sem mensagem informada.'}
              </Text>

              {(notificacao.criadaEm || notificacao.dataCriacao) && (
                <Text style={styles.notificationDate}>
                  {notificacao.criadaEm || notificacao.dataCriacao}
                </Text>
              )}

              {!lida && (
                <Pressable
                  style={styles.markButton}
                  onPress={() => marcarComoLida(notificacao.id)}
                >
                  <Text style={styles.markButtonText}>Marcar como lida</Text>
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
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleText: {
    color: '#93c5fd',
    fontSize: 12,
    marginTop: 2,
  },
  refreshText: {
    color: '#60a5fa',
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summarySubtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  markAllButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  markAllText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  inlineMessage: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 12,
  },
  inlineSuccess: {
    color: '#16a34a',
  },
  inlineError: {
    color: '#dc2626',
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
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  notificationUnread: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  notificationTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  notificationMessage: {
    color: '#374151',
    marginTop: 8,
    lineHeight: 20,
  },
  notificationDate: {
    color: '#6b7280',
    marginTop: 8,
    fontSize: 12,
  },
  badge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  unreadBadge: {
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
  },
  readBadge: {
    color: '#4b5563',
    backgroundColor: '#e5e7eb',
  },
  markButton: {
    marginTop: 14,
    height: 42,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
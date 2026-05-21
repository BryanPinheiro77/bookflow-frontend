import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch, API_BASE_URL, buscarRole } from '../services/api';

type Livro = {
  id: number;
  titulo?: string;
  nome?: string;
  autor?: string;
  categoria?: string;
  status?: string;
  capaUrl?: string;
  adminId?: number;

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

type Emprestimo = {
  id: number;
  usuarioId?: number;
  usuarioNome?: string;
  usuarioEmail?: string;

  livroId?: number;

  tituloLivro?: string;
  livroTitulo?: string;

  status?: string;

  dataEmprestimo?: string;
  dataDevolucao?: string;

  livro?: {
    id?: number;
    titulo?: string;
  };
};

function getImageUrl(capaUrl?: string | null) {
  if (!capaUrl) {
    return null;
  }

  if (
    capaUrl.startsWith('http://') ||
    capaUrl.startsWith('https://')
  ) {
    return capaUrl;
  }

  return `${API_BASE_URL}${capaUrl}`;
}

export default function DetalhesLivroScreen() {
  const { id } =
    useLocalSearchParams<{
      id?: string;
    }>();

  const [livro, setLivro] =
    useState<Livro | null>(null);

  const [role, setRole] =
    useState<string | null>(null);

  const [temInteresse, setTemInteresse] =
    useState(false);

  const [emprestadoPorMim, setEmprestadoPorMim] =
    useState(false);

  const [
    processandoInteresse,
    setProcessandoInteresse,
  ] = useState(false);

  const [
    processandoEmprestimo,
    setProcessandoEmprestimo,
  ] = useState(false);

  const [mensagem, setMensagem] =
    useState('');

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState('');

  const isAdmin = role === 'ADMIN';
  const isUsuario = role === 'USUARIO';

  function livroDisponivel() {
    return (
      (livro?.quantidadeDisponivel || 0) > 0
    );
  }

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

      setEmprestadoPorMim(false);

      const roleSalva =
        await buscarRole();

      setRole(roleSalva);

      const livroCarregado =
        await apiFetch(`/livros/${id}`);

      setLivro(livroCarregado);

      if (roleSalva === 'USUARIO') {
        const interesses =
          await apiFetch(
            '/interesses/meus'
          );

        const jaTemInteresse =
          interesses.some(
            (interesse: Interesse) => {
              const interesseLivroId =
                interesse.livroId ||
                interesse.livro?.id;

              return (
                String(
                  interesseLivroId
                ) === String(id)
              );
            }
          );

        setTemInteresse(jaTemInteresse);

        const meusEmprestimos: Emprestimo[] =
          await apiFetch(
            '/emprestimos/me'
          );

        const livroEstaComigo =
          meusEmprestimos.some(
            (emprestimo) => {
              const emprestimoLivroId =
                emprestimo.livroId ||
                emprestimo.livro?.id;

              const statusEmprestimo =
                emprestimo.status?.toUpperCase();

              return (
                String(
                  emprestimoLivroId
                ) === String(id) &&
                statusEmprestimo ===
                  'ATIVO'
              );
            }
          );

        setEmprestadoPorMim(
          livroEstaComigo
        );
      }
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os detalhes do livro.';

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  async function pegarEmprestado() {
    if (
      !livro?.id ||
      processandoEmprestimo
    )
      return;

    try {
      setProcessandoEmprestimo(
        true
      );

      setMensagem('');

      await apiFetch('/emprestimos', {
        method: 'POST',
        body: JSON.stringify({
          livroId: livro.id,
        }),
      });

      setMensagem(
        'Livro emprestado com sucesso.'
      );

      await carregarLivro();
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível pegar este livro emprestado.';

      setMensagem(mensagemErro);
    } finally {
      setProcessandoEmprestimo(
        false
      );
    }
  }

  async function alternarInteresse() {
    if (
      !livro?.id ||
      processandoInteresse
    )
      return;

    try {
      setProcessandoInteresse(
        true
      );

      setMensagem('');

      if (temInteresse) {
        await apiFetch(
          `/interesses/livros/${livro.id}`,
          {
            method: 'DELETE',
          }
        );

        setTemInteresse(false);

        setMensagem(
          'Interesse removido.'
        );
      } else {
        await apiFetch(
          `/interesses/livros/${livro.id}`,
          {
            method: 'POST',
          }
        );

        setTemInteresse(true);

        setMensagem(
          'Interesse registrado com sucesso.'
        );
      }
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar seu interesse.';

      setMensagem(mensagemErro);
    } finally {
      setProcessandoInteresse(
        false
      );
    }
  }

  function confirmarExclusao() {
    if (!livro?.id) return;

    if (Platform.OS === 'web') {
      const confirmou =
        window.confirm(
          'Tem certeza que deseja excluir este livro?'
        );

      if (confirmou) {
        excluirLivro();
      }

      return;
    }

    Alert.alert(
      'Excluir livro',
      'Tem certeza que deseja excluir este livro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: excluirLivro,
        },
      ]
    );
  }

  async function excluirLivro() {
    if (!livro?.id) return;

    try {
      setMensagem('');

      await apiFetch(
        `/livros/${livro.id}`,
        {
          method: 'DELETE',
        }
      );

      router.replace('/livros' as any);
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o livro.';

      setMensagem(mensagemErro);
    }
  }

  useEffect(() => {
    carregarLivro();
  }, [id]);

  const imageUrl = getImageUrl(
    livro?.capaUrl
  );

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={
        styles.content
      }
    >
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            router.replace(
              '/livros' as any
            )
          }
        >
          <Text style={styles.backText}>
            Voltar
          </Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Detalhes
        </Text>

        <View
          style={styles.placeholderRight}
        />
      </View>

      {carregando && (
        <View style={styles.feedbackBox}>
          <ActivityIndicator />

          <Text style={styles.feedbackText}>
            Carregando livro...
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
            onPress={carregarLivro}
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
        livro && (
          <>
            <View style={styles.coverArea}>
              {imageUrl ? (
                <Image
                  source={{
                    uri: imageUrl,
                  }}
                  style={
                    styles.coverImage
                  }
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.coverPlaceholder
                  }
                >
                  <Text
                    style={
                      styles.coverPlaceholderText
                    }
                  >
                    Sem capa
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>
                {livro.titulo ||
                  livro.nome ||
                  'Livro sem título'}
              </Text>

              <Text style={styles.author}>
                {livro.autor ||
                  'Autor não informado'}
              </Text>

              <View
                style={styles.infoBlock}
              >
                <Text style={styles.label}>
                  Categoria
                </Text>

                <Text style={styles.value}>
                  {livro.categoria ||
                    'Não informada'}
                </Text>
              </View>

              <View
                style={styles.infoBlock}
              >
                <Text style={styles.label}>
                  Status
                </Text>

                <Text style={styles.status}>
                  {livroDisponivel()
                    ? 'DISPONÍVEL'
                    : 'INDISPONÍVEL'}
                </Text>
              </View>

              <View
                style={styles.infoBlock}
              >
                <Text style={styles.label}>
                  Exemplares
                </Text>

                <Text style={styles.value}>
                  {
                    livro.quantidadeDisponivel
                  }
                  /
                  {livro.quantidadeTotal}{' '}
                  disponíveis
                </Text>
              </View>

              <View
                style={styles.infoBlock}
              >
                <Text style={styles.label}>
                  Valor empréstimo
                </Text>

                <Text style={styles.value}>
                  R${' '}
                  {livro.valorEmprestimo?.toFixed(
                    2
                  )}
                </Text>
              </View>

              <View
                style={styles.infoBlock}
              >
                <Text style={styles.label}>
                  Multa diária
                </Text>

                <Text style={styles.value}>
                  R${' '}
                  {livro.valorMultaDiaria?.toFixed(
                    2
                  )}
                </Text>
              </View>
            </View>

            {isUsuario && (
              <>
                {emprestadoPorMim && (
                  <View
                    style={
                      styles.borrowedByMeBox
                    }
                  >
                    <Text
                      style={
                        styles.borrowedByMeTitle
                      }
                    >
                      Você está com este
                      livro emprestado.
                    </Text>

                    <Text
                      style={
                        styles.borrowedByMeSubtitle
                      }
                    >
                      Acompanhe a
                      devolução na aba
                      Empréstimos.
                    </Text>
                  </View>
                )}

                {!emprestadoPorMim &&
                  livroDisponivel() && (
                    <Pressable
                      style={[
                        styles.primaryButton,
                        processandoEmprestimo &&
                          styles.disabledButton,
                      ]}
                      onPress={
                        pegarEmprestado
                      }
                      disabled={
                        processandoEmprestimo
                      }
                    >
                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        {processandoEmprestimo
                          ? 'Processando...'
                          : 'Solicitar empréstimo'}
                      </Text>
                    </Pressable>
                  )}

                {!emprestadoPorMim &&
                  !livroDisponivel() && (
                    <Pressable
                      style={[
                        styles.primaryButton,
                        temInteresse &&
                          styles.interestActiveButton,
                        processandoInteresse &&
                          styles.disabledButton,
                      ]}
                      onPress={
                        alternarInteresse
                      }
                      disabled={
                        processandoInteresse
                      }
                    >
                      <Text
                        style={[
                          styles.primaryButtonText,
                          temInteresse &&
                            styles.interestActiveText,
                        ]}
                      >
                        {processandoInteresse
                          ? 'Atualizando...'
                          : temInteresse
                          ? 'Interesse registrado'
                          : 'Tenho interesse'}
                      </Text>
                    </Pressable>
                  )}

                {mensagem ? (
                  <Text
                    style={[
                      styles.inlineMessage,
                      mensagem
                        .toLowerCase()
                        .includes('não') ||
                      mensagem
                        .toLowerCase()
                        .includes('erro')
                        ? styles.inlineError
                        : styles.inlineSuccess,
                    ]}
                  >
                    {mensagem}
                  </Text>
                ) : null}
              </>
            )}
          </>
        )}
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

  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  placeholderRight: {
    width: 42,
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

  coverArea: {
    alignItems: 'center',
    marginBottom: 16,
  },

  coverImage: {
    width: 160,
    height: 230,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
  },

  coverPlaceholder: {
    width: 160,
    height: 230,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coverPlaceholderText: {
    color: '#6b7280',
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },

  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  author: {
    color: '#6b7280',
    fontSize: 15,
    marginBottom: 16,
  },

  infoBlock: {
    marginTop: 12,
  },

  label: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },

  value: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },

  status: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: 'bold',
  },

  primaryButton: {
    height: 48,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  borrowedByMeBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  borrowedByMeTitle: {
    color: '#1d4ed8',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },

  borrowedByMeSubtitle: {
    color: '#475569',
    textAlign: 'center',
    fontSize: 13,
  },

  interestActiveButton: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#16a34a',
  },

  interestActiveText: {
    color: '#166534',
  },

  disabledButton: {
    opacity: 0.7,
  },

  inlineMessage: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 2,
  },

  inlineSuccess: {
    color: '#16a34a',
  },

  inlineError: {
    color: '#dc2626',
  },
});
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

function extrairMensagemErro(errorText: string, status: number) {
  if (!errorText) {
    return `Erro na requisição: ${status}`;
  }

  try {
    const errorJson = JSON.parse(errorText);

    return (
      errorJson.message ||
      errorJson.mensagem ||
      errorJson.error ||
      errorJson.detail ||
      errorText
    );
  } catch {
    return errorText;
  }
}

export async function apiFetch(path: string, options: RequestOptions = {}) {
  const token = await AsyncStorage.getItem('bookflow_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    const mensagem = extrairMensagemErro(errorText, response.status);

    throw new Error(mensagem);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

export async function salvarSessao(token: string, role: string) {
  await AsyncStorage.setItem('bookflow_token', token);
  await AsyncStorage.setItem('bookflow_role', role);
}

export async function buscarToken() {
  return AsyncStorage.getItem('bookflow_token');
}

export async function buscarRole() {
  return AsyncStorage.getItem('bookflow_role');
}

export async function removerSessao() {
  await AsyncStorage.removeItem('bookflow_token');
  await AsyncStorage.removeItem('bookflow_role');
}

export async function apiUpload(path: string, formData: FormData) {
  const token = await AsyncStorage.getItem('bookflow_token');

  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    try {
      const errorJson = JSON.parse(errorText);

      throw new Error(
        errorJson.message ||
          errorJson.mensagem ||
          errorJson.error ||
          errorJson.detail ||
          errorText
      );
    } catch {
      throw new Error(errorText || `Erro no upload: ${response.status}`);
    }
  }

  return response.json();
}
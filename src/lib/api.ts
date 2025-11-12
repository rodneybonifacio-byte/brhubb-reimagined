export const API_BASE_URL = "https://envios.brhubb.com.br/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CotacaoRequest {
  cepOrigem: string;
  cepDestino: string;
  embalagem: {
    altura: string;
    largura: string;
    comprimento: string;
    peso: string;
    diametro: string;
  };
  logisticaReversa: string;
  valorDeclarado: number;
  cpfCnpjLoja: string;
}

export interface CotacaoItem {
  idLote: string;
  codigoServico: string;
  nomeServico: string;
  preco: string;
  prazo: number;
  embalagem: {
    peso: number;
    comprimento: number;
    altura: number;
    largura: number;
    diametro: number;
  };
  imagem: string;
  transportadora: string;
  isNotaFiscal: boolean;
}

export interface CotacaoResponse {
  data: CotacaoItem[];
}

export const auth = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao fazer login" }));
      throw new Error(error.message || "Erro ao fazer login");
    }

    return response.json();
  },

  setToken: (token: string) => {
    localStorage.setItem("auth_token", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  removeToken: () => {
    localStorage.removeItem("auth_token");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },
};

export const frete = {
  cotacao: async (dados: CotacaoRequest): Promise<CotacaoResponse> => {
    const token = auth.getToken();
    
    const response = await fetch(`${API_BASE_URL}/frete/cotacao`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao calcular frete" }));
      throw new Error(error.message || "Erro ao calcular frete");
    }

    return response.json();
  },
};

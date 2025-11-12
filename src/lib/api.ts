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
    clienteId?: string;
    cpfCnpj?: string;
  };
}

export interface UserData {
  id: string;
  email: string;
  clienteId: string;
  name: string;
  cpfCnpj?: string;
}

// Função para decodificar JWT e extrair dados
const decodeJWT = (token: string): UserData | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

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
  precoOriginal?: string;
  desconto?: number;
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

    const data = await response.json();
    
    // Decodificar o token para extrair dados do usuário
    if (data.token) {
      const userData = decodeJWT(data.token);
      if (userData) {
        localStorage.setItem("user_data", JSON.stringify(userData));
      }
    }
    
    return data;
  },

  setToken: (token: string) => {
    localStorage.setItem("auth_token", token);
  },

  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  getUserData: (): UserData | null => {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  removeToken: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },
};

export interface EnderecoCliente {
  id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export interface RemetenteItem {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  criadoEm: string;
  endereco: EnderecoCliente;
  transportadoraConfiguracoes: any[];
}

export interface RemetentesResponse {
  data: RemetenteItem[];
  meta: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export interface ClienteResponse {
  data: {
    id: string;
    nome: string;
    cpfCnpj: string;
    telefone: string;
    email: string;
    criadoEm: string;
    endereco: EnderecoCliente;
    transportadoraConfiguracoes: any[];
  };
}

export const clientes = {
  getEnderecoPrincipal: async (): Promise<ClienteResponse> => {
    const token = auth.getToken();
    const userData = auth.getUserData();
    
    if (!userData?.clienteId) {
      throw new Error("Dados do usuário não encontrados. Faça login novamente.");
    }
    
    const response = await fetch(`${API_BASE_URL}/clientes/endereco/${userData.clienteId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar endereço" }));
      throw new Error(error.message || error.error || "Erro ao buscar endereço");
    }

    return response.json();
  },
};

export const remetentes = {
  listar: async (): Promise<RemetentesResponse> => {
    const token = auth.getToken();
    
    const response = await fetch(`${API_BASE_URL}/remetentes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar remetentes" }));
      throw new Error(error.message || error.error || "Erro ao buscar remetentes");
    }

    return response.json();
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
      throw new Error(error.message || error.error || "Erro ao calcular frete");
    }

    return response.json();
  },
};

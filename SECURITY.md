# Documentação de Segurança - Sistema BRHUB

## Controle de Acesso a Etiquetas

### Regra Principal
**Cada usuário só pode ver e gerenciar suas próprias etiquetas de envio.**

### Implementação

A segurança do sistema é garantida através de **múltiplas camadas**:

#### 1. Autenticação via Token JWT
- Todo acesso à API externa (BRHUB) requer token de autenticação válido
- O token identifica univocamente o usuário fazendo a requisição
- Token expira após 12 horas, forçando nova autenticação

#### 2. Filtro Automático pela API Externa
A API do BRHUB (`https://envios.brhubb.com.br/api`) implementa filtros server-side que:
- Identificam o usuário pelo token JWT no header `Authorization: Bearer <token>`
- Retornam APENAS as emissões criadas por aquele usuário
- Administradores têm visibilidade de todas as emissões através de seus tokens admin

**Endpoints Protegidos:**
- `GET /emissoes` - Lista apenas emissões do usuário autenticado
- `GET /emissoes/:id` - Acesso apenas se a emissão pertencer ao usuário
- `POST /emissoes` - Cria emissão vinculada ao usuário do token

#### 3. Validação no Frontend
```typescript
// Todas as requisições incluem o token de autenticação
const token = auth.getToken();
const response = await fetchWithAuth(`${API_BASE_URL}/emissoes`, {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

#### 4. Detecção de Token Expirado
- Interceptor automático detecta erros 401 (Unauthorized)
- Redireciona usuário para login quando token expira
- Previne acesso não autorizado a dados

### Permissões por Role

#### Cliente (role: "cliente")
✅ Pode ver apenas suas próprias etiquetas
✅ Pode criar novas etiquetas
✅ Pode visualizar PDFs de suas etiquetas
❌ Não pode ver etiquetas de outros clientes
❌ Não tem acesso ao painel administrativo

#### Administrador (role: "admin")
✅ Pode ver todas as etiquetas de todos os clientes
✅ Pode gerenciar créditos de clientes
✅ Pode configurar transportadoras por cliente
✅ Pode ajustar custos de etiquetas
✅ Acesso completo ao painel administrativo

### Funcionalidade de Impersonation (Desabilitada)

A funcionalidade "Logar como cliente" foi **desabilitada por segurança** porque:

❌ **Problema**: Impersonation mudaria apenas a interface, mas manteria o token do admin
- Admin continuaria vendo suas próprias etiquetas (ou todas as etiquetas de admin)
- Não seria possível ver exatamente o que o cliente específico vê
- Poderia criar confusão sobre quais dados estão sendo exibidos

✅ **Alternativa Segura**: Administradores já têm visibilidade de todas as etiquetas através de seus tokens admin. Para verificar um cliente específico, use os filtros e busca disponíveis.

### Monitoramento de Segurança

O sistema implementa:
- ✅ Validação de inputs com Zod em todos os formulários
- ✅ Detecção automática de sessão expirada
- ✅ Avisos preventivos 30 minutos antes da expiração do token
- ✅ Row Level Security (RLS) no Supabase para tabelas sensíveis
- ✅ Funções security definer para verificação de roles

### Logs e Auditoria

**Recomendações para implementação futura:**
1. Log de todas as visualizações de etiquetas
2. Registro de tentativas de acesso negado
3. Auditoria de alterações em etiquetas e créditos
4. Monitoramento de atividades suspeitas (múltiplos erros 401)

### Responsabilidades

| Camada | Responsável | Implementação |
|--------|-------------|---------------|
| Autenticação | API BRHUB | Token JWT com expiração |
| Filtro de dados | API BRHUB | Server-side por user_id |
| Validação client | Frontend | Interceptor de requests |
| Roles e permissões | Supabase | RLS + security definer functions |
| Detecção de expiração | Frontend | useTokenRefresh hook |

### Contato Segurança

Para reportar vulnerabilidades ou questões de segurança, entre em contato com a equipe de desenvolvimento.

**Última atualização**: 2025-11-13

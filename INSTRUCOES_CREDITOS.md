# Sistema de Créditos - BRHUB Envios

## 📋 Resumo do Sistema Implementado

### ✅ Funcionalidades Implementadas

1. **Sistema de Créditos por Cliente**
   - Cada cliente tem um saldo de créditos
   - Créditos são consumidos automaticamente ao criar etiquetas
   - Bloqueio de criação de etiquetas quando não há crédito suficiente
   - Indicador visual de saldo na página de criação

2. **Painel Administrativo de Créditos** (`/admin/creditos`)
   - Visualização de todos os clientes e seus saldos
   - Adicionar créditos manualmente
   - Remover créditos manualmente
   - Histórico completo de transações
   - Alertas visuais para saldos baixos

3. **Painel de Ajustes de Custos** (`/admin/ajustes-custo`)
   - Ajuste de valores de etiquetas individualmente
   - Visualização de custo original, custo ajustado e preço de venda
   - Cálculo automático de margem
   - Histórico de ajustes
   - Motivo do ajuste (campo de observação)

4. **Sistema de Roles (Admin vs Cliente)**
   - Menus administrativos visíveis apenas para admins
   - Proteção de rotas com verificação de role
   - Funções de segurança no banco de dados

### 🗄️ Estrutura do Banco de Dados

#### Tabelas Criadas:
- `user_roles` - Roles dos usuários (admin/cliente)
- `client_credits` - Saldo de créditos por cliente
- `credit_transactions` - Histórico de todas as transações
- `shipping_cost_adjustments` - Ajustes de custos das etiquetas

### 🔐 Como Criar um Usuário Admin

Para criar um usuário admin, você precisa:

1. **Acessar o Backend do Lovable Cloud**
2. **Executar o seguinte SQL** na aba de consultas:

```sql
-- Substituir 'USER_UUID_AQUI' pelo UUID do usuário que você quer tornar admin
-- Você pode obter o UUID na tabela auth.users
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_AQUI', 'admin')
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin';
```

3. **Para ver o UUID de um usuário**, execute:

```sql
SELECT id, email FROM auth.users;
```

### 💰 Adicionando Créditos Iniciais

Para adicionar créditos para um cliente específico:

```sql
-- Substituir 'CLIENT_ID_API' pelo ID do cliente da API externa
-- Substituir 'NOME_CLIENTE' pelo nome do cliente
-- Substituir 1000.00 pelo valor inicial de créditos
INSERT INTO public.client_credits (client_id, client_name, credits)
VALUES ('CLIENT_ID_API', 'NOME_CLIENTE', 1000.00)
ON CONFLICT (client_id) DO UPDATE
SET credits = 1000.00, client_name = 'NOME_CLIENTE';
```

### 🎯 Fluxo de Consumo de Créditos

1. Cliente acessa `/envios/nova` para criar etiqueta
2. Sistema verifica saldo de créditos disponível
3. Se saldo insuficiente, exibe erro e bloqueia criação
4. Se saldo OK, permite seleção de frete
5. Ao criar etiqueta com sucesso, consome automaticamente o valor do frete
6. Registra transação no histórico

### 📊 Recursos Administrativos

#### Gerenciar Créditos (`/admin/creditos`)
- **Aba Clientes**: Lista todos os clientes com seus saldos
- **Aba Histórico**: Mostra todas as transações (ADD, REMOVE, CONSUME, REFUND)
- **Adicionar Créditos**: Botão verde (+) em cada cliente
- **Remover Créditos**: Botão vermelho (-) em cada cliente

#### Ajustes de Custos (`/admin/ajustes-custo`)
- **Novo Ajuste**: Criar ajuste para uma etiqueta específica
- **Campos**:
  - Custo Original: Custo real da transportadora
  - Custo Ajustado: Custo após ajustes internos
  - Preço de Venda: Valor cobrado do cliente
- **Cálculo Automático**: Margem bruta e percentual
- **Editar**: Clicar no ícone de lápis para editar ajuste existente

### 🔒 Segurança

- Row Level Security (RLS) ativado em todas as tabelas
- Funções de segurança SECURITY DEFINER para verificação de roles
- Apenas admins podem:
  - Adicionar/remover créditos
  - Ver histórico de transações
  - Ajustar custos de etiquetas
  - Acessar menus administrativos

### 🚀 Próximos Passos

1. Acesse o backend e crie seu primeiro usuário admin
2. Adicione créditos iniciais para o cliente de teste
3. Teste o fluxo completo de criação de etiquetas
4. Monitore o consumo de créditos no painel administrativo

### 📞 Suporte

Em caso de dúvidas sobre o sistema de créditos, consulte a documentação ou entre em contato com o suporte técnico.

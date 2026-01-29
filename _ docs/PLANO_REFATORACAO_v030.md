# Plano de Refatoração: v0.3.0

## 🎯 Objetivos

1. Eliminar código duplicado
2. Separar responsabilidades (Single Responsibility Principle)
3. Melhorar tratamento de erro
4. Adicionar validações robustas
5. Documentar contratos (types e interfaces)
6. Simplificar lógica de fallback
7. Preparar para testes unitários

---

## 📐 Arquitetura Proposta

### Arquivos a Criar

```
src/
├── substack/
│   ├── SubstackService.ts      (classe principal - refatorada)
│   ├── SubstackClient.ts       (HTTP client wrapper)
│   ├── SubstackPayloadBuilder.ts (cria payloads)
│   ├── SubstackErrorHandler.ts (trata erros)
│   ├── SubstackIdStrategy.ts   (estratégias para obter ID)
│   └── types.ts                (interfaces TypeScript)
├── logger.ts
├── main.ts
└── ...outros arquivos
```

---

## 🔧 Detalhes da Refatoração

### 1. **SubstackClient.ts** - HTTP Wrapper
```typescript
// Responsabilidade ÚNICA: fazer requisições HTTP
class SubstackClient {
    private baseUrl: string;
    private cookie: string;

    async get(endpoint: string, options?: RequestOptions): Promise<Response>
    async post(endpoint: string, body: any, options?: RequestOptions): Promise<Response>

    // Nunca retorna response.json sem check
    // Sempre valida Content-Type, headers, etc.
}
```

**Benefício**: Centralizar toda lógica HTTP, remover duplicação.

---

### 2. **SubstackPayloadBuilder.ts** - Factory de Payloads
```typescript
class PayloadBuilder {
    // Cria payload de forma consistente

    buildDraftPayload(options: PublishOptions): DraftPayload
    buildPublishPayload(): PublishPayload

    // Validações
    validatePayload(payload: any): ValidationResult
}
```

**Benefício**: Uma única fonte da verdade para payloads.

---

### 3. **SubstackIdStrategy.ts** - Busca de IDs
```typescript
abstract class IdStrategy {
    abstract name: string;
    abstract async execute(): Promise<number | null>;
}

class EndpointPublicationStrategy extends IdStrategy { ... }
class ArchiveInfoStrategy extends IdStrategy { ... }
class HtmlParsingStrategy extends IdStrategy { ... }

class IdStrategyManager {
    async findPublicationId(strategies: IdStrategy[]): Promise<number | null>
}
```

**Benefício**: Separar cada estratégia de ID, fácil de testar e estender.

---

### 4. **SubstackErrorHandler.ts** - Tratamento de Erro
```typescript
class SubstackError extends Error {
    status: number;
    retryable: boolean;
    suggestion: string;
}

function handleError(response: Response, context: string): SubstackError {
    if (response.status === 400) return new SubstackError("...", 400, false, "Verifique payload")
    if (response.status === 403) return new SubstackError("...", 403, true, "Cookie expirado?")
    // ...
}
```

**Benefício**: Erros claros e acionáveis.

---

### 5. **SubstackService.ts** Refatorado
```typescript
class SubstackService {
    private client: SubstackClient;
    private payloadBuilder: PayloadBuilder;
    private idManager: IdStrategyManager;
    private errorHandler: ErrorHandler;

    async publishPost(options: PublishOptions): Promise<PublishResult> {
        try {
            // 1. Validar entrada
            if (!options.title) throw new Error("Título obrigatório");

            // 2. Obter ID da publicação
            const pubId = await this.idManager.find();
            if (!pubId) throw new Error("Publicação não encontrada");

            // 3. Construir payload
            const payload = this.payloadBuilder.buildDraftPayload(options);
            const validation = payload.validate();
            if (!validation.valid) throw new Error(validation.error);

            // 4. Tentar criar draft
            const response = await this.client.post(
                `/api/v1/drafts?publication_id=${pubId}`,
                payload
            );

            // 5. Processar resposta
            if (response.status === 201 || response.status === 200) {
                return {
                    success: true,
                    postId: response.json.id,
                    postUrl: this.buildPostUrl(response.json.id)
                };
            }

            // 6. Tratamento de erro
            throw this.errorHandler.handle(response, "draft creation");

        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
```

**Benefício**: Fluxo claro, responsabilidades separadas, fácil de testar.

---

## 🔑 Mudanças Críticas

### Cookie
- **ANTES**: Extrai `substack.sid`
- **DEPOIS**: Extrai `connect.sid` (o correto!)

### Headers
- **ANTES**: Pode faltar `Content-Type`
- **DEPOIS**: Sempre inclui `Content-Type: application/json`

### Endpoints
- **ANTES**: Duplicados (mesma URL 2x)
- **DEPOIS**: Um único endpoint bem documentado

### Payloads
- **ANTES**: Lógica duplicada em 2 lugares
- **DEPOIS**: Uma classe `PayloadBuilder` centralizada

### Erros
- **ANTES**: Retorna `success: true` com `error`
- **DEPOIS**: Retorna `success: false` com `error` claro

---

## 📋 Checklist de Implementação

- [ ] Criar `SubstackClient.ts` (HTTP wrapper)
- [ ] Criar `PayloadBuilder.ts` (factory de payloads)
- [ ] Criar `IdStrategyManager.ts` (busca de IDs)
- [ ] Criar `SubstackErrorHandler.ts` (erros)
- [ ] Refatorar `SubstackService.ts` (classe principal)
- [ ] Criar `types.ts` (interfaces TypeScript)
- [ ] Adicionar testes unitários
- [ ] Atualizar CHANGELOG
- [ ] Testar com arquivo de teste (13_The-Interviewer.md)
- [ ] Validar todos os erros anteriores estão resolvidos

---

## 🎯 Resultados Esperados

✅ Código 50% menos duplicado
✅ Headers SEMPRE corretos
✅ Payloads validados
✅ Endpoints não duplicados
✅ Erros claros e acionáveis
✅ Fácil de testar
✅ Fácil de estender

---

## ⏱️ Timeline

- **v0.3.0-alpha**: Refatoração básica
- **v0.3.0-beta**: Testes e validações
- **v0.3.0**: Release final

---

Você quer que eu comece a refatoração agora?

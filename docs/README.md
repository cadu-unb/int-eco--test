# Banco de Questões — Documentação

Projeto educacional para criar, manter e servir bancos de questões via GitHub Pages com suporte a múltiplos tipos de questão, filtros dinâmicos e favoritos persistentes.

## Estrutura do projeto

```
/
  index.html              # Tela inicial + app principal
  favoritos.html          # Página de favoritos
  app.js                  # Lógica principal
  css/
    base.css              # Variáveis CSS, reset, acessibilidade, modal, loader
    welcome.css           # Tela de boas-vindas
    config.css            # Tela de configuração (filtros, range)
    quiz.css              # Tela de quiz (alternativas, progresso)
    results.css           # Tela de resultados (cards, score ring)
    media.css             # Imagens, PDFs, tabelas markdown
    utils.css             # Scrollbar, tooltip, responsividade
  img/
    <codigo>/             # Imagens organizadas por código de matéria
      file.png            # PNG, JPEG, SVG aceitos como <img>
      file.pdf            # PDF renderizado como link
  docs/
    README.md             # Documentação geral
    ECO0019.md            # Documentação de matéria
    prompt/
      single_correct.md   # Template para questões de escolha única
      true_false.md       # Template para verdadeiro/falso
      multiple_correct.md # Template para múltiplas respostas
      single_incorrect.md # Template para escolher incorreta
  json/
    index.json            # Manifesto de arquivos
    ECO0019_P1.json       # Arquivo de questões
    ECO0019_P2.json       # Arquivo de questões
```

## Como funciona json/index.json

Manifesto que lista todos os arquivos de questões disponíveis.

```json
{
  "sets": [
    {
      "file": "ECO0019_P1.json",
      "code": "ECO0019",
      "title": "Introdução à Economia - Prova 1",
      "subject": "Economia",
      "group": "Prova 1"
    }
  ]
}
```

**Campos obrigatórios:**
- `file`: nome do arquivo JSON em `json/`
- `code`: código da matéria (ex: ECO0019, PPCA0021)
- `title`: título descritivo completo
- `subject`: nome da disciplina (aparece nos filtros)
- `group`: agrupamento (prova, semana, módulo — aparece nos filtros)

**Ao adicionar novo arquivo:**
1. Salve o JSON em `json/novoarquivo.json`
2. Adicione um objeto `set` em `json/index.json`
3. Redeploy no GitHub Pages (a página carrega o manifesto automaticamente)

## Estrutura de cada arquivo JSON

Cada arquivo representa um conjunto de questões sobre um tópico/prova.

```json
{
  "meta": {
    "code": "ECO0019",
    "title": "Introdução à Economia - Prova 1",
    "subject": "Economia",
    "group": "Prova 1",
    "description": "Questões de revisão para a primeira prova."
  },
  "sections": [
    {
      "id": "cap-01",
      "title": "Dez princípios de economia",
      "questions": [
        {
          "id": "q001",
          "type": "single_correct",
          "command": "A economia é melhor definida como...",
          "command_image": "img/ECO0019/fig1.png",
          "alternatives": [
            { "id": "a", "text": "Alternativa A" },
            { "id": "b", "text": "Alternativa B", "image": "img/ECO0019/alt_b.svg" }
          ],
          "answer": ["a"],
          "justification": "Explicação da resposta correta.",
          "justification_image": "img/ECO0019/fig2.pdf"
        }
      ]
    }
  ]
}
```

### meta

Metadados compartilhados por todas as questões do arquivo.

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `code` | string | Sim | Código único da matéria |
| `title` | string | Sim | Título do arquivo |
| `subject` | string | Sim | Disciplina (filtro) |
| `group` | string | Sim | Agrupamento (filtro) |
| `description` | string | Não | Descrição opcional |

### sections

Array de seções que organizam questões logicamente.

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | string | Sim | Identificador único dentro do arquivo |
| `title` | string | Sim | Nome da seção (ex: "Cap. 1", "Semana 2") |
| `questions` | array | Sim | Lista de questões |

### questions

Cada questão dentro de uma seção.

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | string | Sim | Único dentro da seção |
| `type` | string | Sim | `single_correct`, `true_false`, `multiple_correct`, `single_incorrect` |
| `command` | string | Sim | Enunciado da questão; suporta tabelas markdown |
| `command_image` | string | Não | Caminho `img/<codigo>/arquivo.ext` — exibido após o enunciado |
| `alternatives` | array | Sim | Lista de opções |
| `answer` | array | Sim | **Sempre array**, mesmo com 1 resposta |
| `justification` | string | Não | Explicação da resposta; suporta tabelas markdown |
| `justification_image` | string | Não | Caminho `img/<codigo>/arquivo.ext` — exibido após a justificativa |

### alternatives

Cada objeto no array `alternatives`.

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | string | Sim | Único dentro da questão (a, b, c, d…) |
| `text` | string | Sim | Texto da alternativa; suporta tabelas markdown |
| `image` | string | Não | Caminho `img/<codigo>/arquivo.ext` — exibido abaixo do texto |

## Imagens e PDFs

Arquivos de mídia ficam em `img/<codigo>/`. Extensões suportadas: `.png`, `.jpg`, `.jpeg`, `.svg`, `.pdf`.

| Extensão | Renderização |
|----------|--------------|
| `.png` `.jpg` `.jpeg` `.svg` | `<img>` responsivo, max-height 400px (200px dentro de alternativa) |
| `.pdf` | Link "📄 Ver PDF" abre em nova aba |

**Caminho válido:** `img/ECO0019/figura1.png` — deve começar com `img/` e usar apenas letras, números, hífens, underscores e pontos. Caminhos inválidos são ignorados silenciosamente (sem erro na tela).

## Tabelas Markdown

`command`, `justification` e `alternatives[].text` aceitam tabelas no formato markdown. Blocos separados por linha em branco dupla são tratados como parágrafos distintos.

```
| Produto | Preço |
| ------- | ----- |
| A       | R$10  |
| B       | R$20  |
```

Renderizado como `<table>` com scroll horizontal em telas pequenas. O bloco é identificado como tabela se: todas as linhas começam com `|` e há pelo menos uma linha separadora (`| --- |`).

## Tipos de questão

### 1. single_correct

Uma única resposta correta. Usuário seleciona 1 alternativa.

```json
{
  "type": "single_correct",
  "command": "Qual alternativa está correta?",
  "alternatives": [
    { "id": "a", "text": "Opção A" },
    { "id": "b", "text": "Opção B" },
    { "id": "c", "text": "Opção C" }
  ],
  "answer": ["b"]
}
```

**Comparação:** `userAnswer` deve ser exatamente `["b"]`.

### 2. true_false

Questão de verdadeiro ou falso. Usuário escolhe V ou F.

```json
{
  "type": "true_false",
  "command": "A inflação é sempre prejudicial.",
  "alternatives": [
    { "id": "true", "text": "Verdadeiro" },
    { "id": "false", "text": "Falso" }
  ],
  "answer": ["false"]
}
```

**Comparação:** `userAnswer` deve ser `["true"]` ou `["false"]`.

### 3. multiple_correct

Múltiplas respostas corretas. Usuário marca todas as opções certas.

```json
{
  "type": "multiple_correct",
  "command": "Assinale todas as alternativas corretas.",
  "alternatives": [
    { "id": "a", "text": "Opção A (correta)" },
    { "id": "b", "text": "Opção B (errada)" },
    { "id": "c", "text": "Opção C (correta)" },
    { "id": "d", "text": "Opção D (correta)" }
  ],
  "answer": ["a", "c", "d"]
}
```

**Comparação:** `userAnswer` deve conter exatamente os IDs em `answer` (ordem não importa).

### 4. single_incorrect

Usuário deve identificar a alternativa INCORRETA.

```json
{
  "type": "single_incorrect",
  "command": "Assinale a alternativa incorreta.",
  "alternatives": [
    { "id": "a", "text": "Correta" },
    { "id": "b", "text": "Correta" },
    { "id": "c", "text": "INCORRETA — esta é a resposta" },
    { "id": "d", "text": "Correta" }
  ],
  "answer": ["c"]
}
```

**Comparação:** Mesmo que `single_correct` — a resposta do usuário é o ID da alternativa incorreta.

## IDs globais

Cada questão recebe um ID global para evitar colisões entre arquivos:

```
{arquivo}::{sectionId}::{questionId}

Exemplo:
ECO0019_P1.json::cap-01::q001
PPCA0021_S1.json::mod-02::q015
```

Usado internamente para:
- Armazenar respostas do usuário
- Persistir favoritos
- Navegar entre questões

## Como comparações funcionam

Função `isAnswerCorrect(question, userAnswer)` compara respostas normalizando:

1. Converter tudo para **minúsculas** (ex: `["A"]` → `["a"]`)
2. **Ordenar** arrays (ex: `["c", "a"]` → `["a", "c"]`)
3. Comparar arrays **elemento a elemento**
4. Resposta vazia (`[]` ou `undefined`) é **sempre incorreta**

Exemplos:

```js
// single_correct
question.answer = ["b"]
userAnswer = ["B"]        // normaliza para ["b"] → CORRETO
userAnswer = ["a"]        // ["a"] ≠ ["b"] → ERRADO
userAnswer = []           // vazio → ERRADO

// multiple_correct
question.answer = ["a", "c", "d"]
userAnswer = ["d", "a", "c"]  // ordena para ["a", "c", "d"] → CORRETO
userAnswer = ["a", "c"]       // faltou "d" → ERRADO
userAnswer = ["a", "c", "d", "b"]  // excesso → ERRADO
```

## Favoritos e localStorage

Favoritos são armazenados em `localStorage` com chave `quiz_app_favorites_v2`.

```js
// Estrutura armazenada
["ECO0019_P1.json::cap-01::q001", "PPCA0021_S1.json::mod-02::q015"]
```

**Na página `favoritos.html`:**
- Carrega `json/index.json` (manifesto)
- Busca todos os arquivos do manifesto
- Normaliza questões com IDs globais
- Busca questões de favorito na lista
- Se favorito não existir mais, ignora silenciosamente

## Armazenamento de respostas

Durante quiz, respostas são guardadas em memória:

```js
State.answers = {
  "ECO0019_P1.json::cap-01::q001": ["a"],
  "ECO0019_P1.json::cap-01::q002": ["b", "c"],
  "PPCA0021_S1.json::mod-02::q001": ["false"]
}
```

**Modelo:** `{globalQuestionId: [array de IDs de alternativas]}`

Sempre **array**, mesmo com 1 alternativa.

## Como publicar no GitHub Pages

1. Certifique-se de que todos os arquivos estão em versão controlada
2. Na aba "Settings" do repositório
3. Vá para "Pages"
4. Selecione a branch e pasta (`/root` ou `/docs`)
5. Salve
6. A página será publicada em `https://seuusername.github.io/int-eco--test`

**Requisitos GitHub Pages:**
- Caminhos **relativos** (ex: `json/index.json`, não `/json/index.json`)
- Sem servidor necessário — tudo é estático
- CORS automático habilitado para fetch de JSON

## Validação de arquivos JSON

Antes de adicionar novo arquivo:

1. **Sintaxe JSON:** Usa um validador (jsonlint.com)
2. **Campos obrigatórios:** Confira campos em meta/sections/questions
3. **IDs únicos:** Dentro de cada seção, `id` deve ser único
4. **Alternativas:** Cada `id` em `alternatives` deve ser diferente
5. **Answer válido:** Cada ID em `answer` deve existir em `alternatives`
6. **Type válido:** Deve ser um dos 4 tipos
7. **Caminhos de imagem:** Devem começar com `img/` e ter extensão permitida
8. **Arquivo no manifesto:** Adicione à `json/index.json`

## Adicionando novas questões

1. Use o prompt apropriado em `docs/prompt/`
2. Gere questões no formato JSON correto
3. Adicione à seção apropriada do arquivo
4. Coloque imagens em `img/<codigo>/` se necessário
5. Valide JSON
6. Teste no navegador (local)
7. Commit + push

## Histórico de mudanças

**v3.0** (atual)
- Suporte a imagens (PNG, JPEG, SVG) e PDFs em command, justification e alternativas
- Suporte a tabelas markdown em command, justification e texto de alternativas
- CSS dividido em arquivos lógicos em `css/`

**v2.0**
- Suporte a múltiplos tipos de questão
- Filtros dinâmicos baseados em dados
- Carregamento via manifesto (index.json)
- Favoritos com IDs globais
- Tela genérica (reutilizável)
- Hospedagem em GitHub Pages

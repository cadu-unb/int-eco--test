# Prompt para reimplementar a aplicacao

## Objetivo

Reimplementar a aplicacao atual como um quiz estatico hospedavel no GitHub Pages, mantendo a ideia central de estudo por questoes, mas tornando o projeto reutilizavel para varias materias, assuntos e modelos de questao.

O resultado deve ser uma aplicacao web client-side, sem backend, feita com HTML, CSS e JavaScript puro ou com build estatico simples. Ela deve funcionar quando publicada no GitHub Pages, carregando os dados da pasta `json/`.

## Contexto da aplicacao atual

A aplicacao atual tem:

- Tela inicial com apresentacao do quiz.
- Tela de configuracao com filtros por prova/capitulo e quantidade de questoes.
- Tela de quiz com alternativas e navegacao entre questoes.
- Tela de resultados com percentual, acertos e correcao.
- Pagina de favoritos com busca, filtros e persistencia via `localStorage`.
- Dados carregados hoje de `json/questions.json`.
- Modelo atual de questao: multipla escolha com uma unica alternativa correta.

## Nova premissa de dados

Na pasta `json/` havera varios arquivos JSON. Cada arquivo representa um assunto, bloco, unidade, prova ou recorte de uma materia.

Exemplos:

- `PPCA0021_S1.json`
- `PPCA0021_S2.json`
- `ECO0019_P1.json`
- `ECO0019_P2.json`

A aplicacao deve descobrir ou receber uma lista desses arquivos, carregar todos os arquivos disponiveis e montar o banco de questoes dinamicamente.

Como GitHub Pages nao permite listar diretorios automaticamente pelo navegador, criar um arquivo manifesto:

```json
{
  "sets": [
    {
      "file": "PPCA0021_S1.json",
      "code": "PPCA0021",
      "title": "Politicas Publicas - Semana 1",
      "subject": "Politicas Publicas",
      "group": "Semana 1"
    },
    {
      "file": "ECO0019_P1.json",
      "code": "ECO0019",
      "title": "Introducao a Economia - Prova 1",
      "subject": "Economia",
      "group": "Prova 1"
    }
  ]
}
```

Salvar esse manifesto em:

```text
json/index.json
```

Fluxo de carregamento:

1. Carregar `json/index.json`.
2. Para cada item em `sets`, fazer `fetch("json/" + file)`.
3. Normalizar as questoes em uma lista unica.
4. Guardar metadados do arquivo original em cada questao: `sourceFile`, `code`, `subject`, `group`, `setTitle`.
5. Se algum arquivo falhar, mostrar aviso acessivel, mas continuar carregando os demais.

## Estrutura recomendada de cada arquivo JSON

Cada arquivo deve seguir um formato previsivel:

```json
{
  "meta": {
    "code": "ECO0019",
    "title": "Introducao a Economia - Prova 1",
    "subject": "Economia",
    "group": "Prova 1",
    "description": "Questoes de revisao para a primeira prova."
  },
  "sections": [
    {
      "id": "cap-01",
      "title": "Dez principios de economia",
      "questions": [
        {
          "id": "q001",
          "type": "single_correct",
          "command": "A economia e melhor definida como o estudo de:",
          "alternatives": [
            { "id": "a", "text": "como a sociedade administra recursos escassos." },
            { "id": "b", "text": "como administrar uma empresa lucrativa." },
            { "id": "c", "text": "como prever precos de acoes." },
            { "id": "d", "text": "como eliminar todos os custos." }
          ],
          "answer": ["a"],
          "justification": "Economia estuda escolhas diante da escassez."
        }
      ]
    }
  ]
}
```

Campos obrigatorios por questao:

- `id`: identificador unico dentro do arquivo.
- `type`: tipo da questao.
- `command`: enunciado.
- `alternatives`: lista de alternativas, quando aplicavel.
- `answer`: sempre array, mesmo quando houver uma unica resposta.
- `justification`: explicacao exibida no resultado.

Criar IDs globais no app no formato:

```text
{sourceFile}::{sectionId}::{questionId}
```

Isso evita conflito entre arquivos diferentes.

## Tipos de questao

Implementar suporte a quatro modelos.

### 1. Multipla escolha com uma opcao certa

Tipo:

```text
single_correct
```

Comportamento:

- Usuario escolhe uma alternativa.
- Questao correta quando a resposta escolhida for igual ao unico item em `answer`.
- UI deve usar radio buttons ou botoes com `role="radio"`.

Exemplo:

```json
{
  "type": "single_correct",
  "command": "Qual alternativa esta correta?",
  "alternatives": [
    { "id": "a", "text": "Alternativa A" },
    { "id": "b", "text": "Alternativa B" }
  ],
  "answer": ["b"]
}
```

### 2. Verdadeiro ou falso

Tipo:

```text
true_false
```

Comportamento:

- Pode ser uma afirmacao unica com resposta `true` ou `false`.
- Para manter padrao, representar resposta como array: `["true"]` ou `["false"]`.
- UI pode mostrar dois botoes: Verdadeiro e Falso.

Exemplo:

```json
{
  "type": "true_false",
  "command": "A inflacao persistente pode estar ligada ao crescimento excessivo da moeda.",
  "alternatives": [
    { "id": "true", "text": "Verdadeiro" },
    { "id": "false", "text": "Falso" }
  ],
  "answer": ["true"]
}
```

### 3. Multipla escolha com mais de uma opcao certa

Tipo:

```text
multiple_correct
```

Comportamento:

- Usuario pode marcar mais de uma alternativa.
- Questao correta somente quando o conjunto marcado for exatamente igual ao conjunto em `answer`.
- Ordem das respostas nao deve importar.
- UI deve usar checkboxes ou botoes com `aria-pressed`.

Exemplo:

```json
{
  "type": "multiple_correct",
  "command": "Quais alternativas descrevem falhas de mercado?",
  "alternatives": [
    { "id": "a", "text": "Externalidades" },
    { "id": "b", "text": "Poder de mercado" },
    { "id": "c", "text": "Escassez de preferencias" },
    { "id": "d", "text": "Bens publicos" }
  ],
  "answer": ["a", "b", "d"]
}
```

### 4. Multipla escolha com uma opcao errada

Tipo:

```text
single_incorrect
```

Comportamento:

- Usuario deve selecionar a alternativa incorreta.
- `answer` deve conter o ID da alternativa errada.
- Enunciado deve deixar claro: "Assinale a alternativa incorreta".
- Resultado deve mostrar que a resposta correta era a opcao incorreta.

Exemplo:

```json
{
  "type": "single_incorrect",
  "command": "Assinale a alternativa incorreta sobre custo de oportunidade.",
  "alternatives": [
    { "id": "a", "text": "Inclui aquilo de que se abre mao." },
    { "id": "b", "text": "Pode incluir tempo." },
    { "id": "c", "text": "E sempre igual a zero quando ha satisfacao." },
    { "id": "d", "text": "Ajuda a comparar escolhas." }
  ],
  "answer": ["c"]
}
```

## Tela inicial mais generica

Substituir a tela inicial especifica de uma materia por uma tela reutilizavel.

Ela deve mostrar:

- Nome geral da aplicacao, por exemplo: "Banco de Questoes".
- Texto curto: "Escolha uma materia, configure seu treino e acompanhe seus resultados."
- Botao principal: "Comecar".
- Link para favoritos ou banco de questoes.
- Pequeno bloco "Sobre" generico, sem depender de Economia, Mankiw ou UnB.

Evitar textos fixos de disciplina no HTML. Todo nome de materia deve vir dos metadados dos arquivos JSON.

## Tela de configuracao

Criar filtros dinamicos com base nos arquivos carregados:

- Materia ou codigo (`code`).
- Assunto/titulo (`title`).
- Grupo (`group`), como prova, semana ou modulo.
- Secao interna (`sections.title`).
- Tipo de questao (`type`).
- Quantidade de questoes.

Regras:

- Se nenhum filtro for escolhido, permitir usar todas as questoes carregadas.
- Mostrar contador de questoes disponiveis antes de iniciar.
- Limitar quantidade maxima ao total disponivel.
- Sortear questoes de modo equilibrado entre arquivos ou secoes quando houver mais de um conjunto selecionado.

## Tela de quiz

Requisitos:

- Mostrar origem da questao: materia, grupo e secao.
- Mostrar progresso: `3 / 20`.
- Renderizar componente adequado para cada `type`.
- Permitir voltar para questao anterior.
- Preservar respostas durante a sessao.
- Exigir resposta antes de avancar, exceto se houver botao "Pular".
- Em `multiple_correct`, permitir confirmar somente quando ao menos uma opcao estiver marcada.

Modelo interno de resposta do usuario:

```js
{
  [globalQuestionId]: ["a", "c"]
}
```

Mesmo para resposta unica, usar array:

```js
{
  [globalQuestionId]: ["b"]
}
```

## Correcao

Criar funcao unica:

```js
function isAnswerCorrect(question, userAnswer) {
  const expected = normalizeAnswer(question.answer);
  const received = normalizeAnswer(userAnswer);
  return arraysHaveSameItems(expected, received);
}
```

Regras:

- Normalizar tudo para lowercase.
- Ordenar arrays antes de comparar.
- Remover duplicatas.
- Considerar resposta vazia como incorreta.

## Tela de resultados

Mostrar:

- Total de acertos.
- Percentual.
- Mensagem curta por faixa de desempenho.
- Lista de questoes respondidas.
- Resposta do usuario.
- Resposta esperada.
- Justificativa.
- Origem da questao: arquivo, materia, grupo e secao.
- Botao "Refazer com mesmas questoes".
- Botao "Novo treino".

Para questoes `single_incorrect`, deixar claro que a alternativa exibida como correta e a alternativa que deveria ser marcada por ser incorreta.

## Favoritos

Manter favoritos em `localStorage`.

Usar chave com versao:

```text
quiz_app_favorites_v2
```

Salvar IDs globais:

```json
[
  "ECO0019_P1.json::cap-01::q001",
  "PPCA0021_S1.json::mod-02::q014"
]
```

Na tela de favoritos:

- Carregar todos os arquivos do manifesto.
- Mostrar favoritos encontrados.
- Se algum favorito nao existir mais, ignorar e opcionalmente limpar do storage.
- Permitir busca por enunciado, alternativa, materia, grupo e secao.
- Permitir filtro por tipo de questao.

## Acessibilidade

Adicionar elementos minimos:

- Usar `<main>`, `<header>`, `<section>` e `<nav>` quando fizer sentido.
- Ter link "Pular para conteudo".
- Todos os botoes com nome acessivel.
- Icones decorativos com `aria-hidden="true"`.
- Inputs com `<label>` associado.
- Grupos de alternativas com `fieldset` e `legend`, ou `role="radiogroup"` / `role="group"`.
- Alternativas selecionaveis por teclado.
- Foco visivel em todos os controles.
- Nao depender somente de cor para indicar certo/errado.
- Mensagens dinamicas em area `aria-live="polite"`.
- Loader com `role="status"`.
- Erros com `role="alert"`.
- Respeitar `prefers-reduced-motion`.
- Contraste minimo WCAG AA.
- HTML com `lang="pt-BR"`.
- Titulos em ordem logica (`h1`, `h2`, `h3`).
- Nao usar `alert()` e `confirm()` nativos; preferir modal acessivel ou mensagem na tela.

## GitHub Pages

Requisitos de hospedagem:

- Tudo deve funcionar em site estatico.
- Usar caminhos relativos, por exemplo `json/index.json`, `style.css`, `app.js`.
- Nao depender de Node, servidor, banco ou API externa em runtime.
- Nao usar import de arquivos locais que quebrem em Pages.
- Garantir que nomes de arquivos tenham letras, numeros, `_` e `-`, sem espacos.
- Publicar a partir da branch configurada no GitHub Pages.

Estrutura sugerida:

```text
/
  index.html
  favoritos.html
  style.css
  app.js
  README.md
  json/
    index.json
    ECO0019_P1.json
    ECO0019_P2.json
    PPCA0021_S1.json
    PPCA0021_S2.json
```

## Passos de implementacao

1. Criar `json/index.json` como manifesto dos arquivos de questoes.
2. Padronizar cada arquivo JSON com `meta`, `sections` e `questions`.
3. Criar funcao `loadManifest()` para carregar `json/index.json`.
4. Criar funcao `loadQuestionSets()` para carregar todos os arquivos listados.
5. Criar funcao `normalizeQuestionSet()` para transformar dados em lista unica de questoes.
6. Criar IDs globais para questoes.
7. Substituir filtros fixos de prova/capitulo por filtros dinamicos.
8. Criar renderizadores por tipo de questao:
   - `renderSingleCorrectQuestion`
   - `renderTrueFalseQuestion`
   - `renderMultipleCorrectQuestion`
   - `renderSingleIncorrectQuestion`
9. Trocar armazenamento de respostas para arrays.
10. Criar funcao unica de correcao baseada em comparacao de conjuntos.
11. Atualizar tela de resultados para exibir respostas simples e multiplas.
12. Atualizar favoritos para usar IDs globais e carregar todos os arquivos.
13. Remover textos fixos de uma materia especifica da tela inicial.
14. Adicionar melhorias de acessibilidade listadas acima.
15. Testar localmente abrindo com servidor estatico, nao por `file://`.
16. Publicar no GitHub Pages e validar carregamento dos JSON no navegador.

## Criterios de aceite

- Aplicacao carrega mais de um arquivo JSON da pasta `json/`.
- Usuario consegue filtrar por materia, grupo, secao e tipo.
- Quatro tipos de questao funcionam.
- Questoes com uma ou varias respostas sao corrigidas corretamente.
- Tela inicial serve para qualquer materia.
- Favoritos continuam funcionando com multiplos arquivos.
- Aplicacao funciona em GitHub Pages com caminhos relativos.
- Interface e navegavel por teclado.
- Leitor de tela recebe contexto suficiente de telas, botoes, erros, carregamento e resultados.
- Nenhum texto principal fica preso a uma disciplina especifica.

## Observacoes tecnicas

- Como GitHub Pages nao lista arquivos de diretorio, `json/index.json` e obrigatorio.
- Evitar `innerHTML` com conteudo vindo do JSON quando possivel. Preferir `textContent` para reduzir risco de HTML indesejado.
- Se precisar renderizar formulas, avaliar MathJax via CDN, mas manter fallback textual.
- Manter estado principal em um objeto unico, por exemplo `State`.
- Separar responsabilidades: carregamento, normalizacao, filtros, sorteio, renderizacao, correcao e persistencia.

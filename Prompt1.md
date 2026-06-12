# Prompt1 - Ajustes necessários

## 1. Sortear e embaralhar questões

Corrigir a aplicação para que as questões sejam sorteadas e embaralhadas antes do início de cada treino.

Requisitos:

- Aplicar filtros primeiro: matéria, assunto, grupo, seção, tipo/formato e quantidade.
- Sortear as questões a partir do conjunto filtrado.
- Embaralhar a ordem das questões sorteadas.
- Embaralhar também a ordem das alternativas de cada questão.
- Preservar os IDs das alternativas ao embaralhar, pois a correção depende de `answer`.
- Não alterar o JSON original nem o estado global de questões carregadas; criar cópias para o treino.
- Em questões `true_false`, manter a ordem fixa: `Verdadeiro` e `Falso`.
- Garantir que `single_correct`, `multiple_correct` e `single_incorrect` continuem sendo corrigidas corretamente após o embaralhamento.

Critério de aceite:

- A cada novo treino, a ordem das questões muda.
- A ordem das alternativas muda quando o tipo permitir.
- A resposta correta continua sendo reconhecida pelo ID da alternativa, não pela posição visual.

## 2. Exibir ID da seção após `alternatives-fieldset`

Logo após o bloco `alternatives-fieldset`, adicionar um texto discreto, fixado/alinhado à direita, mostrando o valor de `[sections][id]` da questão atual.

Esse valor deve vir de:

```js
question.sectionId
```

Exemplo de HTML:

```html
<fieldset class="alternatives-fieldset">
  <!-- alternativas -->
</fieldset>

<span class="question-section-id" aria-label="Seção da questão">
  Hair2018
</span>
```

CSS esperado:

```css
.question-section-id {
  display: block;
  text-align: right;
  font-size: 0.35em;
  color: var(--text-light);
}
```

Requisitos:

- O texto deve aparecer logo abaixo/depois das alternativas.
- O texto deve ficar à direita.
- O texto deve usar `font-size: 0.35em`.
- O texto deve usar `color: var(--text-light)`.
- O texto deve mostrar o ID real da seção da questão.
- O texto deve ser discreto e não competir visualmente com o enunciado.

Critério de aceite:

- Toda questão mostra seu `sectionId` após `alternatives-fieldset`.

## 3. Adicionar versão dark

Adicionar uma versão dark da aplicação.

Regra principal:

- O tema dark não deve afetar a tela inicial.
- O tema dark deve afetar somente as demais partes da aplicação: configuração, quiz, resultados e favoritos.

Requisitos:

- Implementar tema escuro com variáveis CSS.
- Criar um controle discreto para alternar tema nas telas internas.
- Persistir a preferência em `localStorage`, por exemplo `quiz_app_theme`.
- Usar `prefers-color-scheme` como valor inicial, se não houver preferência salva.
- Manter contraste adequado em modo claro e escuro.
- Manter foco visível nos dois temas.
- Garantir que a tela inicial continue com o visual original mesmo quando o usuário escolher tema dark.

Exemplo de base:

```css
:root {
  --bg: #ffffff;
  --surface: #f7f7f7;
  --text: #1f2933;
  --text-light: #6b7280;
}

body.theme-dark:not(.screen-welcome-active) {
  --bg: #111827;
  --surface: #1f2937;
  --text: #f9fafb;
  --text-light: #9ca3af;
}
```

Critério de aceite:

- Alternar para dark muda telas internas.
- Tela inicial permanece igual.
- Preferência persiste ao recarregar a página.

## 4. Repensar favoritos para a complexidade atual

Repensar a tela e a lógica de favoritos para suportar múltiplas matérias, múltiplos arquivos JSON, várias seções e diferentes formatos de questão.

Favoritos devem usar IDs globais:

```text
{sourceFile}::{sectionId}::{questionId}
```

Exemplo:

```json
[
  "PPCA0021_S2.json::Hair2018::q001",
  "ECO0019_P1.json::cap-01::q003"
]
```

Requisitos:

- Carregar `json/index.json`.
- Carregar todos os arquivos JSON listados.
- Resolver favoritos usando ID global.
- Ignorar favoritos que não existirem mais.
- Permitir limpar favoritos inválidos.
- Mostrar metadados da questão: matéria, código, grupo, seção, tipo/formato e arquivo de origem.
- Permitir busca por enunciado, alternativa, justificativa, matéria, grupo e seção.
- Filtrar por assunto/matéria (`subject`).
- Filtrar por código (`code`).
- Filtrar por grupo (`group`).
- Filtrar por seção (`sectionId` e `sectionTitle`).
- Filtrar por formato/tipo de questão (`type`).
- Filtrar por arquivo de origem (`sourceFile`).
- Ordenar por matéria, grupo, seção, tipo ou data de favorito.

Novo formato recomendado para `localStorage`:

```json
{
  "PPCA0021_S2.json::Hair2018::q001": {
    "createdAt": "2026-06-11T21:00:00.000Z"
  }
}
```

Migrar automaticamente favoritos antigos no formato de lista:

```json
[
  "PPCA0021_S2.json::Hair2018::q001"
]
```

para o novo formato de objeto.

Critério de aceite:

- Favoritos funcionam com múltiplos arquivos JSON.
- Favoritos filtram por assunto e formato de questão.
- Favoritos também filtram por código, grupo, seção e arquivo.
- Favoritos antigos são migrados sem perda.

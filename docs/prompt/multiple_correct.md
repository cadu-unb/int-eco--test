# Prompt para gerar questões: Múltiplas respostas corretas

## Documento-fonte

Nome do documento: `[PREENCHER_NOME_DO_DOCUMENTO]`
Trecho, capítulo ou intervalo usado: `[PREENCHER_RECORTE]`
Matéria/código: `[PREENCHER_MATERIA_OU_CODIGO]`

---

## Tarefa

Crie questões de **múltipla escolha com duas ou mais alternativas corretas**, nível médio a difícil, em tom formal e acadêmico.

Use **apenas** o conteúdo do documento-fonte. Não invente conceitos externos.

Cada questão deve ter:

1. **Enunciado claro:** "Assinale todas as alternativas corretas" ou equivalente
2. **Cinco alternativas:** Tamanho e estilo similares (mínimo 2 corretas)
3. **Distratores plausíveis:**
   - Relacionados ao tema
   - Tecnicamente verossímeis
   - Conceitos próximos mas incorretos
   - Baseados em erros conceituais comuns
4. **Respostas corretas:** Todas baseadas no documento
5. **Justificativa:** Explicação formal de qual conjunto está correto

**Distratores não devem ser:**
- Óbvios ou absurdos
- Completamente fora do tema
- Errados apenas por falha de português

**Bons distratores:**
- Convencer quem estudou pouco
- Ser conceitualmente próximos da verdade
- Refletir confusões reais de aprendizado

---

## Formato de saída

Retorne **somente** JSON válido (sem explicações ou markdown fora do JSON):

```json
[
  {
    "id": "q001",
    "type": "multiple_correct",
    "command": "Assinale todas as alternativas corretas.",
    "alternatives": [
      { "id": "a", "text": "Alternativa A" },
      { "id": "b", "text": "Alternativa B" },
      { "id": "c", "text": "Alternativa C" },
      { "id": "d", "text": "Alternativa D" },
      { "id": "e", "text": "Alternativa E" }
    ],
    "answer": ["a", "d"],
    "justification": "Justificativa formal explicando por que A e D estão corretas e por que B, C, E estão incorretas."
  },
  {
    "id": "q002",
    "type": "multiple_correct",
    "command": "Assinale todas as alternativas corretas.",
    "alternatives": [
      { "id": "a", "text": "Alternativa A" },
      { "id": "b", "text": "Alternativa B" },
      { "id": "c", "text": "Alternativa C" },
      { "id": "d", "text": "Alternativa D" },
      { "id": "e", "text": "Alternativa E" }
    ],
    "answer": ["b", "c", "e"],
    "justification": "Explicação."
  }
]
```

### Língua

Independete da fonte, utilize SOMENTE PT-BR.

---

## Exemplos bons

### Exemplo 1: Duas respostas corretas

```json
{
  "id": "q001",
  "type": "multiple_correct",
  "command": "Assinale todas as alternativas que descrevem consequências da escassez.",
  "alternatives": [
    { "id": "a", "text": "Necessidade de fazer escolhas entre alternativas." },
    { "id": "b", "text": "Eliminação completa de custos de produção." },
    { "id": "c", "text": "Existência de custo de oportunidade para qualquer decisão." },
    { "id": "d", "text": "Impossibilidade de ganhos com especialização." },
    { "id": "e", "text": "Alocação eficiente de recursos sem trade-offs." }
  ],
  "answer": ["a", "c"],
  "justification": "A e C estão corretas: escassez força escolhas (A) e gera custo de oportunidade em qualquer decisão (C). B é falsa (escassez não elimina custos); D é falsa (especialização gera ganhos mesmo com escassez); E é falsa (alocação sempre envolve trade-offs)."
}
```

### Exemplo 2: Três respostas corretas

```json
{
  "id": "q003",
  "type": "multiple_correct",
  "command": "Quais das seguintes afirmativas refletem princípios fundamentais da economia?",
  "alternatives": [
    { "id": "a", "text": "Pessoas respondem a incentivos." },
    { "id": "b", "text": "O custo econômico inclui apenas gastos em dinheiro." },
    { "id": "c", "text": "O comércio pode beneficiar ambas as partes envolvidas." },
    { "id": "d", "text": "Mercados sempre funcionam de forma perfeitamente eficiente." },
    { "id": "e", "text": "Pensar marginalmente é importante na análise econômica." }
  ],
  "answer": ["a", "c", "e"],
  "justification": "A, C e E estão corretas: incentivos afetam comportamento (A); comércio baseado em vantagem comparativa beneficia ambos (C); análise marginal é ferramenta econômica fundamental (E). B é falsa (custo econômico inclui custo de oportunidade, não apenas dinheiro); D é falsa (mercados podem falhar)."
}
```

### Exemplo 3: Quatro respostas corretas (caso raro)

```json
{
  "id": "q005",
  "type": "multiple_correct",
  "command": "Quais das seguintes características descrevem falhas de mercado?",
  "alternatives": [
    { "id": "a", "text": "Externalidades não contabilizadas nos preços." },
    { "id": "b", "text": "Presença de monopólios com poder de mercado." },
    { "id": "c", "text": "Informação perfeita disponível para todos os agentes." },
    { "id": "d", "text": "Existência de bens públicos não-excludentes." },
    { "id": "e", "text": "Assimetria de informação entre compradores e vendedores." }
  ],
  "answer": ["a", "b", "d", "e"],
  "justification": "A, B, D e E descrevem falhas de mercado: externalidades (A), poder de mercado (B), bens públicos (D) e assimetria de informação (E). C é falsa: informação perfeita é hipótese de mercados eficientes, não falha."
}
```

---

## Notas importantes

- **Enunciado explícito:** "Assinale TODAS as alternativas corretas" — deixe claro que pode haver múltiplas
- **Mínimo 2 respostas corretas:** Máximo 4 (para manter dificuldade)
- **Resposta é array de letras:** `["a", "c", "e"]` (sempre ordenado alfabeticamente)
- **Ordem dos IDs em answer não importa** — app normaliza
- **Cinco alternativas é padrão:** Mínimo 4, máximo 5 (manter legibilidade)
- **Justificativa menciona cada alternativa:** Por que está correta ou errada
- **JSON válido:** Sem vírgulas extras, aspas misturadas, ou typos
- **Distratores devem ser educacionais:** Refletir confusões reais, não ser absurdos

---

## Padrão de respostas

Bom número de respostas corretas por dificuldade:

- **Fácil (raro aqui):** 2-3 corretas
- **Médio:** 2-3 corretas
- **Difícil:** 3-4 corretas

Se muitas alternativas estão corretas (>4), a questão fica ambígua. Reconsidere.

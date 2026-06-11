# Prompt para gerar questões: Verdadeiro ou Falso

## Documento-fonte

Nome do documento: `[PREENCHER_NOME_DO_DOCUMENTO]`
Trecho, capítulo ou intervalo usado: `[PREENCHER_RECORTE]`
Matéria/código: `[PREENCHER_MATERIA_OU_CODIGO]`

---

## Tarefa

Crie questões de **verdadeiro ou falso**, nível médio a difícil, com afirmações formais e conceitualmente densas.

Use **apenas** o conteúdo do documento-fonte. Não invente ou traga conhecimento externo.

Cada questão deve ter:

1. **Afirmação clara:** Frase declarativa, não ambígua
2. **Duas alternativas:** "Verdadeiro" e "Falso"
3. **Afirmações falsas devem ser plausíveis:**
   - Erro conceitual sutil
   - Inversão causal
   - Generalizações indevidas
   - Negação de uma condição
   - Confusão de variáveis relacionadas
4. **Resposta correta:** Baseada estritamente no documento
5. **Justificativa:** Explicação formal indicando por que é verdadeiro ou falso

**Afirmações falsas não devem ser:**
- Óbviamente falsas
- Completamente desconectadas do tema
- Frases sem sentido gramatical

**Boas afirmações falsas:**
- Parecem corretas à primeira leitura
- Enganam quem estudou superficialmente
- Contêm erro sutil e conceptualmente relevante

---

## Formato de saída

Retorne **somente** JSON válido (sem explicações ou markdown fora do JSON):

```json
[
  {
    "id": "q001",
    "type": "true_false",
    "command": "Afirmação a ser julgada como verdadeira ou falsa.",
    "alternatives": [
      { "id": "true", "text": "Verdadeiro" },
      { "id": "false", "text": "Falso" }
    ],
    "answer": ["true"],
    "justification": "Justificativa formal indicando por que a afirmação é verdadeira ou falsa, referenciando o conteúdo do documento-fonte."
  },
  {
    "id": "q002",
    "type": "true_false",
    "command": "Próxima afirmação.",
    "alternatives": [
      { "id": "true", "text": "Verdadeiro" },
      { "id": "false", "text": "Falso" }
    ],
    "answer": ["false"],
    "justification": "Explicação."
  }
]
```

### Língua

Independete da fonte, utilize SOMENTE PT-BR.

---

## Exemplos bons

### Exemplo 1: Afirmação claramente verdadeira

```json
{
  "id": "q001",
  "type": "true_false",
  "command": "Escassez de recursos é a razão fundamental para o estudo da economia.",
  "alternatives": [
    { "id": "true", "text": "Verdadeiro" },
    { "id": "false", "text": "Falso" }
  ],
  "answer": ["true"],
  "justification": "Verdadeiro. A escassez — a limitação de recursos em relação aos desejos ilimitados — é o problema fundamental que define o domínio da economia."
}
```

### Exemplo 2: Afirmação sutilmente falsa (inversão causal)

```json
{
  "id": "q003",
  "type": "true_false",
  "command": "O custo de oportunidade de uma escolha diminui quando aumenta o número de alternativas disponíveis.",
  "alternatives": [
    { "id": "true", "text": "Verdadeiro" },
    { "id": "false", "text": "Falso" }
  ],
  "answer": ["false"],
  "justification": "Falso. Mais alternativas aumentam o custo de oportunidade (valor daquilo que se abre mão), não diminuem. A escolha torna-se mais custosa porque as alternativas rejeitadas podem ter maior valor."
}
```

### Exemplo 3: Afirmação falsa por omissão de condição

```json
{
  "id": "q005",
  "type": "true_false",
  "command": "Bens públicos podem ser oferecidos eficientemente pelo mercado.",
  "alternatives": [
    { "id": "true", "text": "Verdadeiro" },
    { "id": "false", "text": "Falso" }
  ],
  "answer": ["false"],
  "justification": "Falso. Bens públicos (não-excludentes e não-rivais) tendem a ser oferecidos ineficientemente pelo mercado porque indivíduos não pagam pelos benefícios que recebem. Isso justifica intervenção pública."
}
```

### Exemplo 4: Afirmação verdadeira com condição complexa

```json
{
  "id": "q007",
  "type": "true_false",
  "command": "Um economista que descreve como o mercado funciona está praticando economia positiva.",
  "alternatives": [
    { "id": "true", "text": "Verdadeiro" },
    { "id": "false", "text": "Falso" }
  ],
  "answer": ["true"],
  "justification": "Verdadeiro. Economia positiva descreve como as coisas são (fatos mensuráveis), em contraste com economia normativa que prescreve como deveriam ser (julgamentos de valor). Descrever funcionamento do mercado é economia positiva."
}
```

---

## Notas importantes

- **Afirmação, não pergunta:** Frases declarativas que podem ser julgadas V/F
- **Não use negação dupla:** Evitar frases como "Não é falso que..." — confuso
- **Alternativas sempre:** "Verdadeiro" e "Falso" (com `id: "true"` ou `"false"`)
- **Resposta é array com 1 elemento:** `["true"]` ou `["false"]`
- **Justificativa menciona qual é falsa/verdadeira:** Não deixe ambígua
- **JSON válido:** Sem vírgulas extras, aspas misturadas, ou typos
- **Nível de dificuldade:** Afirmações falsas devem ser pedagogicamente valiosas

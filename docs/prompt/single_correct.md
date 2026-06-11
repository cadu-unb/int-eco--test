# Prompt para gerar questões: Múltipla escolha com uma resposta correta

## Documento-fonte

Nome do documento: `[PREENCHER_NOME_DO_DOCUMENTO]`
Trecho, capítulo ou intervalo usado: `[PREENCHER_RECORTE]`
Matéria/código: `[PREENCHER_MATERIA_OU_CODIGO]`

---

## Tarefa

Crie questões de múltipla escolha com **uma única alternativa correta**, nível médio a difícil, com linguagem formal e acadêmica.

Use **apenas** o conteúdo do documento-fonte informado. Não invente conceitos externos ou não mencionados.

Cada questão deve ter:

1. **Enunciado claro:** Pergunta específica, sem ambiguidade
2. **Quatro alternativas:** Tamanho e estilo similares
3. **Distratores plausíveis:** Baseados em:
   - Interpretações incompletas do conteúdo
   - Confusões conceituais comuns
   - Generalizações indevidas
   - Conceitos relacionados mas incorretos neste contexto
4. **Resposta correta:** Única, baseada no texto
5. **Justificativa:** Explicação formal e acadêmica da resposta

**Distratores não devem ser:**
- Óbvios ou absurdos
- Completamente não relacionados
- Errados apenas por falha de português

**Distratores bons enganam quem:**
- Estudou superficialmente
- Confundiu conceitos
- Memorizou mal os detalhes

---

## Formato de saída

Retorne **somente** JSON válido (sem explicações, comentários ou markdown fora do JSON):

```json
[
  {
    "id": "q001",
    "type": "single_correct",
    "command": "Enunciado claro e formal da questão.",
    "alternatives": [
      { "id": "a", "text": "Alternativa A" },
      { "id": "b", "text": "Alternativa B" },
      { "id": "c", "text": "Alternativa C" },
      { "id": "d", "text": "Alternativa D" }
    ],
    "answer": ["a"],
    "justification": "Justificativa formal e concisa explicando por que A é correta e, quando útil, por que B, C, D estão erradas."
  },
  {
    "id": "q002",
    "type": "single_correct",
    "command": "Próxima questão.",
    "alternatives": [
      { "id": "a", "text": "Alternativa A" },
      { "id": "b", "text": "Alternativa B" },
      { "id": "c", "text": "Alternativa C" },
      { "id": "d", "text": "Alternativa D" }
    ],
    "answer": ["b"],
    "justification": "Explicação."
  }
]
```

### Língua

Independete da fonte, utilize SOMENTE PT-BR.

---

## Exemplos bons

### Exemplo 1: Bom enunciado + distratores plausíveis

```json
{
  "id": "q001",
  "type": "single_correct",
  "command": "Em economia, o conceito de custo de oportunidade refere-se a",
  "alternatives": [
    { "id": "a", "text": "o valor da melhor alternativa aberta mão quando se faz uma escolha." },
    { "id": "b", "text": "o preço total cobrado por um bem ou serviço no mercado." },
    { "id": "c", "text": "a economia de recursos conseguida através da especialização." },
    { "id": "d", "text": "o custo de produção de um bem multiplicado pelo número de unidades vendidas." }
  ],
  "answer": ["a"],
  "justification": "Custo de oportunidade é precisamente o valor da melhor alternativa aberta mão. B confunde com preço de mercado; C com ganhos de comércio; D com custo total de produção."
}
```

### Exemplo 2: Conceito mais avançado

```json
{
  "id": "q003",
  "type": "single_correct",
  "command": "Quando economistas afirmam que 'nada é de graça' está implícito que",
  "alternatives": [
    { "id": "a", "text": "sempre há algum custo de oportunidade associado a qualquer escolha." },
    { "id": "b", "text": "todos os bens têm preço positivo no mercado." },
    { "id": "c", "text": "é impossível para a sociedade alcançar abundância de recursos." },
    { "id": "d", "text": "não existem bens públicos ou serviços gratuitos de verdade." }
  ],
  "answer": ["a"],
  "justification": "O dito refere-se à realidade de custo de oportunidade — toda escolha implica renúncia. Não é sobre preços de mercado (B), impossibilidade absoluta (C) ou existência de bens públicos (D)."
}
```

---

## Notas importantes

- **Não copie frases inteiras do documento:** Parafraseie
- **Enunciado é pergunta, não afirmação:** Melhor: 'Qual é...'; 'Qual das...'. Evitar: 'O seguinte sobre...'
- **Alternativas começam com letra minúscula** (a menos que seja nome próprio)
- **Apenas UMA resposta correta:** O array `answer` tem apenas 1 elemento
- **Justificativa acadêmica:** Não infantilizada, mas acessível
- **JSON válido:** Sem vírgulas flutuantes, aspas misturadas, ou campos extra

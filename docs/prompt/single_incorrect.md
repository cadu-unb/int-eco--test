# Prompt para gerar questões: Assinale a alternativa incorreta

## Documento-fonte

Nome do documento: `[PREENCHER_NOME_DO_DOCUMENTO]`
Trecho, capítulo ou intervalo usado: `[PREENCHER_RECORTE]`
Matéria/código: `[PREENCHER_MATERIA_OU_CODIGO]`

---

## Tarefa

Crie questões de **múltipla escolha em que o usuário deve assinalar a ÚNICA alternativa incorreta**, nível médio a difícil, em tom formal e acadêmico.

Use **apenas** o conteúdo do documento-fonte. Não invente conhecimento externo.

Cada questão deve ter:

1. **Enunciado explícito:** "Assinale a alternativa incorreta" ou equivalente claro
2. **Quatro ou cinco alternativas:** Três ou quatro corretas, uma incorreta
3. **Alternativa incorreta plausível:**
   - Conceito relacionado mas errado
   - Interpretação incorreta do texto
   - Erro conceitual sutil
   - **Não** absurda ou óbvia
4. **Alternativas corretas:** Todas baseadas no documento
5. **Justificativa:** Explicação formal de por que exatamente uma está errada

**Alternativa incorreta não deve ser:**
- Óbvia ou absurda
- Completamente desconectada do tema
- Frase sem sentido

**Boa alternativa incorreta:**
- Parece correta à primeira leitura
- Engana quem estudou superficialmente
- Contém erro conceitual relevante e sutil

---

## Formato de saída

Retorne **somente** JSON válido (sem explicações ou markdown fora do JSON):

```json
[
  {
    "id": "q001",
    "type": "single_incorrect",
    "command": "Assinale a alternativa incorreta.",
    "alternatives": [
      { "id": "a", "text": "Alternativa correta sobre o tema." },
      { "id": "b", "text": "Alternativa correta sobre o tema." },
      { "id": "c", "text": "Alternativa incorreta — esta é a resposta." },
      { "id": "d", "text": "Alternativa correta sobre o tema." }
    ],
    "answer": ["c"],
    "justification": "Alternativa C é falsa porque [razão]. As demais (A, B, D) estão corretas conforme [referência ao documento]."
  },
  {
    "id": "q002",
    "type": "single_incorrect",
    "command": "Assinale a alternativa incorreta.",
    "alternatives": [
      { "id": "a", "text": "Alternativa correta." },
      { "id": "b", "text": "Alternativa correta." },
      { "id": "c", "text": "Alternativa correta." },
      { "id": "d", "text": "Alternativa falsa." }
    ],
    "answer": ["d"],
    "justification": "Explicação."
  }
]
```

### Língua

Independete da fonte, utilize SOMENTE PT-BR.

---

## Exemplos bons

### Exemplo 1: Erro conceitual sutil

```json
{
  "id": "q001",
  "type": "single_incorrect",
  "command": "Assinale a alternativa incorreta sobre custo de oportunidade.",
  "alternatives": [
    { "id": "a", "text": "Reflete a escassez de recursos disponíveis." },
    { "id": "b", "text": "Inclui o valor daquilo de que se abre mão em uma escolha." },
    { "id": "c", "text": "É sempre igual a zero quando o consumidor fica satisfeito." },
    { "id": "d", "text": "Ajuda na comparação racional entre alternativas." }
  ],
  "answer": ["c"],
  "justification": "Alternativa C é falsa. Custo de oportunidade nunca é zero — é sempre o valor da melhor alternativa rejeitada, independentemente da satisfação do consumidor. A, B e D estão corretas conforme a definição econômica de custo de oportunidade."
}
```

### Exemplo 2: Confusão entre conceitos relacionados

```json
{
  "id": "q003",
  "type": "single_incorrect",
  "command": "Assinale a alternativa incorreta sobre a especialização económica.",
  "alternatives": [
    { "id": "a", "text": "Aumenta a produtividade do trabalho." },
    { "id": "b", "text": "Permite ganhos através do comércio com vantagem comparativa." },
    { "id": "c", "text": "Requer que cada pessoa produza apenas um bem." },
    { "id": "d", "text": "Reduz custos de produção através da repetição." }
  ],
  "answer": ["c"],
  "justification": "Alternativa C é falsa. Especialização não requer produzir APENAS um bem — refere-se a concentrar recursos onde há vantagem comparativa, o que frequentemente envolve múltiplos bens. A, B e D refletem corretamente benefícios da especialização."
}
```

### Exemplo 3: Generalização indevida

```json
{
  "id": "q005",
  "type": "single_incorrect",
  "command": "Assinale a alternativa incorreta sobre mercados perfeitamente competitivos.",
  "alternatives": [
    { "id": "a", "text": "Existem muitos compradores e muitos vendedores." },
    { "id": "b", "text": "Os bens oferecidos são homogêneos." },
    { "id": "c", "text": "Não existem barreiras à entrada ou saída de empresas." },
    { "id": "d", "text": "As firmas sempre operam com lucros econômicos nulos no longo prazo." }
  ],
  "answer": ["d"],
  "justification": "Alternativa D é falsa ou imprecisa. No longo prazo, firmas em competição perfeita tendem a lucro econômico zero, mas isso não é garantido em todos os casos — depende de custos e demanda. A, B e C são características definidoras corretas de mercados perfeitamente competitivos."
}
```

### Exemplo 4: Inversão de relação causal

```json
{
  "id": "q007",
  "type": "single_incorrect",
  "command": "Assinale a alternativa incorreta sobre elasticidade-preço da demanda.",
  "alternatives": [
    { "id": "a", "text": "Bens necessários tendem a ter baixa elasticidade." },
    { "id": "b", "text": "Bens com muitos substitutos próximos têm alta elasticidade." },
    { "id": "c", "text": "Quanto mais tempo os consumidores têm para se adaptar, menor é a elasticidade." },
    { "id": "d", "text": "A elasticidade varia ao longo da curva de demanda." }
  ],
  "answer": ["c"],
  "justification": "Alternativa C está invertida. Na verdade, quanto mais tempo os consumidores têm para se adaptar a mudanças de preço, MAIOR tende a ser a elasticidade (demanda de longo prazo é mais elástica que de curto prazo). A, B e D estão corretas conforme teoria econômica."
}
```

---

## Notas importantes

- **Enunciado explícito:** "Assinale a alternativa INCORRETA" — deixe bem claro
- **Apenas UMA resposta incorreta:** `answer` tem 1 elemento
- **Alternativas corretas devem estar corretas:** Senão a questão fica ambígua
- **Alternativa incorreta deve ser plausível:** Enganar quem estudou pouco, não quem não estudou
- **Justificativa menciona por que é falsa:** Não deixe ambígua
- **JSON válido:** Sem vírgulas extras, aspas misturadas, ou typos
- **Pedagogicamente valiosa:** O erro deve ilustrar confusão real de aprendizado
- **Padrão: 4 alternativas** (3 corretas + 1 incorreta) — máximo 5

---

## Dicas para criar boas alternativas incorretas

1. **Conceitos relacionados:** Se falar de preço, mencione custo (conceitos próximos)
2. **Inversão sutil:** "Maior" vira "menor", "aumenta" vira "diminui"
3. **Generalização indevida:** Verdade parcial tornada universal
4. **Confusão de contexto:** Correta em outra situação, errada aqui
5. **Omissão de condição:** Verdade, mas falta de qualificação torna falso

**Evitar:**
- "Azul é um número" (óbvio demais)
- Completamente não relacionado
- Erro de português ou lógica impossível

# Retorno

5 Questões seguindo o padrão definido acima em formato `json` dentro de um bloco de código;
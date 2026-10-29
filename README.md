✅ Status: MVP V1 Publicado. (Limitações de créditos da plataforma exigiram o congelamento do escopo na V1)

> 🗓️ **Lançamento e versão final pública previstos para:** 28/10/2026.

# 🐾 Estrela Pet — Plataforma O2O de Hospedagem & Pet Sitter (Vibe Coding)

> **MVP de Autoatendimento para Cuidados Pet com Gestão Rígida de Sociabilidade e Precificação Dinâmica.**  
> **Acesse o aplicativo rodando ao vivo:** https://estrela-pet.lovable.app  

* **Projeto:** Estrela Pet (Vibe Coding & One Person Business)
* **Aluna / PO / QA:** Stella Mendes Batista
* **Bootcamp:** DIO / Santander - App com IA
* **Data:** Outubro de 2026

---

## 1. Contexto, Dor do Mercado e Tese do MVP

### A Dor do Cliente
Tutores de cães e gatos (especialmente profissionais corporativos 30+ que viajam a trabalho ou pessoas com emergências médicas/familiares) enfrentam alta fricção ao contratar serviços de cuidado pet. O processo tradicional exige entrevistas longas e repetitivas pelo WhatsApp a cada reserva, gera sentimento de culpa ao comparar com hotéis tradicionais com gaiolas e carece de transparência em relação à saúde e regras de convivência do animal.

### A Tese do MVP
Um aplicativo próprio de autoatendimento (*One Person Business* O2O) elimina o retrabalho administrativo, retém o cliente salvando o histórico de saúde do animal e garante segurança operacional através de uma **trava automática de sociabilidade** e **precificação por antecedência**, dispensando as taxas e intermediários de marketplaces como a DogHero.

### O que ficou manual de propósito (Lean Operation):
* Processamento e conferência manual dos comprovantes de Pix (sinal de 50%).
* A execução presencial dos cuidados, passeios e envio das mídias diárias.
* Encaminhamento presencial a clínicas 24h em casos de emergência.

---

## 2. Análise de Mercado e Business Model Canvas (BMC)

### Tamanho de Mercado (TAM / SAM / SOM)
* **TAM (Total Addressable Market):** ~48 milhões de residências com cães e gatos no Brasil (Fonte: IBGE/PNS e Radar Pet).
* **SAM (Serviceable Addressable Market):** Tutores urbanos em regiões metropolitanas que utilizam serviços terceirizados de hospedagem ou pet sitter.
* **SOM (Serviceable Obtainable Market):** Profissionais corporativos e tutores no Rio de Janeiro (RJ) que buscam atendimento domiciliar humanizado sem baias.

### Business Model Canvas (BMC)
1. **Segmentos de Clientes:** Executivos 30+ com viagens frequentes; tutores lidando com imprevistos de saúde/família.
2. **Proposta de Valor:** Cuidado 100% humanizado e sem gaiolas; agendamento expresso com histórico salvo e precificação transparente.
3. **Canais:** Aplicativo web próprio, Instagram orgânico (@stella.freelancer) e indicações (Product-Led Growth).
4. **Relacionamento:** Transparência através de mídias diárias (fotos/vídeos) e régua de comunicação automatizada (Checklist "Mochila do Pet").
5. **Fontes de Receita:** Diárias de Hospedagem (R$ 50 + R$ 15/pet extra), Pet Sitter (R$ 40/visita), serviços extras (regar plantas R$ 30) e taxa de urgência (5%).
6. **Recursos Principais:** Residência adaptada, infraestrutura em nuvem (Lovable/Supabase) e capital intelectual em QA e Gestão.
7. **Atividades Principais:** Prestação do serviço presencial de cuidados e gestão/homologação técnica da plataforma digital.
8. **Parceiros-Chave:** Gateway de pagamento, clínicas veterinárias 24h parceiras e plataformas de nuvem.
9. **Estrutura de Custos:** Mensalidades de nuvem/low-code, guia DAS-MEI e produtos sanitizantes/insumos para pets.

---

## 3. Prompts Consolidados e Regras de Negócio (PRD v5.0)

*(Consolidado dos 5 Prompts Estruturados aplicados no Lovable)*

* **Prompt 1 (Bootstrap & Design):** Configuração de React, TS, Tailwind CSS, rotas (`/`, `/pets`, `/checkout`, `/admin`), formulário de perfil com regex para nome, máscara de 11 dígitos para WhatsApp e palette minimalista com cores da marca (#8D5B4C Terracota, #F3C35B Amarelo, #FCFAF8 Fundo).
* **Prompt 2 (Database & RLS):** Tabelas Supabase (`profiles`, `pets`, `bookings`), políticas de segurança RLS garantindo privacidade e Seed para conta Admin.
* **Prompt 3 (Ficha do Pet & Trava de Sociabilidade):** Formulário de triagem completo (saúde, rotina, emergência e aceite LGPD). Lógica condicional: se o pet selecionado para Hospedagem marcar "Não" ou "Não sei" em sociabilidade, o sistema bloqueia a hospedagem e redireciona automaticamente para o serviço de Pet Sitter.

  Próximos Passos (Backlog da V2)
* **Prompt 4 (Precificação Dinâmica & Checkout):** Motor de cálculo que aplica 5% de desconto para reservas $\ge$ 30 dias, 3% para $\ge$ 15 dias e 5% de acréscimo de encaixe emergencial para agendamentos no mesmo dia/1 dia antes. Geração da cobrança de 50% de sinal.
* **Prompt 5 (Painel Admin Kanban & Relatórios):** Interface visual Kanban com status (*Pending*, *Approved/In Progress*, *Completed*), real-time e exportação de relatórios em CSV/XLSX.

---

## 4. Evidências da Interface

*(Insira aqui os links/imagens do seu repositório)*
- <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/679a2344-3ce3-4a96-835f-b9d975d2179f" />


- <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/44c48e73-d22b-4d20-8f46-19a9b4df806d" />

- <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/98a1fac8-556a-490c-87a2-62b2fa60a9c0" />


---

## 5. Reflexão sobre o Processo (Visão de PO & QA)

### O que funcionou bem?
A estruturação prévia do PRD dividida em 5 prompts modulares. A mentalidade de QA permitiu prever cenários de exceção — como a recusa de pets reativos na hospedagem física — e transformar uma limitação de espaço em uma regra de negócio automatizada que redireciona o cliente para o Pet Sitter sem perder a venda.

### O que não funcionou como esperado?
O limite de compilação diária do plano gratuito do Lovable exigiu disciplina extrema para não gastar créditos com refinamentos estéticos secundários, focando 100% da capacidade computacional na entrega da lógica do banco de dados e do motor de cálculo.

### Aprendizados em Vibe Coding
O *Vibe Coding* se mostra verdadeiramente eficiente quando encarado como engenharia de produto. A inteligência artificial executa com precisão quando fornecemos regras condicionais matemáticas (multiplicadores de dias e adicionais), regex de validação e restrições de arquitetura limpa.

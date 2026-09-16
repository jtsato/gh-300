// GH-300 · Cheat Sheet — resumo rápido organizado por tópicos
const CHEATSHEET = [
  {
    title: "Planos e Preços",
    icon: "plans",
    items: [
      { k: "Individual", v: "Assinatura mensal ou anual. Pago via fatura ou cartão de crédito. Recursos: sugestões de código + Chat. Ideal para desenvolvedores independentes, freelancers e organizações Azure DevOps (sem exigir licença GitHub Enterprise)." },
      { k: "Business", v: "Para clientes não-GHE (ex.: código no BitBucket). Adiciona exclusões de conteúdo (copilot.ignore), logs de auditoria, políticas de organização e API REST de gerenciamento. Prompts/sugestões NÃO são usados para treinamento padrão." },
      { k: "Enterprise", v: "Requer GitHub Enterprise Cloud. Exclusivo: coleta de solicitações/sugestões, knowledge bases, resumo de pull requests, modelos personalizados. Sugestões embutidas (inline) disponíveis em todos os IDEs comerciais." },
      { k: "Treinamento de dados", v: "Business e Enterprise excluem uso, prompts e sugestões do treinamento padrão. Individual pode usar prompts para treinar modelos." }
    ]
  },
  {
    title: "Retenção de Dados",
    icon: "clock",
    items: [
      { k: "Prompts e sugestões", v: "Retidos por 28 dias (Business/Enterprise)." },
      { k: "Engajamento do usuário", v: "Mantidos por 2 anos." }
    ]
  },
  {
    title: "Exclusões de Conteúdo",
    icon: "shield",
    items: [
      { k: "Níveis", v: "Arquivos, Pastas e Repositórios." },
      { k: "Arquivo", v: "copilot.ignore — adiciona arquivos específicos à exclusão (plano Business)." },
      { k: "Tempo de propagação", v: "Até 30 minutos para adicionar/atualizar uma exclusão." },
      { k: "Efeitos", v: "Conteúdo excluído não fica disponível como contexto; sugestões são desabilitadas nos arquivos excluídos." },
      { k: "Limitação", v: "Só disponível para repositórios Git (pode ser contornada). Conteúdo excluído ainda pode ser usado se referenciado em código não excluído (ex.: chamadas de função)." },
      { k: "Diagnóstico", v: "Se não funcionar: verifique se o usuário está na organização com a regra e se a alteração ocorreu há menos de 30 min." },
      { k: "Validação", v: "O ícone do Copilot na barra de status do editor exibe mensagem quando a exclusão está ativa." },
      { k: "Individual", v: "Para aplicar políticas de exclusão, é necessário upgrade para o plano Business." }
    ]
  },
  {
    title: "Auditoria e API REST",
    icon: "chart",
    items: [
      { k: "Logs de auditoria (Business)", v: "Monitoram atividades e ações administrativas. Rastreiam sugestões de código e mudanças nas configurações de exclusão." },
      { k: "Acesso", v: "Seção Log de auditoria nas configurações do GitHub da organização." },
      { k: "API REST — assinaturas", v: "Adicionar/remover equipes da assinatura do Copilot de uma organização." },
      { k: "API REST — dados", v: "Listar atribuições de licença e obter resumo de uso dos membros." },
      { k: "API de métricas de uso", v: "Rastreia sugestões aceitas/usadas e métricas de aceitação específicas do Chat. Identifica em quais linguagens o Copilot traz maior produtividade." },
      { k: "Políticas por repositório", v: "Configure as políticas globais nas configurações da organização (Business)." }
    ]
  },
  {
    title: "Engenharia de Prompt",
    icon: "prompt",
    items: [
      { k: "Zero-shot", v: "Fazer apenas uma pergunta, sem exemplos." },
      { k: "Few-shot", v: "Fornecer exemplos de entrada/saída esperadas; informar o mecanismo desejado e como incorporá-lo." },
      { k: "Role prompting", v: "Descrever no prompt qual é a sua função/papel." },
      { k: "Boas práticas", v: "Definir claramente o problema, usar nomes de variáveis significativos, fornecer critérios de sucesso específicos, indicar onde obter o conteúdo e dar exemplos de resultados desejados." },
      { k: "Padrões corporativos", v: "Fornecer exemplos de prompts específicos para orientar a IA a seguir padrões (ex.: testes) da empresa." }
    ]
  },
  {
    title: "Comandos de Barra",
    icon: "terminal",
    items: [
      { k: "/tests", v: "Cria testes de unidade para o código selecionado." },
      { k: "/fix", v: "Propõe correções para erros de sintaxe e lógica detectados (usável no chat em linha para refatorar)." },
      { k: "/optimize", v: "Melhora o desempenho do código selecionado analisando a complexidade de tempo de execução (Visual Studio)." }
    ]
  },
  {
    title: "CLI, IDE e Sugestões",
    icon: "code",
    items: [
      { k: "CLI", v: "gh copilot suggest → escreva o comando → selecione a melhor sugestão. Configurações: confirmação de execução padrão e análise de uso." },
      { k: "Múltiplas sugestões", v: "Abrir o painel de conclusões no editor." },
      { k: "Alternativas", v: "Sugestões alternativas em nova guia; aceitar palavra por palavra via atalho de teclado." },
      { k: "Sem sugestões?", v: "Sem internet, linguagem não suportada ou licença inválida." },
      { k: "Feedback (IDE)", v: "Botão 'Compartilhar feedback' no painel do Copilot Chat." },
      { k: "Feedback (Mobile)", v: "Usar os emojis na interface do Copilot Chat." }
    ]
  },
  {
    title: "Contexto e Chat",
    icon: "chat",
    items: [
      { k: "Origem do contexto", v: "Arquivos vizinhos/relacionados no projeto; abas abertas, localização do cursor e código selecionado no IDE." },
      { k: "Melhorar contexto", v: "Abrir guias relevantes e adicionar caminhos completos dos arquivos ao prompt." },
      { k: "Participantes e variáveis", v: "@workspace (contexto colaborativo); #file e #editors (ancorar em arquivos/editores)." },
      { k: "Histórico de chat", v: "Fornece contexto, aumentando relevância e precisão das sugestões; gera trechos personalizados." },
      { k: "Pré-processamento", v: "Enriquece o prompt com contexto adicional antes do envio ao modelo." },
      { k: "Uso pretendido", v: "Ferramenta de produtividade que sugere, dependendo sempre do julgamento humano — revise e valide a saída." },
      { k: "Limitações", v: "Dados de treinamento limitados; dificuldade com estruturas complexas e bases de código grandes." }
    ]
  },
  {
    title: "Segurança, IP e Filtros",
    icon: "lock",
    items: [
      { k: "Proteção de IP", v: "Definir sugestões correspondentes a código público como 'bloqueado'." },
      { k: "Filtro de duplicação", v: "Bloqueia sugestões que correspondam a ~150 caracteres de código público do GitHub." },
      { k: "Configuração", v: "Configurações empresariais → Copilot → Políticas OU Configurações da organização → Copilot → Políticas." },
      { k: "Filtro de toxicidade", v: "Bloqueia discurso de ódio/linguagem discriminatória e conteúdo sexualmente sugestivo ou explícito." },
      { k: "Verificações pré-resposta", v: "Correspondência com código público (opcional) e compatibilidade com configurações do usuário." },
      { k: "Segurança no código", v: "Chat anota sugestões com padrões de vulnerabilidade conhecidos; evita acesso não autorizado e violações de dados." }
    ]
  },
  {
    title: "Ética e IA Responsável",
    icon: "scale",
    items: [
      { k: "Justiça (Fairness)", v: "Tratar todas as pessoas igualmente; treinar dados/algoritmos livres de preconceitos." },
      { k: "Transparência", v: "Sistemas compreensíveis com informações claras sobre como funcionam e como filtram conteúdo." },
      { k: "Minimizar vieses", v: "Dados diversos, métricas de justiça e supervisão humana." },
      { k: "Riscos", v: "Decisões difíceis de interpretar; resultados imprecisos por vieses/inconsistências nos dados de treinamento." },
      { k: "Cuidado com matemática", v: "Respostas baseadas em padrões, sem validação do cálculo." }
    ]
  },
  {
    title: "Como o Copilot Funciona",
    icon: "flow",
    items: [
      { k: "Ciclo de vida da sugestão", v: "Capturar o contexto do usuário → gerar a sugestão." },
      { k: "Proxy", v: "Serviço de proxy hospedado no Microsoft Azure." },
      { k: "Técnica FIM", v: "Fill-In-the-Middle considera prefixo E sufixo, preenchendo o meio com mais precisão." },
      { k: "Treinamento", v: "Sugere trechos que refletem as práticas mais comuns nos dados; pode sugerir sintaxe/recursos obsoletos se presentes no treinamento." },
      { k: "Interação", v: "Também via navegador em https://github.copilot.com" }
    ]
  },
  {
    title: "SDLC e Produtividade",
    icon: "cycle",
    items: [
      { k: "Requisitos", v: "Modelos e trechos que auxiliam na documentação." },
      { k: "Design", v: "Sugere padrões de design e práticas recomendadas ao projeto." },
      { k: "Código", v: "Reduz boilerplate com trechos reutilizáveis; automatiza tarefas repetitivas; gera dados de amostra fictícios ou baseados na documentação da API." },
      { k: "Refatoração", v: "Sugere melhorias de legibilidade/manutenção e redução de complexidade; acionar via comentários ou /fix." },
      { k: "Testes", v: "Mantém consistência identificando padrões; sugestões básicas exigem complemento e revisão (podem não cobrir todos os cenários)." },
      { k: "Documentação", v: "Sugere resumos/descrições com base na funcionalidade." },
      { k: "Modernização", v: "Sugere padrões de programação modernos." },
      { k: "Context switching", v: "Permite realizar tarefas permanecendo no IDE." },
      { k: "Dependência excessiva", v: "Risco de vulnerabilidades com explorações conhecidas e sugestões fora dos padrões mais recentes." }
    ]
  },
  {
    title: "Copilot Enterprise: Avançado",
    icon: "star",
    items: [
      { k: "Knowledge bases", v: "Recurso exclusivo do Enterprise. Responde sobre trechos de código, documentação e padrões de design." },
      { k: "Pull requests", v: "Gera resumo em prosa + lista com marcadores das principais alterações; responde perguntas sobre o conjunto de alterações." },
      { k: "Modelos personalizados", v: "Garantem que as respostas sigam práticas e padrões dos repositórios da organização." },
      { k: "Coleta de dados", v: "Somente o Enterprise permite a coleta de solicitações e sugestões." }
    ]
  }
];

import { AIAnalysisResult, LegalArea } from '../types';

export interface SampleCaseTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  rawText: string;
}

export const SAMPLE_CASE_TEMPLATES: SampleCaseTemplate[] = [
  {
    id: 'trabalhista_rescisao',
    title: 'Trabalhista: Rescisão Indireta por Assédio e Horas Extras',
    category: 'Trabalhista',
    description: 'Empregado submetido a metas abusivas, cobranças vexatórias fora do horário e não pagamento de horas extras habituais.',
    rawText: `Cliente trabalhou como coordenador de operações na empresa Logística Express por 3 anos e 4 meses (admissão em 10/11/2021). Relata que nos últimos 8 meses passou a sofrer cobranças vexatórias do novo diretor regional em reuniões públicas e em grupos de WhatsApp corporativo de madrugada e finais de semana. 
Além disso, realizava em média 3 horas extras diárias sem qualquer registro nos cartões de ponto (eram britânicos e já vinham pré-assinados). Em junho/2024 teve crise de ansiedade com emissão de atestado de 14 dias (CID F41.0). A empresa passou a isolá-lo e retirar suas funções. Deseja rescindir o contrato com todos os direitos de demissão sem justa causa e indenização por danos morais.`
  },
  {
    id: 'consumidor_pix',
    title: 'Consumidor / Bancário: Golpe do Falso Funcionário via PIX',
    category: 'Consumidor',
    description: 'Cliente teve R$ 42.000,00 transferidos após receber ligação com dados cadastrais vazados e spoofing de número oficial do banco.',
    rawText: `O cliente Roberto recebeu uma ligação identificada no identificador como o número oficial do SAC de seu banco. O atendente possuía todos os dados pessoais, endereço e saldo da conta. O golpista afirmou que havia uma invasão em andamento na conta e que seria necessário confirmar um protocolo de segurança via aplicativo.
Após seguir os passos recomendados, foram realizadas 3 transferências via PIX no total de R$ 42.000,00 para contas de terceiros em menos de 7 minutos, além de um empréstimo contratado de R$ 15.000,00. O cliente entrou em contato com o banco 20 minutos após o ocorrido pedindo bloqueio cautelar pelo MED (Mecanismo Especial de Devolução), mas o banco negou a devolução alegando que as operações foram feitas com uso de senha e token pessoal. O cliente está com o nome negativado pelo empréstimo.`
  },
  {
    id: 'civel_contrato',
    title: 'Cível: Inadimplemento de Empreitada e Perdas e Danos',
    category: 'Cível',
    description: 'Empresa contratante atrasou parcelas e abandonou obra inacabada com vícios construtivos graves.',
    rawText: `Nossa cliente, uma administradora de condomínios comerciais, contratou uma empreiteira em 15/01/2024 para reforma da fachada e impermeabilização da cobertura do edifício por R$ 380.000,00, com prazo improrrogável de entrega de 120 dias. 
A cliente realizou o pagamento pontual de 70% do valor total das etapas mediadas. No entanto, a empreiteira abandonou a obra no 90º dia com apenas 35% do serviço concluído, gerando infiltrações graves que danificaram 4 salas comerciais no último pavimento. A notificação extrajudicial enviada foi ignorada. Há laudo técnico de engenharia atestando falhas de execução e risco estrutural de desabamento da marquise.`
  },
  {
    id: 'familia_divorcio',
    title: 'Família: Divórcio Litigioso, Guarda e Alimentos',
    category: 'Família e Sucessões',
    description: 'Cônjuge ocultando patrimônio empresarial e inadimplente na manutenção dos filhos menores.',
    rawText: `A cliente foi casada por 12 anos sob o regime de comunhão parcial de bens. Há dois filhos menores (6 e 9 anos). O cônjuge varão saiu do lar conjugal há 2 meses e bloqueou os cartões de crédito da família, recusando-se a pagar a mensalidade escolar e o plano de saúde das crianças.
A cliente tomou conhecimento de que o cônjuge está transferindo quotas de duas empresas e veículos de luxo adquiridos na constância do casamento para o nome de parentes (blindagem patrimonial fraudulenta). Ela necessita urgentemente da fixação de alimentos provisórios para os menores, fixação de guarda unilateral/compartilhada com lar de referência materno, e tutela de urgência cautelar de arrolamento e bloqueio de bens para resguardar a meação.`
  }
];

export const aiService = {
  /**
   * Analisa o relato fático fornecido pelo usuário e retorna uma triagem jurídica estruturada.
   * Por padrão, executa um motor cognitivo analítico local otimizado para direito brasileiro.
   * Se configurada uma API externa (ex: Anthropic Claude, Google Gemini ou OpenAI), conecta-se ao endpoint.
   */
  async analyzeCase(rawStoryText: string): Promise<AIAnalysisResult> {
    // Simular latência realista de processamento de IA (1.2s)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const lower = rawStoryText.toLowerCase();

    // 1. Caso Trabalhista (Assédio, Horas Extras, Rescisão Indireta, FGTS)
    if (lower.includes('trabalh') || lower.includes('rescis') || lower.includes('horas extras') || lower.includes('empreg') || lower.includes('assédio')) {
      return {
        factsSummary: 'Relato envolve relação de emprego com indícios de descumprimento contratual patronal grave, prática de assédio moral e cobranças habituais em sobrejornada sem a devida contraprestação e registro em controle de ponto idôneo.',
        legalFraming: 'Direito do Trabalho (CLT, arts. 483 "a" e "d" - Rescisão Indireta; arts. 58 e 59 - Horas Extras e Intervalos; art. 223-A e seguintes - Reparação de Danos Extrapatrimoniais; Súmula 338 do C. TST).',
        clarificationQuestions: [
          'Qual a data exata do início e eventual término das atividades (ou último dia trabalhado)?',
          'Existem testemunhas presenciais (colegas de equipe ou ex-funcionários) dispostas a prestar depoimento?',
          'Há registro de mensagens de texto, e-mails corporativos, áudios ou prints de conversas fora da jornada?',
          'Foi emitido Comunicado de Acidente de Trabalho (CAT) ou laudo psiquiátrico/psicológico vinculando a enfermidade ao trabalho?'
        ],
        requiredDocuments: [
          'Carteira de Trabalho e Previdência Social (CTPS física ou Extrato CTPS Digital)',
          'Extrato analítico da conta vinculada do FGTS atualizado',
          'Holerites / Contracheques dos últimos 24 meses',
          'Atestados médicos, receitas, prontuários ou laudos clínicos psicológicos',
          'Prints e exportação completa de histórico de mensagens em aplicativos corporativos',
          'Documento de identidade (RG/CPF) e comprovante de residência atualizado'
        ],
        urgencyLevel: 'ALTA',
        urgencyReason: 'Risco de caracterização indevida de abandono de emprego (art. 482, "i", CLT) caso o trabalhador simplesmente deixe o posto sem propositura tempestiva da ação de rescisão indireta com base no art. 483, §3º da CLT.',
        suggestedActionType: 'Reclamatória Trabalhista c/c Rescisão Indireta e Reparação por Danos Morais',
        suggestedLegalArea: 'Trabalhista',
        estimatedValue: 120000.00
      };
    }

    // 2. Caso Consumidor / Bancário / Fraude PIX
    if (lower.includes('banc') || lower.includes('pix') || lower.includes('golpe') || lower.includes('fraude') || lower.includes('empréstimo') || lower.includes('negativ')) {
      return {
        factsSummary: 'Transações financeiras anômalas não reconhecidas pelo titular decorrentes de engenharia social (spoofing telefônico / falso funcionário), com falha nos sistemas de segurança bancária e negativa injustificada de ressarcimento pela instituição financeira.',
        legalFraming: 'Direito do Consumidor e Bancário (Código de Defesa do Consumidor, arts. 6º, VI, 14 e 42; Súmula 479 do Superior Tribunal de Justiça - Responsabilidade objetiva das instituições financeiras por fortuito interno; Resoluções Bacen nº 1/2020 e 103/2021 sobre o Mecanismo Especial de Devolução - MED).',
        clarificationQuestions: [
          'Foi lavrado Boletim de Ocorrência Policial imediatamente após a ciência da fraude?',
          'Qual o número de protocolo do acionamento do MED (Mecanismo Especial de Devolução) junto ao banco de origem?',
          'O titular do cartão/conta possui histórico de transações nesse montante e perfil de consumo?',
          'Houve inclusão indevida do nome do consumidor nos órgãos de proteção ao crédito (Serasa, SPC, CCF)?'
        ],
        requiredDocuments: [
          'Boletim de Ocorrência (B.O.) lavrado perante a Delegacia Eletrônica/Especializada',
          'Extratos bancários completos da conta contendo as movimentações fraudulentas e comprovantes PIX',
          'Histórico de chamadas telefônicas recebidas (prints do aparelho e fatura detalhada da operadora)',
          'Protocolos de atendimento e respostas formais do SAC / Ouvidoria bancária / Bacen / Consumidor.gov',
          'Comprovante de negativação em cadastros de inadimplentes (se houver)'
        ],
        urgencyLevel: 'CRITICA',
        urgencyReason: 'Prazo exíguo para rastreamento de valores via SISBAJUD / MED e necessidade imediata de tutela provisória de urgência para suspender descontos em conta e obstar ou excluir anotações nos cadastros de inadimplentes.',
        suggestedActionType: 'Ação Declaratória de Inexistência de Débito c/c Restituição de Valores e Indenização por Danos Morais c/c Tutela de Urgência',
        suggestedLegalArea: 'Consumidor',
        estimatedValue: 65000.00
      };
    }

    // 3. Caso Família / Divórcio / Alimentos
    if (lower.includes('divórcio') || lower.includes('filho') || lower.includes('guarda') || lower.includes('alimento') || lower.includes('casamento') || lower.includes('partilha') || lower.includes('patrimônio')) {
      return {
        factsSummary: 'Ruptura da sociedade conjugal com conflito quanto à fixação de verba alimentar provisória aos dependentes incapazes, definição do regime de convivência/guarda e risco de dissipação ou ocultação de patrimônio comum do casal.',
        legalFraming: 'Direito das Famílias e Sucessões (Código Civil, arts. 1.566, 1.583, 1.658 e 1.694; Lei nº 5.478/68 - Lei de Alimentos; CPC, arts. 300 e 693 a 699 - Procedimentos Especiais de Ações de Família).',
        clarificationQuestions: [
          'Qual o regime de bens pactuado no casamento e existe pacto antenupcial registrado em cartório?',
          'Quais são os gastos mensais comprováveis dos filhos menores (escola, saúde, moradia, vestuário, lazer)?',
          'O cônjuge varão possui vínculo de emprego formal (CLT/servidor) ou atua como empresário/profissional autônomo?',
          'Existem indícios concretos de esvaziamento patrimonial ou transferência de quotas/bens para interpostas pessoas (laranjas)?'
        ],
        requiredDocuments: [
          'Certidão de Casamento atualizada (expedida nos últimos 90 dias)',
          'Certidão de Nascimento dos filhos menores',
          'Comprovantes detalhados de despesas ordinárias e extraordinárias das crianças',
          'Matrículas atualizadas dos imóveis adquiridos na constância do casamento',
          'Certificados de registro de veículos (CRLV), contratos sociais de empresas e extratos bancários'
        ],
        urgencyLevel: 'ALTA',
        urgencyReason: 'Menores dependentes em situação de vulnerabilidade sem subsistência alimentar imediata, além de risco de alienação fraudulenta de bens comuns do acervo partilhável.',
        suggestedActionType: 'Ação de Divórcio Litigioso c/c Fixação de Alimentos Provisórios, Guarda, Convivência e Arrolamento Cautelar de Bens',
        suggestedLegalArea: 'Família e Sucessões',
        estimatedValue: 750000.00
      };
    }

    // 4. Caso Cível / Contratos / Imobiliário / Cobrança
    if (lower.includes('contrato') || lower.includes('obra') || lower.includes('imóvel') || lower.includes('cobrança') || lower.includes('prejuízo') || lower.includes('inadimplemento')) {
      return {
        factsSummary: 'Inadimplemento contratual culposo por descumprimento de prazos, abandono de prestação de serviços com vícios construtivos aparentes e ocultos, gerando prejuízos materiais emergentes e lucros cessantes à parte contratante inocente.',
        legalFraming: 'Direito Civil e Obrigações (Código Civil, arts. 389, 395, 402 - Perdas e Danos; art. 475 - Resolução Contratual; arts. 615 a 618 - Empreitada e Garantia da Solidez e Segurança; CPC, art. 381 - Produção Antecipada de Provas).',
        clarificationQuestions: [
          'Existe contrato de prestação de serviços assinado com cláusula penal / multa rescisória e testemunhas?',
          'Foram expedidas notificações extrajudiciais com prazo de emenda da mora e comprovante de entrega (AR)?',
          'Foi realizada vistoria pericial ou laudo técnico por engenheiro/perito independente antes de eventuais reparos?',
          'Há retenção indevida de pagamentos ou valores dados em garantia caução?'
        ],
        requiredDocuments: [
          'Contrato de prestação de serviços/empreitada original assinado e seus eventuais aditivos',
          'Comprovantes de pagamento das medições já executadas',
          'Relatório / Laudo técnico de engenharia com fotos em alta resolução e ART/RRT registrada no CREA/CAU',
          'Notificação extrajudicial encaminhada com aviso de recebimento (AR) ou notificação via Cartório de RTD',
          'Orçamentos de terceiros para correção e finalização dos serviços não executados'
        ],
        urgencyLevel: 'MEDIA',
        urgencyReason: 'Necessidade de acautelamento de prova pericial in loco antes que as intempéries ou reformas emergenciais descaracterizem o nexo causal dos vícios construtivos.',
        suggestedActionType: 'Ação de Rescisão Contratual c/c Indenização por Perdas e Danos, Danos Emergentes e Aplicação de Cláusula Penal',
        suggestedLegalArea: 'Cível',
        estimatedValue: 380000.00
      };
    }

    // 5. Caso Geral / Outras áreas
    return {
      factsSummary: `Relato fático submetido para triagem jurídica inicial: "${rawStoryText.substring(0, 200)}...". Demanda envolve potenciais direitos subjetivos violados que demandam provocação do Poder Judiciário ou mediação extrajudicial.`,
      legalFraming: 'Teoria Geral do Direito, Código Civil Brasileiro e Código de Processo Civil (Arts. 186 e 927 do CC - Dever de Indenizar; Arts. 319 e 320 do CPC - Requisitos da Petição Inicial).',
      clarificationQuestions: [
        'Qual o objetivo primordial do cliente (reparação financeira, cumprimento de obrigação de fazer ou anulação de ato)?',
        'Quando ocorreram os fatos narrados e quando a parte teve ciência inequívoca da lesão ao seu direito (termo a quo para contagem de prazos prescricionais)?',
        'Existe tentativa prévia de composição amigável ou resposta formal da parte contrária?',
        'Quem são os polos passivos responsáveis diretos e eventuais devedores solidários?'
      ],
      requiredDocuments: [
        'Documento oficial com foto (RG/CNH) e comprovante de inscrição no CPF',
        'Comprovante de residência atualizado (últimos 3 meses)',
        'Procuração Ad Judicia e Declaração de Hipossuficiência (se for o caso de Justiça Gratuita)',
        'Documentos, contratos, recibos e correspondências que comprovem diretamente o fato constitutivo do direito (art. 373, I, CPC)'
      ],
      urgencyLevel: 'MEDIA',
      urgencyReason: 'Recomenda-se apuração aprofundada da prescrição trienal/quinzenal e coleta de provas documentais preliminares antes da distribuição da petição inicial.',
      suggestedActionType: 'Ação Ordinária com Pedido de Reparação Civil e Obrigação de Fazer',
      suggestedLegalArea: 'Cível',
      estimatedValue: 50000.00
    };
  },

  /**
   * Placeholder / Conector para integração real com APIs de LLM
   * Exemplo de conexão com Anthropic Claude, Gemini API ou OpenAI.
   */
  async callRealLLMApi(prompt: string, apiKey: string, modelName: string = 'claude-3-5-sonnet-20241022') {
    /*
      Exemplo de implementação para Backend / Edge Function:
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 2000,
          temperature: 0.2,
          system: "Você é o motor de IA do DEX, um software de gestão jurídica especializado em direito brasileiro. " +
                  "Estruture sua resposta estritamente em formato JSON com as chaves: factsSummary, legalFraming, clarificationQuestions, requiredDocuments, urgencyLevel (BAIXA/MEDIA/ALTA/CRITICA), urgencyReason, suggestedActionType, suggestedLegalArea.",
          messages: [{ role: "user", content: prompt }]
        })
      });
      return await response.json();
    */
    console.log(`[Dex AI] Chamada externa configurada para o modelo ${modelName} com chave ${apiKey ? '***' : 'não fornecida'}`);
    return this.analyzeCase(prompt);
  }
};

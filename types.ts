
export enum Segmento {
  INFANTIL = 'Educação Infantil',
  FUNDAMENTAL_I = 'Ensino Fundamental I',
  FUNDAMENTAL_II = 'Ensino Fundamental II',
}

export enum StatusMeta {
  ATRASADO = 'Atrasado',
  EM_ANDAMENTO = 'Em Andamento',
  CONCLUIDO = 'Concluído',
  NAO_INICIADO = 'Não Iniciado',
}

export interface Indicadores {
  ideb: number;
  frequenciaMedia: number; // %
  fluenciaLeitora: number; // % de alunos leitores
  taxaAprovacao: number; // %
}

// Interfaces para a aba "Alunos por Turmas"
export interface DadosTurno {
  integral: number;
  manha: number;
  tarde: number;
}

export interface DadosNivel {
  turmas: DadosTurno;
  alunos: DadosTurno;
}

export interface MatriculaDetalhada {
  infantil: {
    creche2: DadosNivel;
    creche3: DadosNivel;
    pre1: DadosNivel;
    pre2: DadosNivel;
  };
  fundamental: {
    ano1: DadosNivel;
    ano2: DadosNivel;
    ano3: DadosNivel;
    ano4: DadosNivel;
    ano5: DadosNivel;
    ano6: DadosNivel;
    ano7: DadosNivel;
    ano8: DadosNivel;
    ano9: DadosNivel;
    eja: DadosNivel;
  };
}

// Novos tipos para os dados detalhados
export interface DadosEducacionais {
  matricula: {
    infantil: number;
    anosIniciais: number;
    anosFinais: number;
    eja: number;
  };
  matriculaDetalhada: MatriculaDetalhada; // Novo campo para a tabela detalhada
  turmas: {
    manha: number;
    tarde: number;
    noite: number;
  };
  fluxo: {
    reprovacao: number; // %
    abandono: number; // %
    distorcaoIdadeSerie: number; // %
  };
  avaliacoesExternas: {
    saeb: number;
    seama: number;
    ideb: number;
  };
  resultadosCNCA: {
    diagnostica: number; // % ou nota média
    formativa: number;
    somativa: number;
  };
  fluenciaLeitoraDetalhada: {
    samahc: number; // % Leitor Fluente
    caed: number; // % Leitor Fluente
  };
}

export interface MetaAcao {
  id: string;
  descricao: string; // Ex: "Alfabetizar todas as crianças até o 2º ano"
  prazo: string;
  status: StatusMeta;
  responsavel: string;
}

// Interface para Recursos Humanos
export interface RecursoHumano {
  id: string;
  funcao: string; // Professor, Gestor, Coordenador, etc.
  nome: string;
  telefone: string;
  email: string;
  dataNomeacao: string;
  tipoVinculo: 'Contrato' | 'Efetivo';
  // Campos condicionais para Professores
  etapaAtuacao?: 'Educação Infantil' | 'Anos Iniciais' | 'Anos Finais' | 'EJA';
  componenteCurricular?: string; // Apenas para Anos Finais
}

// Interface para Acompanhamento Mensal
export type StatusAcompanhamento = 'Sim' | 'Não' | 'Parcialmente' | null;

export interface ItemAcompanhamento {
  id: string;
  pergunta: string;
  categoria: 'Gestão' | 'Financeiro';
  resposta: StatusAcompanhamento;
  observacao: string;
}

// Nova Interface para Relatório de Visita
export interface RelatorioVisita {
  id: string;
  data: string;
  topicosPauta: string[];
  encaminhamentos: string;
  prazo: string;
  observacoes: string;
}

// Interface para Tópicos da Pauta (Nova Visita)
export interface TopicoPauta {
  id: string;
  descricao: string;
  categoria: 'Pedagógico' | 'Administrativo' | 'Financeiro' | 'Infraestrutura' | 'Relacionamento' | 'Outros';
  observacoes: string;
}

// Interface para Encaminhamentos da Visita (Nova Visita)
export interface EncaminhamentoVisita {
  id: string;
  descricao: string;
  responsavel: string;
  status: 'Pendente' | 'Em Execução' | 'Concluído';
  prazo: string;
}

export interface Escola {
  id: string;
  nome: string;
  gestor: string;
  coordenador: string; // Nome do coordenador local
  segmentos: Segmento[];
  alunosMatriculados: number;
  indicadores: Indicadores;
  dadosEducacionais: DadosEducacionais; // Novo campo
  planoAcao: MetaAcao[];
  recursosHumanos: RecursoHumano[]; // Novo campo RH
  acompanhamentoMensal: ItemAcompanhamento[]; // Novo campo Acompanhamento
  relatoriosVisita?: RelatorioVisita[]; // Novo campo Relatórios Específicos
  localizacao: string; // Sede ou Zona Rural
}

export interface Coordenador {
  id: string;
  nome: string;
  contato: string; // Utilizado como E-mail principal/Autenticação
  regiao: string; // Ex: "Regional Sede", "Regional Litoral"
  funcao?: 'Coordenador Regional' | 'Administrador' | 'Técnico'; // Papel no sistema
  escolasIds: string[]; // Vínculo com escolas
}

export interface Visita {
  id: string;
  escolaId: string;
  escolaNome: string;
  data: string;
  tipo: 'Rotina' | 'Emergencial' | 'Temática';
  foco: string[]; // Ex: "Planejamento", "Infraestrutura", "Sala de Aula"
  topicosPauta: TopicoPauta[]; // Adicionado anteriormente
  encaminhamentosRegistrados: EncaminhamentoVisita[]; // Novo campo para lista estruturada
  observacoes: string;
  encaminhamentos: string; // Texto geral de feedback/conclusão
  status: 'Planejada' | 'Realizada' | 'Relatório Pendente';
}

export type ViewState = 'DASHBOARD' | 'LISTA_ESCOLAS' | 'DETALHE_ESCOLA' | 'NOVA_VISITA' | 'COORDENADORES' | 'RELATORIOS';

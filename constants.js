import { Segmento, StatusMeta } from './types.ts';
// Helper para criar dados vazios
export const createEmptyNivel = () => ({
    turmas: { integral: 0, manha: 0, tarde: 0 },
    alunos: { integral: 0, manha: 0, tarde: 0 }
});
export const createEmptyMatriculaDetalhada = () => ({
    infantil: {
        creche2: createEmptyNivel(),
        creche3: createEmptyNivel(),
        pre1: createEmptyNivel(),
        pre2: createEmptyNivel(),
    },
    fundamental: {
        ano1: createEmptyNivel(),
        ano2: createEmptyNivel(),
        ano3: createEmptyNivel(),
        ano4: createEmptyNivel(),
        ano5: createEmptyNivel(),
        ano6: createEmptyNivel(),
        ano7: createEmptyNivel(),
        ano8: createEmptyNivel(),
        ano9: createEmptyNivel(),
        eja: createEmptyNivel(),
    }
});
export const createEmptyDadosEducacionais = () => ({
    matricula: { infantil: 0, anosIniciais: 0, anosFinais: 0, eja: 0 },
    matriculaDetalhada: createEmptyMatriculaDetalhada(),
    turmas: { manha: 0, tarde: 0, noite: 0 },
    fluxo: { reprovacao: 0, abandono: 0, distorcaoIdadeSerie: 0 },
    avaliacoesExternas: { saeb: 0, seama: 0, ideb: 0 },
    resultadosCNCA: { diagnostica: 0, formativa: 0, somativa: 0 },
    fluenciaLeitoraDetalhada: { samahc: 0, caed: 0 }
});
// Perguntas de Gestão Escolar
const PERGUNTAS_GESTAO = [
    "O(a) gestor(a)/coordenador(a) está presente na escola no acolhimento dos alunos/comunidade?",
    "O ambiente escolar é favorável à aprendizagem (acolhida dos alunos, engajamento dos professores, clima harmonioso)?",
    "A escola realizou a eleição para líderes de turmas, conforme orientado pela Secretaria Municipal de Educação?",
    "Os instrumentais de conselho de classe são utilizados conforme orientações da Secretaria Municipal de Educação?",
    "Os líderes de turma participam das reuniões do conselho de classe?",
    "O conselho de classe acontece de forma bimestral conforme orientações da Secretaria Municipal de Educação?",
    "O Regimento Interno das Escolas Municipais foi apresentado à comunidade escolar?",
    "As atribuições de cada servidor estão claramente definidas?",
    "A gestão acompanha diariamente a frequência dos alunos?",
    "Houve o cumprimento dos dias letivos e carga horária previstas para o mês em curso? (verificar através do calendário letivo)",
    "O dia letivo começa no horário previsto?",
    "As crianças/adolescentes lancham na hora do recreio?",
    "O tempo usado para recreio está conforme o estipulado pela secretaria?",
    "A aula termina exatamente no horário previsto?",
    "A escola construiu o seu plano de ação?",
    "O plano de ação da escola está sendo cumprido?",
    "O(a) gestor(a) tem uma pasta com todos os indicadores de aprendizagem da escola e a atualiza frequentemente?",
    "A gestão acompanha/compreende os resultados por turma e por aluno?",
    "A gestão acompanha o trabalho do coordenador pedagógico em relação ao planejamento dos professores?",
    "O núcleo gestor visita sistematicamente a sala de aula?",
    "A Unidade Escolar efetuou o compartilhamento dos planos anuais e guias de aprendizagem no drive?",
    "O ciclo de reuniões acontece conforme orientações do caderno de orientações pedagógicas?",
    "O Coordenador Pedagógico dar devolutiva do Plano Anual e Guia de Aprendizagem aos professores?",
    "O(a) gestor(a) elabora junto com o coordenador estratégias de intervenção com base nos resultados da escola?",
    "O núcleo gestor conhece o material estruturado e/ou de apoio utilizado em sala de aula?",
    "O núcleo gestor conhece a rotina utilizada pelos professores em sala de aula?",
    "Os professores participam regular e ativamente das formações?",
    "O professor faz uso do material didático estruturado?",
    "A sala de aula apresenta um ambiente favorável à aprendizagem?",
    "O professor promove situações de leitura?",
    "Os alunos demonstram envolvimento durante a aula?",
    "A escola promove recuperação paralela de acordo com o caderno de orientações pedagógicas?",
    "A escola desenvolve estratégias de reforço escolar?",
    "As avaliações do SAMAHC estão sendo realizadas pela escola?",
    "A escola reflete/analisa sistematicamente as avaliações (externas e internas), bem como os resultados dos indicadores, propondo intervenções quando necessário?",
    "A escola divulga os resultados das avaliações (internas e externas) à comunidade escolar e local?",
    "A escola dá uma atenção especial à política de alfabetização dos alunos?",
    "A escola coordena a definição metas de aprendizagem para a gestão/coordenação/professores?",
    "A escola tenta lotar os professores de acordo com seu perfil e habilidades para adequá-los às necessidades das turmas?",
    "O núcleo gestor tem atenção para implementar os encaminhamentos/combinados sugeridos e acordados com o coordenador regional?"
];
// Perguntas Financeiras
const PERGUNTAS_FINANCEIRO = [
    "A escola prioriza a aquisição de insumos e bens para apoiar na aprendizagem dos alunos?",
    "A escola identifica suas prioridades de forma participativa?",
    "Apresenta pleno conhecimento das especificidades dos programas financeiros que assistem à escola?",
    "A escola cumpre com os prazos estabelecidos no que concerne à utilização/prestação de contas dos recursos?",
    "Controla de forma eficiente o consumo dos materiais adquiridos pela escola?",
    "Publiciza a prestação de contas para toda a comunidade?"
];
export const generateAcompanhamentoMensal = () => {
    const itensGestao = PERGUNTAS_GESTAO.map((pergunta, index) => ({
        id: `g-${index}-${Date.now()}`,
        pergunta,
        categoria: 'Gestão',
        resposta: null,
        observacao: ''
    }));
    const itensFinanceiro = PERGUNTAS_FINANCEIRO.map((pergunta, index) => ({
        id: `f-${index}-${Date.now()}`,
        pergunta,
        categoria: 'Financeiro',
        resposta: null,
        observacao: ''
    }));
    return [...itensGestao, ...itensFinanceiro];
};
const createMockMatricula = (baseAlunos) => {
    const data = createEmptyMatriculaDetalhada();
    data.fundamental.ano1.turmas = { integral: 0, manha: 2, tarde: 1 };
    data.fundamental.ano1.alunos = { integral: 0, manha: 50, tarde: 25 };
    data.fundamental.ano5.turmas = { integral: 0, manha: 1, tarde: 1 };
    data.fundamental.ano5.alunos = { integral: 0, manha: 30, tarde: 25 };
    return data;
};
export const ESCOLAS_MOCK = [
    {
        id: '1',
        nome: 'U.E. Humberto de Campos - Sede',
        gestor: 'Maria da Silva',
        coordenador: 'João Souza',
        segmentos: [Segmento.FUNDAMENTAL_I, Segmento.FUNDAMENTAL_II],
        alunosMatriculados: 450,
        localizacao: 'Sede',
        indicadores: {
            ideb: 4.8,
            frequenciaMedia: 85,
            fluenciaLeitora: 62,
            taxaAprovacao: 92
        },
        dadosEducacionais: {
            matricula: { infantil: 0, anosIniciais: 250, anosFinais: 200, eja: 0 },
            matriculaDetalhada: createMockMatricula(450),
            turmas: { manha: 8, tarde: 8, noite: 0 },
            fluxo: { reprovacao: 5.2, abandono: 2.1, distorcaoIdadeSerie: 12.5 },
            avaliacoesExternas: { saeb: 5.1, seama: 4.9, ideb: 4.8 },
            resultadosCNCA: { diagnostica: 65, formativa: 70, somativa: 72 },
            fluenciaLeitoraDetalhada: { samahc: 60, caed: 62 }
        },
        planoAcao: [
            {
                id: 'm1',
                descricao: 'Alfabetizar 100% das crianças até o 2º ano',
                prazo: 'Dezembro/2024',
                status: StatusMeta.EM_ANDAMENTO,
                responsavel: 'Coord. Pedagógica'
            },
            {
                id: 'm2',
                descricao: 'Reduzir a evasão escolar em 5%',
                prazo: 'Julho/2024',
                status: StatusMeta.ATRASADO,
                responsavel: 'Gestão Escolar'
            }
        ],
        recursosHumanos: [],
        acompanhamentoMensal: generateAcompanhamentoMensal(),
        relatoriosVisita: [
            {
                id: 'r1',
                data: '2024-03-15',
                topicosPauta: ['Análise de Fluxo', 'Reunião de Pais'],
                encaminhamentos: 'Agendar reunião geral para dia 20.',
                prazo: '20/03/2024',
                observacoes: 'Gestão engajada, porém com falta de pessoal de apoio.'
            }
        ]
    },
    {
        id: '2',
        nome: 'Escola Municipal Rural São José',
        gestor: 'Carlos Alberto',
        coordenador: 'Ana Pereira',
        segmentos: [Segmento.INFANTIL, Segmento.FUNDAMENTAL_I],
        alunosMatriculados: 120,
        localizacao: 'Zona Rural',
        indicadores: {
            ideb: 3.9,
            frequenciaMedia: 78,
            fluenciaLeitora: 45,
            taxaAprovacao: 88
        },
        dadosEducacionais: {
            matricula: { infantil: 40, anosIniciais: 80, anosFinais: 0, eja: 0 },
            matriculaDetalhada: createEmptyMatriculaDetalhada(),
            turmas: { manha: 4, tarde: 2, noite: 0 },
            fluxo: { reprovacao: 8.5, abandono: 0.5, distorcaoIdadeSerie: 18.0 },
            avaliacoesExternas: { saeb: 4.2, seama: 4.0, ideb: 3.9 },
            resultadosCNCA: { diagnostica: 50, formativa: 55, somativa: 58 },
            fluenciaLeitoraDetalhada: { samahc: 42, caed: 45 }
        },
        planoAcao: [
            {
                id: 'm3',
                descricao: 'Regularizar registros de frequência diária',
                prazo: 'Abril/2024',
                status: StatusMeta.CONCLUIDO,
                responsavel: 'Secretaria'
            }
        ],
        recursosHumanos: [],
        acompanhamentoMensal: generateAcompanhamentoMensal(),
        relatoriosVisita: []
    },
    {
        id: '3',
        nome: 'Centro de Ensino Pequeno Príncipe',
        gestor: 'Roberta Lima',
        coordenador: 'Pedro Santos',
        segmentos: [Segmento.INFANTIL],
        alunosMatriculados: 200,
        localizacao: 'Sede',
        indicadores: {
            ideb: 0,
            frequenciaMedia: 95,
            fluenciaLeitora: 10,
            taxaAprovacao: 100
        },
        dadosEducacionais: {
            matricula: { infantil: 200, anosIniciais: 0, anosFinais: 0, eja: 0 },
            matriculaDetalhada: createEmptyMatriculaDetalhada(),
            turmas: { manha: 5, tarde: 5, noite: 0 },
            fluxo: { reprovacao: 0, abandono: 0, distorcaoIdadeSerie: 0 },
            avaliacoesExternas: { saeb: 0, seama: 0, ideb: 0 },
            resultadosCNCA: { diagnostica: 0, formativa: 0, somativa: 0 },
            fluenciaLeitoraDetalhada: { samahc: 0, caed: 0 }
        },
        planoAcao: [],
        recursosHumanos: [],
        acompanhamentoMensal: generateAcompanhamentoMensal(),
        relatoriosVisita: []
    }
];
export const COORDENADORES_MOCK = [
    {
        id: 'c1',
        nome: 'Fernanda Oliveira',
        contato: 'fernanda@educacao.gov.br',
        regiao: 'Regional Sede',
        funcao: 'Coordenador Regional',
        escolasIds: ['1', '3']
    },
    {
        id: 'c2',
        nome: 'Roberto Mendes',
        contato: 'roberto@educacao.gov.br',
        regiao: 'Regional Zona Rural',
        funcao: 'Coordenador Regional',
        escolasIds: ['2']
    }
];
export const VISITAS_MOCK = [
    {
        id: 'v1',
        escolaId: '1',
        escolaNome: 'U.E. Humberto de Campos - Sede',
        data: '2024-03-10',
        tipo: 'Rotina',
        foco: ['Planejamento', 'Sala de Aula'],
        topicosPauta: [
            {
                id: 't1',
                descricao: 'Análise dos diários de classe',
                categoria: 'Pedagógico',
                observacoes: 'Verificar preenchimento'
            }
        ],
        encaminhamentosRegistrados: [
            {
                id: 'e1',
                descricao: 'Atualizar diários de classe da turma 3º ano B',
                responsavel: 'Coordenador Pedagógico',
                status: 'Pendente',
                prazo: '2024-03-20'
            }
        ],
        observacoes: 'Professores do 3º ano com dificuldades na gestão de tempo. Planejamento alinhado à BNCC.',
        encaminhamentos: 'Agendar oficina de gestão de tempo.',
        status: 'Realizada'
    },
    {
        id: 'v2',
        escolaId: '2',
        escolaNome: 'Escola Municipal Rural São José',
        data: '2024-03-12',
        tipo: 'Emergencial',
        foco: ['Infraestrutura'],
        topicosPauta: [],
        encaminhamentosRegistrados: [],
        observacoes: 'Problema no abastecimento de água afetando a merenda.',
        encaminhamentos: 'Solicitado caminhão pipa à secretaria.',
        status: 'Relatório Pendente'
    }
];

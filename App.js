import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { SchoolList } from './components/SchoolList.tsx';
import { SchoolDetail } from './components/SchoolDetail.tsx';
import { VisitForm } from './components/VisitForm.tsx';
import { CoordinatorsManager } from './components/CoordinatorsManager.tsx';
import { ReportsModule } from './components/ReportsModule.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { supabase } from './services/supabase.ts';
import { useNotification } from './context/NotificationContext.tsx';
import { generateUUID } from './utils.ts';
import { ESCOLAS_MOCK, VISITAS_MOCK, COORDENADORES_MOCK } from './constants.ts';
const ADMIN_EMAIL = 'jadsoncsilv@gmail.com';
export default function App() {
    const { showNotification } = useNotification();
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentView, setCurrentView] = useState('DASHBOARD');
    const [selectedEscolaId, setSelectedEscolaId] = useState(null);
    // App Data State
    const [escolas, setEscolas] = useState([]);
    const [visitas, setVisitas] = useState([]);
    const [coordenadores, setCoordenadores] = useState([]);
    // Function to load all data
    const fetchData = async (isDemo = false, email = null) => {
        if (isDemo) {
            setEscolas(ESCOLAS_MOCK);
            setVisitas(VISITAS_MOCK);
            setCoordenadores(COORDENADORES_MOCK);
            setIsAdmin(true);
            return;
        }
        const currentEmail = email || userEmail;
        if (!currentEmail)
            return;
        const isUserAdmin = currentEmail === ADMIN_EMAIL;
        setIsAdmin(isUserAdmin);
        try {
            const { data: coordData, error: coordError } = await supabase.from('coordenadores').select('*, coordenador_escolas(escola_id)');
            if (coordError)
                throw coordError;
            const mappedCoords = coordData?.map((c) => ({
                id: c.id,
                nome: c.nome,
                contato: c.contato,
                regiao: c.regiao,
                escolasIds: c.coordenador_escolas?.map((ce) => ce.escola_id) || []
            })) || [];
            let linkedSchoolIds = [];
            if (!isUserAdmin) {
                const currentUserCoord = mappedCoords.find(c => c.contato.toLowerCase() === currentEmail?.toLowerCase());
                if (currentUserCoord) {
                    linkedSchoolIds = currentUserCoord.escolasIds;
                }
                else {
                    setEscolas([]);
                    setVisitas([]);
                    setCoordenadores(mappedCoords);
                    showNotification('error', 'Seu usuário não está vinculado a nenhuma escola. Contate o administrador.');
                    return;
                }
            }
            let escQuery = supabase.from('escolas').select('*');
            if (!isUserAdmin) {
                escQuery = escQuery.in('id', linkedSchoolIds);
            }
            const { data: escData, error: escError } = await escQuery;
            if (escError)
                throw escError;
            const activeSchoolIds = (escData || []).map(e => e.id);
            const { data: metasData } = await supabase.from('metas_acao').select('*').in('escola_id', activeSchoolIds);
            const { data: rhData } = await supabase.from('recursos_humanos').select('*').in('escola_id', activeSchoolIds);
            const { data: acompData } = await supabase.from('acompanhamento_mensal').select('*').in('escola_id', activeSchoolIds);
            const mappedEscolas = (escData || []).map((e) => ({
                id: e.id,
                nome: e.nome,
                gestor: e.gestor,
                coordenador: e.coordenador,
                localizacao: e.localizacao,
                segmentos: e.segmentos || [],
                alunosMatriculados: e.alunos_matriculados,
                indicadores: e.indicadores || { ideb: 0, frequenciaMedia: 0, fluenciaLeitora: 0, taxaAprovacao: 0 },
                dadosEducacionais: e.dados_educacionais || {},
                planoAcao: metasData?.filter((m) => m.escola_id === e.id).map((m) => ({ ...m, status: m.status })) || [],
                recursosHumanos: rhData?.filter((r) => r.escola_id === e.id).map((r) => ({
                    id: r.id,
                    funcao: r.funcao,
                    nome: r.nome,
                    telefone: r.telefone,
                    email: r.email,
                    dataNomeacao: r.data_nomeacao,
                    tipoVinculo: r.tipo_vinculo,
                    etapaAtuacao: r.etapa_atuacao,
                    componenteCurricular: r.componente_curricular
                })) || [],
                acompanhamentoMensal: acompData?.filter((a) => a.escola_id === e.id) || [],
                relatoriosVisita: []
            }));
            let visQuery = supabase.from('visitas').select('*');
            if (!isUserAdmin) {
                visQuery = visQuery.in('escola_id', linkedSchoolIds);
            }
            const { data: visData, error: visError } = await visQuery;
            if (visError)
                throw visError;
            const mappedVisitas = visData?.map((v) => ({
                id: v.id,
                escolaId: v.escola_id,
                escolaNome: v.escola_nome || mappedEscolas.find(e => e.id === v.escola_id)?.nome || 'Escola',
                data: v.data,
                tipo: v.tipo,
                foco: v.foco || [],
                topicosPauta: v.topicos_pauta || [],
                encaminhamentosRegistrados: v.encaminhamentos_registrados || [],
                observacoes: v.observacoes,
                encaminhamentos: v.encaminhamentos,
                status: v.status
            })) || [];
            setEscolas(mappedEscolas);
            setVisitas(mappedVisitas);
            setCoordenadores(mappedCoords);
        }
        catch (error) {
            console.error('Error fetching data:', error);
            showNotification('error', 'Erro ao carregar dados do servidor.');
        }
    };
    useEffect(() => {
        // Check initial session with error handling for "Invalid Refresh Token"
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Auth session error:", error.message);
                // If there's an error like "Invalid Refresh Token", clear local storage and force re-auth
                supabase.auth.signOut().catch(() => { });
                setIsAuthenticated(false);
            }
            else if (session) {
                const email = session.user.email || '';
                setUserEmail(email);
                setIsAuthenticated(true);
                fetchData(false, email);
            }
            else {
                setIsAuthenticated(false);
            }
            setIsLoadingAuth(false);
        }).catch(err => {
            console.error("Unexpected error checking session:", err);
            setIsLoadingAuth(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                setIsAuthenticated(false);
                setUserEmail(null);
                setIsAdmin(false);
                setEscolas([]);
                setVisitas([]);
            }
            else if (session) {
                const email = session.user.email || '';
                setUserEmail(email);
                setIsAuthenticated(true);
                setIsDemoMode(false);
                fetchData(false, email);
            }
            else if (!isDemoMode) {
                setIsAuthenticated(false);
                setUserEmail(null);
                setIsAdmin(false);
            }
        });
        return () => subscription.unsubscribe();
    }, [isDemoMode]);
    const handleDemoLogin = () => {
        setIsDemoMode(true);
        setIsAuthenticated(true);
        setUserEmail('demo@sigar.gov.br');
        fetchData(true);
        showNotification('success', 'Entrou no Modo de Demonstração SIGAR (Acesso Administrador).');
    };
    const handleLogout = async () => {
        if (isDemoMode) {
            setIsDemoMode(false);
            setIsAuthenticated(false);
            setUserEmail(null);
            setIsAdmin(false);
        }
        else {
            try {
                await supabase.auth.signOut();
            }
            catch (err) {
                console.error("Error signing out:", err);
            }
            setIsAuthenticated(false);
            setUserEmail(null);
            setIsAdmin(false);
        }
        setCurrentView('DASHBOARD');
    };
    const handleSelectEscola = (id) => {
        setSelectedEscolaId(id);
        setCurrentView('DETALHE_ESCOLA');
    };
    const handleUpdateEscola = async (updatedEscola) => {
        if (isDemoMode) {
            setEscolas(escolas.map(e => e.id === updatedEscola.id ? updatedEscola : e));
            showNotification('success', 'Alteração simulada com sucesso (Modo Demo).');
            return;
        }
        try {
            const { error } = await supabase.from('escolas').update({
                nome: updatedEscola.nome,
                gestor: updatedEscola.gestor,
                coordenador: updatedEscola.coordenador,
                localizacao: updatedEscola.localizacao,
                segmentos: updatedEscola.segmentos,
                alunos_matriculados: updatedEscola.alunosMatriculados,
                indicadores: updatedEscola.indicadores,
                dados_educacionais: updatedEscola.dadosEducacionais
            }).eq('id', updatedEscola.id);
            if (error)
                throw error;
            await supabase.from('metas_acao').delete().eq('escola_id', updatedEscola.id);
            if (updatedEscola.planoAcao.length > 0) {
                await supabase.from('metas_acao').insert(updatedEscola.planoAcao.map(m => ({
                    escola_id: updatedEscola.id,
                    descricao: m.descricao,
                    prazo: m.prazo,
                    status: m.status,
                    responsavel: m.responsavel
                })));
            }
            await supabase.from('recursos_humanos').delete().eq('escola_id', updatedEscola.id);
            if (updatedEscola.recursosHumanos.length > 0) {
                // Fix: Access componenteCurricular instead of componente_curricular on type RecursoHumano
                await supabase.from('recursos_humanos').insert(updatedEscola.recursosHumanos.map(r => ({
                    escola_id: updatedEscola.id,
                    funcao: r.funcao,
                    nome: r.nome,
                    telefone: r.telefone,
                    email: r.email,
                    data_nomeacao: r.dataNomeacao,
                    tipo_vinculo: r.tipoVinculo,
                    etapa_atuacao: r.etapaAtuacao,
                    componente_curricular: r.componenteCurricular
                })));
            }
            await supabase.from('acompanhamento_mensal').delete().eq('escola_id', updatedEscola.id);
            if (updatedEscola.acompanhamentoMensal.length > 0) {
                await supabase.from('acompanhamento_mensal').insert(updatedEscola.acompanhamentoMensal.map(a => ({
                    escola_id: updatedEscola.id,
                    pergunta: a.pergunta,
                    categoria: a.categoria,
                    resposta: a.resposta,
                    observacao: a.observacao
                })));
            }
            setEscolas(escolas.map(e => e.id === updatedEscola.id ? updatedEscola : e));
            showNotification('success', 'Dados atualizados com sucesso!');
        }
        catch (error) {
            console.error(error);
            showNotification('error', 'Erro ao salvar informações.');
        }
    };
    const handleSaveSchool = async (newSchool) => {
        if (isDemoMode) {
            setEscolas([...escolas, newSchool]);
            showNotification('success', 'Escola adicionada (Modo Demo).');
            return;
        }
        try {
            const { error } = await supabase.from('escolas').insert({
                id: newSchool.id,
                nome: newSchool.nome,
                gestor: newSchool.gestor,
                coordenador: newSchool.coordenador,
                localizacao: newSchool.localizacao,
                segmentos: newSchool.segmentos,
                alunos_matriculados: newSchool.alunosMatriculados,
                indicadores: newSchool.indicadores,
                dados_educacionais: newSchool.dadosEducacionais
            });
            if (error)
                throw error;
            if (newSchool.acompanhamentoMensal.length > 0) {
                await supabase.from('acompanhamento_mensal').insert(newSchool.acompanhamentoMensal.map(a => ({
                    escola_id: newSchool.id,
                    pergunta: a.pergunta,
                    categoria: a.categoria,
                    resposta: a.resposta,
                    observacao: a.observacao
                })));
            }
            setEscolas([...escolas, newSchool]);
            showNotification('success', 'Escola cadastrada com sucesso!');
        }
        catch (error) {
            console.error(error);
            showNotification('error', 'Erro ao cadastrar escola.');
        }
    };
    const handleDeleteSchool = async (id) => {
        if (isDemoMode) {
            setEscolas(escolas.filter(e => e.id !== id));
            setVisitas(visitas.filter(v => v.escolaId !== id));
            showNotification('success', 'Escola removida (Modo Demo).');
            return;
        }
        try {
            const { error } = await supabase.from('escolas').delete().eq('id', id);
            if (error)
                throw error;
            setEscolas(escolas.filter(e => e.id !== id));
            setVisitas(visitas.filter(v => v.escolaId !== id));
            showNotification('success', 'Escola e dados associados removidos com sucesso.');
        }
        catch (error) {
            console.error(error);
            showNotification('error', 'Erro ao excluir escola do servidor.');
        }
    };
    const handleSaveVisit = async (newVisitData) => {
        const visitId = generateUUID();
        const newVisit = { ...newVisitData, id: visitId };
        if (isDemoMode) {
            setVisitas([newVisit, ...visitas]);
            setCurrentView('DASHBOARD');
            showNotification('success', 'Visita simulada com sucesso!');
            return;
        }
        try {
            const { error } = await supabase.from('visitas').insert({
                id: visitId,
                escola_id: newVisit.escolaId,
                escola_nome: newVisit.escolaNome,
                data: newVisit.data,
                tipo: newVisit.tipo,
                foco: newVisit.foco,
                topicos_pauta: newVisit.topicosPauta,
                encaminhamentos_registrados: newVisit.encaminhamentosRegistrados,
                observacoes: newVisit.observacoes,
                encaminhamentos: newVisit.encaminhamentos,
                status: newVisit.status
            });
            if (error)
                throw error;
            setVisitas([newVisit, ...visitas]);
            setCurrentView('DASHBOARD');
            showNotification('success', 'Visita registrada com sucesso!');
        }
        catch (error) {
            console.error(error);
            showNotification('error', 'Não foi possível salvar a visita.');
        }
    };
    const handleUpdateVisitStatus = async (visitId, newStatus) => {
        if (isDemoMode) {
            setVisitas(visitas.map(v => v.id === visitId ? { ...v, status: newStatus } : v));
            showNotification('success', 'Status da visita atualizado (Modo Demo).');
            return;
        }
        try {
            const { error } = await supabase
                .from('visitas')
                .update({ status: newStatus })
                .eq('id', visitId);
            if (error)
                throw error;
            setVisitas(visitas.map(v => v.id === visitId ? { ...v, status: newStatus } : v));
            showNotification('success', 'Status da visita atualizado com sucesso!');
        }
        catch (error) {
            console.error('Error updating visit status:', error);
            showNotification('error', 'Erro ao atualizar o status da visita.');
        }
    };
    const handleSaveCoordenador = async (coord) => {
        if (isDemoMode) {
            if (coord.id) {
                setCoordenadores(coordenadores.map(c => c.id === coord.id ? coord : c));
            }
            else {
                const newId = generateUUID();
                setCoordenadores([...coordenadores, { ...coord, id: newId }]);
            }
            showNotification('success', 'Coordenador atualizado (Demo).');
            return;
        }
        try {
            if (coord.id) {
                const { error } = await supabase.from('coordenadores').update({
                    nome: coord.nome,
                    contato: coord.contato,
                    regiao: coord.regiao
                }).eq('id', coord.id);
                if (error)
                    throw error;
                await supabase.from('coordenador_escolas').delete().eq('coordenador_id', coord.id);
                if (coord.escolasIds.length > 0) {
                    await supabase.from('coordenador_escolas').insert(coord.escolasIds.map(eid => ({ coordenador_id: coord.id, escola_id: eid })));
                }
                setCoordenadores(coordenadores.map(c => c.id === coord.id ? coord : c));
                showNotification('success', 'Coordenador atualizado!');
            }
            else {
                const newId = generateUUID();
                const { error } = await supabase.from('coordenadores').insert({
                    id: newId,
                    nome: coord.nome,
                    contato: coord.contato,
                    regiao: coord.regiao
                });
                if (error)
                    throw error;
                if (coord.escolasIds.length > 0) {
                    await supabase.from('coordenador_escolas').insert(coord.escolasIds.map(eid => ({ coordenador_id: newId, escola_id: eid })));
                }
                setCoordenadores([...coordenadores, { ...coord, id: newId }]);
                showNotification('success', 'Coordenador cadastrado!');
            }
        }
        catch (error) {
            console.error(error);
            showNotification('error', 'Erro ao salvar coordenador.');
        }
    };
    const handleDeleteCoordenador = async (id) => {
        if (isDemoMode) {
            setCoordenadores(coordenadores.filter(c => c.id !== id));
            showNotification('success', 'Removido (Demo).');
            return;
        }
        try {
            const { error } = await supabase.from('coordenadores').delete().eq('id', id);
            if (error)
                throw error;
            setCoordenadores(coordenadores.filter(c => c.id !== id));
            showNotification('success', 'Coordenador removido.');
        }
        catch (error) {
            showNotification('error', 'Erro ao remover.');
        }
    };
    const renderContent = () => {
        switch (currentView) {
            case 'DASHBOARD':
                return (_jsx(Dashboard, { escolas: escolas, visitas: visitas, onNavigateToSchools: () => setCurrentView('LISTA_ESCOLAS'), onUpdateVisitStatus: handleUpdateVisitStatus }));
            case 'LISTA_ESCOLAS':
                return (_jsx(SchoolList, { escolas: escolas, onSelectEscola: handleSelectEscola, onSave: handleSaveSchool, onUpdate: handleUpdateEscola, onDelete: handleDeleteSchool }));
            case 'DETALHE_ESCOLA':
                const escola = escolas.find(e => e.id === selectedEscolaId);
                if (!escola)
                    return _jsx("div", { children: "Escola n\u00E3o encontrada" });
                return (_jsx(SchoolDetail, { escola: escola, historicoVisitas: visitas.filter(v => v.escolaId === escola.id), onBack: () => setCurrentView('LISTA_ESCOLAS'), onUpdate: handleUpdateEscola, onUpdateVisitStatus: handleUpdateVisitStatus }));
            case 'NOVA_VISITA':
                return (_jsx(VisitForm, { escolas: escolas, onSave: handleSaveVisit, onCancel: () => setCurrentView('DASHBOARD') }));
            case 'COORDENADORES':
                if (!isAdmin)
                    return _jsx("div", { children: "Acesso negado." });
                return (_jsx(CoordinatorsManager, { coordenadores: coordenadores, escolas: escolas, visitas: visitas, onSave: handleSaveCoordenador, onDelete: handleDeleteCoordenador }));
            case 'RELATORIOS':
                return (_jsx(ReportsModule, { visitas: visitas, escolas: escolas, coordenadores: coordenadores }));
            default:
                return _jsx("div", { children: "P\u00E1gina n\u00E3o encontrada" });
        }
    };
    if (isLoadingAuth) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50", children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" }), _jsx("p", { className: "text-slate-500 font-medium animate-pulse", children: "Autenticando sess\u00E3o..." })] }) }));
    }
    if (!isAuthenticated) {
        return _jsx(LoginPage, { onLogin: () => { }, onDemoLogin: handleDemoLogin });
    }
    return (_jsxs(Layout, { currentView: currentView, onChangeView: setCurrentView, onLogout: handleLogout, isAdmin: isAdmin, children: [isDemoMode && (_jsxs("div", { className: "bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-3 mb-6 flex justify-between items-center rounded-r-md shadow-sm animate-fade-in", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-bold", children: "Modo de Demonstra\u00E7\u00E3o SIGAR:" }), _jsx("span", { children: "Voc\u00EA est\u00E1 visualizando dados fict\u00EDcios como Administrador." })] }), _jsx("button", { onClick: handleLogout, className: "text-xs bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded transition font-bold", children: "SAIR DO DEMO" })] })), renderContent()] }));
}

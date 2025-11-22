
import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.chat': 'Chat',
    'nav.projects': 'Projects',
    'nav.overview': 'Overview',
    'nav.kanban': 'Kanban',
    'nav.docs': 'Docs',
    'nav.folders': 'Folders',
    'nav.automations': 'Automations',
    'nav.copy_link': 'Copy invite link',
    'nav.collapse': 'Collapse sidebar',
    'nav.expand': 'Expand sidebar',

    // Header
    'header.notifications': 'Notifications',
    'header.mark_all_read': 'Mark all as read',
    'header.close': 'Close',
    'header.caught_up': "You're all caught up!",
    'header.no_notifs': 'No recent notifications.',

    // Invite Modal
    'invite.btn': 'Invite',
    'invite.title': 'Invite or Join Project',
    'invite.select_project': 'Select Project to Invite',
    'invite.email': 'Invite by Email',
    'invite.role': 'Permission Level',
    'invite.send': 'Send Invite',
    'invite.sent': 'Sent!',
    'invite.link.title': 'Or share a link',
    'invite.link.desc': 'Anyone with this link can join as a Viewer.',
    'invite.copy': 'Copy Link',
    'invite.copied': 'Copied!',

    // Home
    'home.greeting.morning': 'Good morning',
    'home.greeting.afternoon': 'Good afternoon',
    'home.greeting.evening': 'Good evening',
    'home.tasks_today': 'These are your tasks for today',
    'home.no_tasks_today': 'No tasks for today. Good job!',
    'home.urgent_tasks': 'Urgent Tasks',
    'home.no_urgent_tasks': 'No urgent tasks. Keep it up!',
    'home.productivity': 'Productivity',
    'home.due_in': 'Due in',

    // Chat
    'chat.select_conversation': 'Select a conversation',
    'chat.choose_chat': 'Choose a chat from the left to start messaging.',
    'chat.type_message': 'Type a message...',
    'chat.recording': 'Recording...',
    'chat.messages': 'Messages',
    'chat.search': 'Search',
    'chat.create_group': 'Create New Group',
    'chat.view_profile': 'View Profile Information',
    'chat.active_now': 'Active now',
    'chat.view_task': 'View Task',
    'chat.shared_files': 'Shared files',
    'chat.shared_photos': 'Shared photos',
    'chat.privacy': 'Privacy & Help',
    'chat.wallpaper': 'Chat Wallpaper',

    // Settings
    'settings.title': 'Settings',
    'settings.tabs.profile': 'My Account',
    'settings.tabs.billing': 'Billing & Plans',
    'settings.tabs.notifications': 'Notifications',
    'settings.tabs.integrations': 'Integrations',
    'settings.tabs.security': 'Security',
    'settings.tabs.appearance': 'Appearance',
    'settings.language': 'Platform Language',
    'settings.language.desc': 'Select your preferred language for the interface.',
    'settings.theme': 'Interface Theme',
    'settings.theme.desc': 'Choose a theme that suits your workspace vibe.',
    'settings.cancel': 'Cancel',
    'settings.save': 'Save Changes',

    // Automations
    'auto.title': 'Automations',
    'auto.create': 'Create Automation',
    'auto.active': 'Active',
    'auto.runs': 'Runs',
    'auto.trigger': 'Trigger',
    'auto.action': 'Action',
    'auto.builder.title': 'Automation Builder',
    'auto.builder.desc': 'Drag & drop logic blocks to create workflows.',
    'auto.trigger.when': 'When...',
    'auto.action.then': 'Then...',
    'auto.save': 'Save Automation',
    'auto.no_automations': 'No automations yet',
    'auto.no_automations_desc': 'Create your first automation to streamline your workflow.',

    // Creation Wizard
    'wizard.select_mode': 'How would you like to start?',
    'wizard.mode.manual': 'Create Manually',
    'wizard.mode.manual.desc': 'Build your project from scratch. You define the structure.',
    'wizard.mode.ai': 'Create with Nexia AI',
    'wizard.mode.ai.desc': 'Describe your idea and let AI generate the structure, KPIs, and more.',
    'wizard.ai_input.title': 'Nexia Project Architect',
    'wizard.ai_input.subtitle': 'Initialize a new project blueprint using generative AI.',
    'wizard.ai_input.name_label': 'Project Designation',
    'wizard.ai_input.desc_label': 'Project Brief / Intent',
    'wizard.ai_input.placeholder_name': 'e.g., Quantum Analytics Dashboard',
    'wizard.ai_input.placeholder_desc': 'Describe the project goals, target audience, and key features...',
    'wizard.generating': 'Initializing Nexia Core...',
    'wizard.ai.suggestion': 'Try: ',
    
    // AI Steps
    'wizard.step.analyzing': 'Analyzing requirements...',
    'wizard.step.detecting': 'Detecting language & intent...',
    'wizard.step.drafting': 'Drafting KPIs & SLAs...',
    'wizard.step.structuring': 'Structuring Kanban workflow...',
    'wizard.step.finalizing': 'Finalizing project blueprint...',
    'wizard.step.complete': 'Blueprint Generation Complete',
    'wizard.btn.generate': 'Generate Blueprint',
    'wizard.btn.review': 'Review & Customize',

    // Common
    'common.add': 'Add',
    'common.create': 'Create',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.share': 'Share',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.download': 'Download',
    'common.back': 'Back',
    'common.next': 'Next',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.chat': 'Chat',
    'nav.projects': 'Projetos',
    'nav.overview': 'Visão Geral',
    'nav.kanban': 'Kanban',
    'nav.docs': 'Documentos',
    'nav.folders': 'Arquivos',
    'nav.automations': 'Automações',
    'nav.copy_link': 'Copiar link de convite',
    'nav.collapse': 'Recolher menu',
    'nav.expand': 'Expandir menu',

    // Header
    'header.notifications': 'Notificações',
    'header.mark_all_read': 'Marcar todas como lidas',
    'header.close': 'Fechar',
    'header.caught_up': 'Você está em dia!',
    'header.no_notifs': 'Nenhuma notificação recente.',

    // Invite Modal
    'invite.btn': 'Convidar',
    'invite.title': 'Convidar ou Entrar em Projeto',
    'invite.select_project': 'Selecione o Projeto',
    'invite.email': 'Convidar por Email',
    'invite.role': 'Nível de Permissão',
    'invite.send': 'Enviar Convite',
    'invite.sent': 'Enviado!',
    'invite.link.title': 'Ou compartilhe um link',
    'invite.link.desc': 'Qualquer pessoa com o link pode entrar como Visualizador.',
    'invite.copy': 'Copiar Link',
    'invite.copied': 'Copiado!',

    // Home
    'home.greeting.morning': 'Bom dia',
    'home.greeting.afternoon': 'Boa tarde',
    'home.greeting.evening': 'Boa noite',
    'home.tasks_today': 'Essas são suas tarefas para hoje',
    'home.no_tasks_today': 'Nenhuma tarefa para hoje. Bom trabalho!',
    'home.urgent_tasks': 'Tarefas com urgência',
    'home.no_urgent_tasks': 'Nenhuma tarefa urgente. Mantenha o bom trabalho!',
    'home.productivity': 'Produtividade',
    'home.due_in': 'Vence em',

    // Chat
    'chat.select_conversation': 'Selecione uma conversa',
    'chat.choose_chat': 'Escolha um chat à esquerda para iniciar.',
    'chat.type_message': 'Digite uma mensagem...',
    'chat.recording': 'Gravando...',
    'chat.messages': 'Mensagens',
    'chat.search': 'Buscar',
    'chat.create_group': 'Criar Novo Grupo',
    'chat.view_profile': 'Ver Informações do Perfil',
    'chat.active_now': 'Online agora',
    'chat.view_task': 'Ver Tarefa',
    'chat.shared_files': 'Arquivos compartilhados',
    'chat.shared_photos': 'Fotos compartilhadas',
    'chat.privacy': 'Privacidade e Ajuda',
    'chat.wallpaper': 'Papel de Parede',

    // Settings
    'settings.title': 'Configurações',
    'settings.tabs.profile': 'Minha Conta',
    'settings.tabs.billing': 'Planos e Fatura',
    'settings.tabs.notifications': 'Notificações',
    'settings.tabs.integrations': 'Integrações',
    'settings.tabs.security': 'Segurança',
    'settings.tabs.appearance': 'Aparência',
    'settings.language': 'Idioma da Plataforma',
    'settings.language.desc': 'Selecione seu idioma preferido para a interface.',
    'settings.theme': 'Tema da Interface',
    'settings.theme.desc': 'Escolha um tema que combine com seu estilo.',
    'settings.cancel': 'Cancelar',
    'settings.save': 'Salvar Alterações',

    // Automations
    'auto.title': 'Automações',
    'auto.create': 'Criar Automação',
    'auto.active': 'Ativa',
    'auto.runs': 'Execuções',
    'auto.trigger': 'Gatilho',
    'auto.action': 'Ação',
    'auto.builder.title': 'Construtor de Automação',
    'auto.builder.desc': 'Arraste blocos de lógica para criar fluxos.',
    'auto.trigger.when': 'Quando...',
    'auto.action.then': 'Então...',
    'auto.save': 'Salvar Automação',
    'auto.no_automations': 'Nenhuma automação ainda',
    'auto.no_automations_desc': 'Crie sua primeira automação para agilizar seu fluxo.',

    // Creation Wizard
    'wizard.select_mode': 'Como você gostaria de começar?',
    'wizard.mode.manual': 'Criar Manualmente',
    'wizard.mode.manual.desc': 'Construa seu projeto do zero. Você define a estrutura.',
    'wizard.mode.ai': 'Criar com Nexia AI',
    'wizard.mode.ai.desc': 'Descreva sua ideia e deixe a IA gerar a estrutura, KPIs e mais.',
    'wizard.ai_input.title': 'Arquiteto de Projetos Nexia',
    'wizard.ai_input.subtitle': 'Inicialize o blueprint de um novo projeto usando IA generativa.',
    'wizard.ai_input.name_label': 'Designação do Projeto',
    'wizard.ai_input.desc_label': 'Briefing / Intenção do Projeto',
    'wizard.ai_input.placeholder_name': 'ex: Dashboard Analítico Quântico',
    'wizard.ai_input.placeholder_desc': 'Descreva os objetivos, público-alvo e principais funcionalidades...',
    'wizard.generating': 'Inicializando Núcleo Nexia...',
    'wizard.ai.suggestion': 'Tente: ',

    // AI Steps
    'wizard.step.analyzing': 'Analisando requisitos...',
    'wizard.step.detecting': 'Detectando idioma e intenção...',
    'wizard.step.drafting': 'Redigindo KPIs e SLAs...',
    'wizard.step.structuring': 'Estruturando workflow Kanban...',
    'wizard.step.finalizing': 'Finalizando blueprint do projeto...',
    'wizard.step.complete': 'Blueprint Gerado com Sucesso',
    'wizard.btn.generate': 'Gerar Blueprint',
    'wizard.btn.review': 'Revisar & Customizar',

    // Common
    'common.add': 'Adicionar',
    'common.create': 'Criar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.share': 'Compartilhar',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.download': 'Baixar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('nexus_language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'pt')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('nexus_language', lang);
  };

  const t = (key: string): string => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

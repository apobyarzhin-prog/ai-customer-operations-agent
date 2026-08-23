import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { Archive, ArrowUpRight, Bot, Check, ChevronDown, CircleHelp, Clock3, Inbox, KeyRound, Languages, LayoutDashboard, LogOut, Menu, Moon, MoreHorizontal, Paperclip, PanelRight, Search, Send, Settings, ShieldCheck, Sun, Tag, UserRound, X } from 'lucide-react'

type Locale = 'en' | 'pl' | 'de' | 'es' | 'ru'
type Ticket = { id: number; customer: string; initials: string; subject: string; preview: string; time: string; status: 'open' | 'pending' | 'escalated' | 'resolved'; channel: string; order: string; email: string; total: string; customerMessage?: string; agentMessage?: string; policy?: string; recommendedAction?: string; orderStatus?: string; delivery?: string; tags?: string[] }
type ApiTicket = { id: number; customer_id: number; subject: string; description: string; status: 'open' | 'in_progress' | 'resolved'; created_at: string }
type ApiCustomer = { id: number; name: string; email: string }
type TriageResult = { priority: 'low' | 'normal' | 'high' | 'urgent'; recommended_status: 'open' | 'in_progress' | 'resolved'; summary: string; suggested_reply: string; confidence: number; reasoning: string[] }
type WorkspaceSettings = { name: string; logoUrl: string; brandColor: string; secondaryColor: string }
type ApiWorkspaceSettings = { product_name: string; logo_url: string; brand_color: string; brand_secondary_color: string }
type Role = 'owner' | 'admin' | 'agent' | 'viewer'
type AuthUser = { id: number; email: string; workspace_id: number; role: Role }
type AuthSession = { access_token: string; token_type: string; expires_in: number; user: AuthUser }
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'
const DEMO_AUTH_ENABLED = import.meta.env.VITE_DEMO_AUTH_ENABLED === 'true'
const PRODUCTION_LOGO_URL = '/relay-mark.svg'
const defaultWorkspaceSettings: WorkspaceSettings = { name: 'Relay Operations', logoUrl: PRODUCTION_LOGO_URL, brandColor: '#D97706', secondaryColor: '#0F766E' }

const demoTickets: Ticket[] = [
  { id: 1, customer: 'Maya Chen', initials: 'MC', subject: 'Package arrived damaged', preview: 'Hi, the box was damaged when it arrived and one item is missing.', time: '10:42', status: 'open', channel: 'Email', order: '#10482', email: 'maya.chen@example.com', total: '$129.00', customerMessage: 'Hi, the box was damaged when it arrived and one item is missing.', agentMessage: 'I’m sorry about the condition your package arrived in. I’m checking the order details now and will help get this resolved.', policy: 'Damaged delivery', recommendedAction: 'Offer a replacement for the missing item and waive the reshipping fee.', orderStatus: 'In transit', delivery: 'Expected delivery · Dec 14', tags: ['damaged-delivery', 'priority'] },
  { id: 2, customer: 'Jon Bell', initials: 'JB', subject: 'Where is my order?', preview: 'Could you check if the delivery is still on track?', time: '09:18', status: 'pending', channel: 'Chat', order: '#10476', email: 'jon.bell@example.com', total: '$84.50', customerMessage: 'Could you check if the delivery is still on track?', agentMessage: 'I’ve checked the latest scan and will keep you posted on the delivery window.', policy: 'Delivery status', recommendedAction: 'Share the latest tracking update and set a follow-up reminder.', orderStatus: 'In transit', delivery: 'Expected delivery · Dec 15', tags: ['delivery', 'tracking'] },
  { id: 3, customer: 'Sofia Rossi', initials: 'SR', subject: 'Requesting a return', preview: 'I would like to return the jacket from my last order.', time: 'Yesterday', status: 'escalated', channel: 'Email', order: '#10451', email: 'sofia.rossi@example.com', total: '$210.00', customerMessage: 'I would like to return the jacket from my last order.', agentMessage: 'I can help review the return window and make sure the item is eligible.', policy: 'Returns and refunds', recommendedAction: 'Confirm the return reason and issue a prepaid return label if eligible.', orderStatus: 'Delivered', delivery: 'Delivered · Dec 8', tags: ['return', 'review'] },
  { id: 4, customer: 'Alex Morgan', initials: 'AM', subject: 'Update shipping address', preview: 'I moved and need to update the address before dispatch.', time: 'Yesterday', status: 'open', channel: 'Chat', order: '#10433', email: 'alex.morgan@example.com', total: '$56.00', customerMessage: 'I moved and need to update the address before dispatch.', agentMessage: 'I’ll verify whether the order has entered fulfillment before changing the address.', policy: 'Address changes', recommendedAction: 'Verify fulfillment status, then update the address or escalate to operations.', orderStatus: 'Processing', delivery: 'Expected delivery · Dec 18', tags: ['address-change', 'priority'] },
]

const copy = {
  en: { inbox: 'Inbox', customers: 'Customers', knowledge: 'Knowledge', reports: 'Reports', search: 'Search conversations', assigned: 'Assigned to me', open: 'Open', waiting: 'Waiting', escalated: 'Escalated', conversation: 'Conversation', context: 'Customer context', order: 'Order', activity: 'Activity', recommended: 'Recommended next step', reply: 'Reply to', send: 'Send reply', note: 'Add internal note', resolved: 'Mark as resolved', escalate: 'Escalate', ai: 'Relay Assist', all: 'All conversations', settings: 'Settings', operator: 'Operator', today: 'Today', viewCustomer: 'View customer', view: 'View', tags: 'Tags', writeReply: 'Write a reply...', replySaved: 'Reply saved to the conversation.', policyMatch: 'Policy match', shipped: 'Order shipped', payment: 'Payment captured', placed: 'Order placed', queue: 'Conversation queue', contextPanel: 'Customer context panel', close: 'Close', more: 'More actions', attach: 'Attach file', status: 'Change status', menu: 'Open conversation queue', panel: 'Open customer context', triage: 'Run AI triage', triageTitle: 'AI ticket triage', triageLoading: 'Analyzing ticket…', triageUnavailable: 'AI triage is unavailable. Check that the backend is running.', triagePriority: 'Priority', triageStatus: 'Recommended status', triageSummary: 'Summary', triageReply: 'Suggested reply', triageConfidence: 'Confidence', triageReasoning: 'Why this was suggested', useReply: 'Use suggested reply', workspaceSettings: 'Workspace settings', workspaceName: 'Workspace name', logoUrl: 'Logo URL', brandColor: 'Brand color', secondaryColor: 'Secondary color', saveSettings: 'Save changes', resetSettings: 'Reset defaults', settingsHint: 'Workspace branding loads from the API when available. This browser keeps a fallback copy.', settingsLoading: 'Loading workspace branding…', settingsLoadError: 'Using local demo branding because the workspace API is unavailable.', settingsSaveError: 'Could not save to the workspace API. Your changes are kept locally.', language: 'Language', theme: 'Toggle theme', noConversations: 'No conversations found', tryDifferentSearch: 'Try a different search.', noConversationSelected: 'No conversation selected', noConversationsAvailable: 'No conversations available', adjustSearch: 'Adjust your search to continue.', connectBackend: 'Connect the backend or add a conversation to get started.', productionLogo: 'Production logo preview', saving: 'Saving…', viewPolicy: 'View policy', notAvailable: 'Not available', deliveryUnavailable: 'Delivery details not available', sendShortcut: 'Press ⌘ + Enter to send', priorityLow: 'low', priorityNormal: 'normal', priorityHigh: 'high', priorityUrgent: 'urgent', statusOpen: 'open', statusInProgress: 'in progress', statusResolved: 'resolved', login: 'Sign in', email: 'Email', password: 'Password', signIn: 'Sign in to workspace', signOut: 'Sign out', invalidLogin: 'Could not sign in. Check your email and password.', sessionLoading: 'Restoring session…', role: 'Role', workspace: 'Workspace', viewerReadOnly: 'Viewer access is read-only.', demoCredentials: 'Demo: demo@relay.example / demo-password', secureWorkspace: 'Secure workspace access for your operations team.', demoAuthEnabled: 'Demo auth is enabled for local development.', demoAuthDisabled: 'Demo credentials work only when enabled by the backend.' },
  pl: { inbox: 'Skrzynka', customers: 'Klienci', knowledge: 'Baza wiedzy', reports: 'Raporty', search: 'Szukaj rozmów', assigned: 'Przypisane do mnie', open: 'Otwarte', waiting: 'Oczekujące', escalated: 'Eskalowane', conversation: 'Rozmowa', context: 'Kontekst klienta', order: 'Zamówienie', activity: 'Aktywność', recommended: 'Sugerowany następny krok', reply: 'Odpowiedz', send: 'Wyślij odpowiedź', note: 'Dodaj notatkę', resolved: 'Oznacz jako rozwiązane', escalate: 'Eskaluj', ai: 'Relay Assist', all: 'Wszystkie rozmowy', settings: 'Ustawienia', operator: 'Operator', today: 'Dzisiaj', viewCustomer: 'Zobacz klienta', view: 'Zobacz', tags: 'Tagi', writeReply: 'Napisz odpowiedź...', replySaved: 'Odpowiedź zapisana w rozmowie.', policyMatch: 'Zgodność z zasadą', shipped: 'Zamówienie wysłane', payment: 'Płatność zaksięgowana', placed: 'Zamówienie utworzone', queue: 'Kolejka rozmów', contextPanel: 'Panel kontekstu klienta', close: 'Zamknij', more: 'Więcej działań', attach: 'Dołącz plik', status: 'Zmień status', menu: 'Otwórz kolejkę rozmów', panel: 'Otwórz kontekst klienta', triage: 'Uruchom triage AI', triageTitle: 'Triage AI zgłoszenia', triageLoading: 'Analizowanie zgłoszenia…', triageUnavailable: 'Triage AI jest niedostępny. Sprawdź, czy backend działa.', triagePriority: 'Priorytet', triageStatus: 'Sugerowany status', triageSummary: 'Podsumowanie', triageReply: 'Sugerowana odpowiedź', triageConfidence: 'Pewność', triageReasoning: 'Dlaczego ta sugestia', useReply: 'Użyj sugerowanej odpowiedzi', workspaceSettings: 'Ustawienia przestrzeni', workspaceName: 'Nazwa przestrzeni', logoUrl: 'URL logo', brandColor: 'Kolor marki', secondaryColor: 'Kolor dodatkowy', saveSettings: 'Zapisz zmiany', resetSettings: 'Przywróć domyślne', settingsHint: 'Branding przestrzeni ładuje się z API, jeśli jest dostępne. Przeglądarka przechowuje kopię zapasową.', settingsLoading: 'Ładowanie brandingu…', settingsLoadError: 'Używam lokalnego brandingu demo, ponieważ API jest niedostępne.', settingsSaveError: 'Nie udało się zapisać w API. Zmiany zachowano lokalnie.' },
  de: { inbox: 'Posteingang', customers: 'Kunden', knowledge: 'Wissensbasis', reports: 'Berichte', search: 'Gespräche suchen', assigned: 'Mir zugewiesen', open: 'Offen', waiting: 'Wartend', escalated: 'Eskaliert', conversation: 'Gespräch', context: 'Kundenkontext', order: 'Bestellung', activity: 'Aktivität', recommended: 'Empfohlener nächster Schritt', reply: 'Antworten an', send: 'Antwort senden', note: 'Interne Notiz', resolved: 'Als gelöst markieren', escalate: 'Eskalieren', ai: 'Relay Assist', all: 'Alle Gespräche', settings: 'Einstellungen', operator: 'Operator', today: 'Heute', viewCustomer: 'Kunden ansehen', view: 'Ansehen', tags: 'Tags', writeReply: 'Antwort schreiben...', replySaved: 'Antwort in der Unterhaltung gespeichert.', policyMatch: 'Richtlinienübereinstimmung', shipped: 'Bestellung versendet', payment: 'Zahlung erfasst', placed: 'Bestellung aufgegeben', queue: 'Gesprächswarteschlange', contextPanel: 'Kundenkontext', close: 'Schließen', more: 'Weitere Aktionen', attach: 'Datei anhängen', status: 'Status ändern', menu: 'Gesprächswarteschlange öffnen', panel: 'Kundenkontext öffnen', triage: 'KI-Triage starten', triageTitle: 'KI-Ticket-Triage', triageLoading: 'Ticket wird analysiert…', triageUnavailable: 'KI-Triage ist nicht verfügbar. Prüfe, ob das Backend läuft.', triagePriority: 'Priorität', triageStatus: 'Empfohlener Status', triageSummary: 'Zusammenfassung', triageReply: 'Vorgeschlagene Antwort', triageConfidence: 'Konfidenz', triageReasoning: 'Warum diese Empfehlung', useReply: 'Vorgeschlagene Antwort verwenden', workspaceSettings: 'Workspace-Einstellungen', workspaceName: 'Workspace-Name', brandColor: 'Markenfarbe', secondaryColor: 'Sekundärfarbe', saveSettings: 'Änderungen speichern', resetSettings: 'Standardwerte zurücksetzen', settingsHint: 'Demo-Einstellungen werden in diesem Browser gespeichert, bis die Workspace-API verbunden ist.' },
  es: { inbox: 'Bandeja', customers: 'Clientes', knowledge: 'Base de conocimiento', reports: 'Informes', search: 'Buscar conversaciones', assigned: 'Asignadas a mí', open: 'Abiertas', waiting: 'En espera', escalated: 'Escaladas', conversation: 'Conversación', context: 'Contexto del cliente', order: 'Pedido', activity: 'Actividad', recommended: 'Siguiente paso recomendado', reply: 'Responder a', send: 'Enviar respuesta', note: 'Añadir nota interna', resolved: 'Marcar como resuelto', escalate: 'Escalar', ai: 'Relay Assist', all: 'Todas las conversaciones', settings: 'Configuración', operator: 'Operador', today: 'Hoy', viewCustomer: 'Ver cliente', view: 'Ver', tags: 'Etiquetas', writeReply: 'Escribe una respuesta...', replySaved: 'Respuesta guardada en la conversación.', policyMatch: 'Coincidencia de política', shipped: 'Pedido enviado', payment: 'Pago capturado', placed: 'Pedido realizado', queue: 'Cola de conversaciones', contextPanel: 'Panel de contexto del cliente', close: 'Cerrar', more: 'Más acciones', attach: 'Adjuntar archivo', status: 'Cambiar estado', menu: 'Abrir cola de conversaciones', panel: 'Abrir contexto del cliente', triage: 'Ejecutar triage de IA', triageTitle: 'Triage de ticket con IA', triageLoading: 'Analizando ticket…', triageUnavailable: 'El triage de IA no está disponible. Comprueba que el backend esté activo.', triagePriority: 'Prioridad', triageStatus: 'Estado recomendado', triageSummary: 'Resumen', triageReply: 'Respuesta sugerida', triageConfidence: 'Confianza', triageReasoning: 'Por qué se sugiere', useReply: 'Usar respuesta sugerida', workspaceSettings: 'Configuración del workspace', workspaceName: 'Nombre del workspace', brandColor: 'Color de marca', secondaryColor: 'Color secundario', saveSettings: 'Guardar cambios', resetSettings: 'Restablecer valores', settingsHint: 'La configuración demo se guarda en este navegador hasta conectar la API del workspace.' },
  ru: { inbox: 'Входящие', customers: 'Клиенты', knowledge: 'База знаний', reports: 'Отчёты', search: 'Поиск по обращениям', assigned: 'Назначенные мне', open: 'Открытые', waiting: 'Ожидают', escalated: 'Эскалированные', conversation: 'Обращение', context: 'Контекст клиента', order: 'Заказ', activity: 'Активность', recommended: 'Рекомендуемый следующий шаг', reply: 'Ответить', send: 'Отправить ответ', note: 'Добавить внутреннюю заметку', resolved: 'Отметить решённым', escalate: 'Эскалировать', ai: 'Relay Assist', all: 'Все обращения', settings: 'Настройки', operator: 'Оператор', today: 'Сегодня', viewCustomer: 'Открыть клиента', view: 'Открыть', tags: 'Теги', writeReply: 'Напишите ответ…', replySaved: 'Ответ сохранён в обращении.', policyMatch: 'Соответствует политике', shipped: 'Заказ отправлен', payment: 'Платёж получен', placed: 'Заказ оформлен', queue: 'Очередь обращений', contextPanel: 'Панель контекста клиента', close: 'Закрыть', more: 'Дополнительные действия', attach: 'Прикрепить файл', status: 'Изменить статус', menu: 'Открыть очередь обращений', panel: 'Открыть контекст клиента', triage: 'Запустить AI-анализ', triageTitle: 'AI-анализ обращения', triageLoading: 'Анализируем обращение…', triageUnavailable: 'AI-анализ недоступен. Проверьте, запущен ли backend.', triagePriority: 'Приоритет', triageStatus: 'Рекомендуемый статус', triageSummary: 'Краткое резюме', triageReply: 'Предлагаемый ответ', triageConfidence: 'Уверенность', triageReasoning: 'Почему это предложено', useReply: 'Использовать предложенный ответ', workspaceSettings: 'Настройки рабочего пространства', workspaceName: 'Название рабочего пространства', logoUrl: 'URL логотипа', brandColor: 'Основной цвет', secondaryColor: 'Дополнительный цвет', saveSettings: 'Сохранить изменения', resetSettings: 'Сбросить настройки', settingsHint: 'Брендинг рабочего пространства загружается через API. Если API недоступен, браузер использует локальную копию.', settingsLoading: 'Загружаем брендинг рабочего пространства…', settingsLoadError: 'Используется локальный demo-брендинг: API рабочего пространства недоступен.', settingsSaveError: 'Не удалось сохранить настройки через API. Изменения сохранены локально.', language: 'Язык', theme: 'Тема', noConversations: 'Обращения не найдены', tryDifferentSearch: 'Попробуйте изменить поисковый запрос.', noConversationSelected: 'Обращение не выбрано', noConversationsAvailable: 'Нет доступных обращений', adjustSearch: 'Измените запрос, чтобы продолжить.', connectBackend: 'Подключите backend или добавьте обращение, чтобы начать.', productionLogo: 'Предпросмотр production-логотипа', saving: 'Сохраняем…', viewPolicy: 'Открыть политику', notAvailable: 'Нет данных', deliveryUnavailable: 'Данные о доставке недоступны', sendShortcut: 'Нажмите ⌘ + Enter, чтобы отправить', priorityLow: 'низкий', priorityNormal: 'обычный', priorityHigh: 'высокий', priorityUrgent: 'срочный', statusOpen: 'открыт', statusInProgress: 'в работе', statusResolved: 'решён', login: 'Войти', email: 'Электронная почта', password: 'Пароль', signIn: 'Войти в рабочее пространство', signOut: 'Выйти', invalidLogin: 'Не удалось войти. Проверьте электронную почту и пароль.', sessionLoading: 'Восстанавливаем сессию…', role: 'Роль', workspace: 'Рабочее пространство', viewerReadOnly: 'Режим просмотра: изменения недоступны.', demoCredentials: 'Demo: demo@relay.example / demo-password', secureWorkspace: 'Безопасный доступ к рабочему пространству команды.', demoAuthEnabled: 'Demo-авторизация включена для локальной разработки.', demoAuthDisabled: 'Demo-данные работают только при включённой авторизации.' },
}
type Copy = typeof copy.en & Partial<{
  language: string
  theme: string
  noConversations: string
  tryDifferentSearch: string
  noConversationSelected: string
  noConversationsAvailable: string
  adjustSearch: string
  connectBackend: string
  productionLogo: string
  saving: string
  viewPolicy: string
  notAvailable: string
  deliveryUnavailable: string
  sendShortcut: string
  login: string
  email: string
  password: string
  signIn: string
  signOut: string
  invalidLogin: string
  sessionLoading: string
  role: string
  workspace: string
  viewerReadOnly: string
  demoCredentials: string
  secureWorkspace: string
  demoAuthEnabled?: string
  demoAuthDisabled?: string
}>

const localeOptions: Array<{ value: Locale; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'ru', label: 'Русский' },
]

function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('relay-locale') as Locale | null
    return saved && localeOptions.some((option) => option.value === saved) ? saved : 'en'
  })
  const [dark, setDark] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(1)
  const [tickets, setTickets] = useState<Ticket[]>(demoTickets)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [actionPending, setActionPending] = useState(false)
  const [triage, setTriage] = useState<{ ticketId: number; result: TriageResult } | null>(null)
  const [triageLoading, setTriageLoading] = useState(false)
  const [triageError, setTriageError] = useState<string | null>(null)
  const [mobilePanel, setMobilePanel] = useState<'queue' | 'context' | null>(null)
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>(defaultWorkspaceSettings)
  const [draftSettings, setDraftSettings] = useState<WorkspaceSettings>(defaultWorkspaceSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [session, setSession] = useState<AuthSession | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('relay-auth-session') ?? 'null') as AuthSession | null } catch { return null }
  })
  const [authChecking, setAuthChecking] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [email, setEmail] = useState(DEMO_AUTH_ENABLED ? 'demo@relay.example' : '')
  const [password, setPassword] = useState(DEMO_AUTH_ENABLED ? 'demo-password' : '')
  const t = { ...copy.en, ...copy[locale] } as Copy
  const user = session?.user
  const canOperate = !user || user.role !== 'viewer'
  const canManageWorkspace = !user || user.role === 'owner' || user.role === 'admin'
  const authHeaders = (json = false): HeadersInit => ({ ...(json ? { 'Content-Type': 'application/json' } : {}), ...(session ? { Authorization: `Bearer ${session.access_token}`, 'X-Workspace-ID': String(session.user.workspace_id) } : DEMO_AUTH_ENABLED ? { 'X-Workspace-ID': '1' } : {}) })
  const authFetch = (input: RequestInfo | URL, init: RequestInit = {}) => fetch(input, { ...init, headers: { ...authHeaders(), ...(init.headers ?? {}) } })
  const filtered = useMemo(() => tickets.filter((ticket) => `${ticket.customer} ${ticket.subject} ${ticket.preview}`.toLowerCase().includes(query.toLowerCase())), [query, tickets])
  const selectedTicket = filtered.find((ticket) => ticket.id === selectedId) ?? null
  const selectedTriage = selectedTicket && triage?.ticketId === selectedTicket.id ? triage.result : null
  const triagePriority = (value: TriageResult['priority']) => locale === 'ru' ? ({ low: 'низкий', normal: 'обычный', high: 'высокий', urgent: 'срочный' }[value]) : value
  const triageStatus = (value: TriageResult['recommended_status']) => locale === 'ru' ? ({ open: 'открыт', in_progress: 'в работе', resolved: 'решён' }[value]) : value
  const uiCopy = {
    language: t.language ?? 'Language',
    theme: t.theme ?? 'Toggle theme',
    noConversations: t.noConversations ?? (locale === 'ru' ? 'Обращения не найдены' : 'No conversations found'),
    tryDifferentSearch: t.tryDifferentSearch ?? (locale === 'ru' ? 'Попробуйте изменить поисковый запрос.' : 'Try a different search.'),
    noConversationSelected: t.noConversationSelected ?? (locale === 'ru' ? 'Обращение не выбрано' : 'No conversation selected'),
    noConversationsAvailable: t.noConversationsAvailable ?? (locale === 'ru' ? 'Нет доступных обращений' : 'No conversations available'),
    adjustSearch: t.adjustSearch ?? (locale === 'ru' ? 'Измените запрос, чтобы продолжить.' : 'Adjust your search to continue.'),
    connectBackend: t.connectBackend ?? (locale === 'ru' ? 'Подключите backend или добавьте обращение, чтобы начать.' : 'Connect the backend or add a conversation to get started.'),
    productionLogo: t.productionLogo ?? 'Production logo preview',
    saving: t.saving ?? 'Saving…',
    viewPolicy: t.viewPolicy ?? 'View policy',
    notAvailable: t.notAvailable ?? 'Not available',
    deliveryUnavailable: t.deliveryUnavailable ?? 'Delivery details not available',
    sendShortcut: t.sendShortcut ?? 'Press ⌘ + Enter to send',
  }
  function handleSignOut() { sessionStorage.removeItem('relay-auth-session'); setSession(null) }
  useEffect(() => {
    const token = session?.access_token
    if (!token) { setAuthChecking(false); return }
    fetch(`${API_BASE_URL}/auth/me`, { headers: authHeaders() })
      .then((response) => response.ok ? response.json() as Promise<AuthUser> : Promise.reject(new Error('Session expired')))
      .then((user) => setSession((current) => current ? { ...current, user } : current))
      .catch(() => { handleSignOut(); setAuthError(true) })
      .finally(() => setAuthChecking(false))
  }, [])
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  useEffect(() => {
    if (!settingsOpen) return
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSettingsOpen(false) }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', handleKeyDown) }
  }, [settingsOpen])
  useEffect(() => { localStorage.setItem('relay-locale', locale); document.documentElement.lang = locale }, [locale])
  useEffect(() => {
    const token = session?.access_token
    if (!token) { setAuthChecking(false); return }
    fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() as Promise<AuthUser> : Promise.reject(new Error('Session expired')))
      .then((currentUser) => setSession((current) => current ? { ...current, user: currentUser } : current))
      .catch(() => { handleSignOut(); setAuthError(true) })
      .finally(() => setAuthChecking(false))
  }, [])
  useEffect(() => {
    let active = true
    const fallback = () => {
      try {
        const saved = localStorage.getItem('relay-workspace-settings')
        if (saved && active) {
          const parsed = { ...defaultWorkspaceSettings, ...JSON.parse(saved) } as WorkspaceSettings
          setWorkspaceSettings(parsed)
          setDraftSettings(parsed)
        }
      } catch { /* localStorage is an optional demo persistence layer. */ }
    }
    fetch(`${API_BASE_URL}/workspaces/settings`, { headers: authHeaders() })
      .then((response) => response.ok ? response.json() as Promise<ApiWorkspaceSettings> : Promise.reject(new Error('Workspace settings request failed')))
      .then((remote) => {
        if (!active) return
        const parsed: WorkspaceSettings = { name: remote.product_name, logoUrl: remote.logo_url || defaultWorkspaceSettings.logoUrl, brandColor: remote.brand_color, secondaryColor: remote.brand_secondary_color }
        setWorkspaceSettings(parsed)
        setDraftSettings(parsed)
        localStorage.setItem('relay-workspace-settings', JSON.stringify(parsed))
        setSettingsError(null)
      })
      .catch(() => { if (active) { fallback(); setSettingsError('fallback') } })
      .finally(() => { if (active) setSettingsLoading(false) })
    return () => { active = false }
  }, [session])
  useEffect(() => {
    document.documentElement.style.setProperty('--workspace-brand', workspaceSettings.brandColor)
    document.documentElement.style.setProperty('--workspace-secondary', workspaceSettings.secondaryColor)
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (favicon) favicon.href = workspaceSettings.logoUrl.trim() || PRODUCTION_LOGO_URL
  }, [workspaceSettings])

  function openSettings() { setDraftSettings(workspaceSettings); setSettingsOpen(true) }
  async function saveSettings() {
    const next = { ...draftSettings, name: draftSettings.name.trim() || defaultWorkspaceSettings.name }
    setWorkspaceSettings(next)
    localStorage.setItem('relay-workspace-settings', JSON.stringify(next))
    setSettingsSaving(true)
    setSettingsError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces/settings`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ product_name: next.name, logo_url: next.logoUrl, brand_color: next.brandColor, brand_secondary_color: next.secondaryColor }) })
      if (!response.ok) throw new Error('Workspace settings save failed')
      const remote = await response.json() as ApiWorkspaceSettings
      const saved: WorkspaceSettings = { name: remote.product_name, logoUrl: remote.logo_url || defaultWorkspaceSettings.logoUrl, brandColor: remote.brand_color, secondaryColor: remote.brand_secondary_color }
      setWorkspaceSettings(saved)
      setDraftSettings(saved)
      localStorage.setItem('relay-workspace-settings', JSON.stringify(saved))
      setSettingsOpen(false)
    } catch { setSettingsError('save') } finally { setSettingsSaving(false) }
  }
  function resetSettings() { setDraftSettings(defaultWorkspaceSettings) }
  useEffect(() => {
    if (filtered.length === 0) { setSelectedId(null); return }
    if (!filtered.some((ticket) => ticket.id === selectedId)) setSelectedId(filtered[0].id)
  }, [filtered, selectedId])
  useEffect(() => {
    const baseUrl = API_BASE_URL
    if (!session && !DEMO_AUTH_ENABLED) return
    Promise.all([
      fetch(`${baseUrl}/tickets`, { headers: authHeaders() }).then((response) => response.ok ? response.json() as Promise<ApiTicket[]> : Promise.reject(new Error('Tickets request failed'))),
      fetch(`${baseUrl}/customers`, { headers: authHeaders() }).then((response) => response.ok ? response.json() as Promise<ApiCustomer[]> : Promise.reject(new Error('Customers request failed'))),
    ]).then(([apiTickets, customers]) => {
      const customerMap = new Map(customers.map((customer) => [customer.id, customer]))
      const mapped = apiTickets.map((ticket) => {
        const customer = customerMap.get(ticket.customer_id)
        const name = customer?.name ?? `Customer #${ticket.customer_id}`
        return { id: ticket.id, customer: name, initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), subject: ticket.subject, preview: ticket.description, customerMessage: ticket.description, agentMessage: 'Thanks for reaching out. I’m reviewing the details and will follow up with the next step.', policy: 'Customer support policy', recommendedAction: 'Review the customer details and choose the appropriate next step.', time: new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: ticket.status === 'in_progress' ? 'pending' : ticket.status === 'resolved' ? 'resolved' : 'open', channel: 'API', order: '—', email: customer?.email ?? '—', total: '—', orderStatus: 'Not available', delivery: 'Delivery details not available', tags: ['api-ticket'] } as Ticket
      })
      if (mapped.length) { setTickets(mapped); setSelectedId(mapped[0].id) }
    }).catch(() => { /* Demo fallback is intentional when the API is unavailable. */ })
  }, [session])

  async function signIn(event: FormEvent) {
    event.preventDefault(); setAuthError(false)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      if (!response.ok) throw new Error('Login failed')
      const next = await response.json() as AuthSession
      sessionStorage.setItem('relay-auth-session', JSON.stringify(next)); setSession(next)
    } catch { setAuthError(true) }
  }
  function signOut() { handleSignOut(); setTickets(demoTickets); setSettingsOpen(false) }

  async function runTriage() {
    if (!selectedTicket || triageLoading || !canOperate) return
    setTriageLoading(true)
    setTriageError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${selectedTicket.id}/triage`, { method: 'POST', headers: authHeaders() })
      if (!response.ok) throw new Error('Triage request failed')
      setTriage({ ticketId: selectedTicket.id, result: await response.json() as TriageResult })
    } catch {
      setTriage(null)
      setTriageError(t.triageUnavailable)
    } finally {
      setTriageLoading(false)
    }
  }

  async function updateTicketStatus(nextStatus: 'in_progress' | 'resolved') {
    if (!selectedTicket || actionPending || !canOperate) return
    setActionPending(true)
    const localStatus: Ticket['status'] = nextStatus === 'resolved' ? 'resolved' : 'pending'
    const updateLocal = () => setTickets((current) => current.map((ticket) => ticket.id === selectedTicket.id ? { ...ticket, status: localStatus } : ticket))
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${selectedTicket.id}/status`, { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ status: nextStatus }) })
      if (!response.ok) throw new Error('Status update failed')
      updateLocal()
    } catch {
      updateLocal()
    } finally {
      setActionPending(false)
    }
  }

  if (authChecking) return <AuthScreen copy={t} loading />
  if (!session) return <AuthScreen copy={t} email={email} password={password} error={authError} onEmail={setEmail} onPassword={setPassword} onSubmit={(event) => void signIn(event)} />

  return <div className="app-shell" data-readonly={!canOperate} style={{ '--workspace-name': `"${workspaceSettings.name}"` } as CSSProperties}>
    <aside className="sidebar">
      <div className="brand"><BrandLogo src={workspaceSettings.logoUrl} name={workspaceSettings.name} /><span>{workspaceSettings.name.split(' ')[0]} <em>{workspaceSettings.name.split(' ').slice(1).join(' ')}</em></span></div>
      <nav className="primary-nav"><NavItem icon={<Inbox />} label={t.inbox} active count="12" /><NavItem icon={<UserRound />} label={t.customers} /><NavItem icon={<CircleHelp />} label={t.knowledge} /><NavItem icon={<LayoutDashboard />} label={t.reports} /></nav>
      <div className="sidebar-bottom">{canManageWorkspace && <NavItem icon={<Settings />} label={t.settings} onClick={openSettings} />}<div className="profile"><span className="avatar small">{user?.email.slice(0, 2).toUpperCase() ?? 'JD'}</span><span><strong>{user?.email ?? 'Jordan Davis'}</strong><small>{user?.role ?? t.operator} · {t.workspace} {user?.workspace_id ?? 1}</small></span><button className="icon-btn" onClick={signOut} aria-label={t.signOut}><LogOut size={17} /></button></div></div>
    </aside>
    <main className="workspace">
      <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobilePanel('queue')} aria-label={t.menu} aria-expanded={mobilePanel === 'queue'}><Menu size={19} /></button><div className="header-brand" aria-label={`${workspaceSettings.name} workspace`}><BrandLogo src={workspaceSettings.logoUrl} name={workspaceSettings.name} /><span><strong>{workspaceSettings.name.split(' ')[0]}</strong><small>{workspaceSettings.name.split(' ').slice(1).join(' ')}</small></span></div><div className="page-heading"><span className="eyebrow">{t.workspace.toUpperCase()} · {user?.role ?? t.operator}</span><h1>{t.inbox}</h1></div><div className="top-actions"><label className="search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} /></label><label className="select-wrap" title={uiCopy.language}><Languages size={16} aria-hidden="true" /><span className="sr-only">{uiCopy.language}</span><select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} aria-label={uiCopy.language}>{localeOptions.map((option) => <option value={option.value} key={option.value}>{option.value.toUpperCase()} · {option.label}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></label><button className="icon-btn" onClick={() => setDark(!dark)} aria-label={uiCopy.theme} aria-pressed={dark}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>{canManageWorkspace && <button className="icon-btn" onClick={openSettings} aria-label={t.settings}><Settings size={18} /></button>}</div></header>
      {mobilePanel && <button className="mobile-scrim" aria-label={t.close} onClick={() => setMobilePanel(null)} />}
      <div className="workspace-grid">
        <section className={`queue panel ${mobilePanel === 'queue' ? 'mobile-open' : ''}`} aria-label={t.queue}><div className="panel-header"><div><h2>{t.all}</h2><p>{filtered.length} {locale === 'ru' ? 'обращений' : 'conversations'}</p></div><div className="panel-header-actions"><button className="icon-btn mobile-close" onClick={() => setMobilePanel(null)} aria-label={t.close}><X size={17} /></button><button className="icon-btn" aria-label={t.more}><MoreHorizontal size={18} /></button></div></div><div className="queue-tabs"><button className="active">{t.assigned}<span>8</span></button><button>{t.open}<span>4</span></button></div><div className="ticket-list">{filtered.length ? filtered.map((ticket) => <button className={`ticket-item ${ticket.id === selectedId ? 'selected' : ''}`} key={ticket.id} onClick={() => { setSelectedId(ticket.id); setSent(false); setTriageError(null); setMobilePanel(null) }}><span className="avatar">{ticket.initials}</span><span className="ticket-main"><span className="ticket-line"><strong>{ticket.customer}</strong><time>{ticket.time}</time></span><span className="subject">{ticket.subject}</span><span className="preview">{ticket.preview}</span><span className={`status ${ticket.status}`}>{ticket.status === 'escalated' ? t.escalated : ticket.status === 'pending' ? t.waiting : ticket.status === 'resolved' ? t.resolved : t.open}</span></span></button>) : <div className="empty-state" role="status"><Search size={18} aria-hidden="true" /><strong>{uiCopy.noConversations}</strong><span>{uiCopy.tryDifferentSearch}</span></div>}</div></section>
        <section className="conversation panel"><div className="conversation-header">{selectedTicket ? <><div className="person"><span className="avatar large">{selectedTicket.initials}</span><div><h2>{selectedTicket.customer}</h2><p>{selectedTicket.email} <span className="dot-separator">·</span> {selectedTicket.channel}</p></div></div><div className="conversation-actions"><button className="button secondary" aria-label={t.status}><Tag size={16} /> {selectedTicket.status === 'escalated' ? t.escalated : selectedTicket.status === 'pending' ? t.waiting : selectedTicket.status === 'resolved' ? t.resolved : t.open} <ChevronDown size={14} /></button><button className="icon-btn" onClick={() => setMobilePanel('context')} aria-label={t.panel} aria-expanded={mobilePanel === 'context'}><PanelRight size={18} /></button></div></> : <div className="empty-conversation"><Search size={20} /><h2>{query ? t.noConversationSelected : t.noConversationsAvailable}</h2><p>{query ? t.adjustSearch : t.connectBackend}</p></div>}</div>{selectedTicket && <><div className="conversation-body"><div className="date-divider"><span>{t.today}, {selectedTicket.time}</span></div><Message initials={selectedTicket.initials} name={selectedTicket.customer} time={selectedTicket.time} text={selectedTicket.customerMessage ?? selectedTicket.preview} /><Message initials="JD" name="Jordan Davis" time={selectedTicket.time} agent text={selectedTicket.agentMessage ?? 'Thanks for reaching out. I’m reviewing the details and will follow up with the next step.'} /><div className="assist-card"><div className="assist-header"><span className="assist-icon"><Bot size={17} /></span><strong>{t.ai}</strong><span className="assist-label">{t.recommended}</span></div><p>{selectedTicket.recommendedAction ?? 'Review the customer details and choose the appropriate next step.'}</p><div className="assist-footer"><span><Check size={14} /> {t.policyMatch} · {selectedTicket.policy ?? 'Customer support policy'}</span><button className="text-button">{t.viewPolicy} <ArrowUpRight size={14} /></button></div></div><div className="triage-card" aria-live="polite"><div className="triage-card-header"><div><span className="assist-icon"><Bot size={17} /></span><strong>{t.triageTitle}</strong></div><button className="button primary" onClick={() => void runTriage()} disabled={triageLoading} aria-label={t.triage}>{triageLoading ? t.triageLoading : t.triage}</button></div>{triageError && <p className="triage-error">{triageError}</p>}{triageLoading && <p className="triage-loading">{t.triageLoading}</p>}{selectedTriage && <div className="triage-result"><div className="triage-badges"><span className={`triage-badge priority-${selectedTriage.priority}`}>{t.triagePriority}: {triagePriority(selectedTriage.priority)}</span><span className="triage-badge">{t.triageStatus}: {triageStatus(selectedTriage.recommended_status)}</span><span className="triage-confidence">{t.triageConfidence}: {Math.round(selectedTriage.confidence * 100)}%</span></div><TriageField label={t.triageSummary} value={selectedTriage.summary} /><TriageField label={t.triageReply} value={selectedTriage.suggested_reply} /><div className="triage-reasoning"><strong>{t.triageReasoning}</strong><ul>{selectedTriage.reasoning.map((reason) => <li key={reason}>{reason}</li>)}</ul></div><button className="text-button" onClick={() => setMessage(selectedTriage.suggested_reply)}>{t.useReply}</button></div>}</div></div><div className="composer"><div className="composer-toolbar"><span className="reply-mode"><span className="mode-dot" /> {t.reply} {selectedTicket.customer} <ChevronDown size={14} /></span><span className="composer-tools"><button className="icon-btn" aria-label={t.attach}><Paperclip size={17} /></button><button className="icon-btn" aria-label={t.more}><MoreHorizontal size={17} /></button></span></div><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.writeReply} aria-label={t.writeReply} /><div className="composer-footer"><span className="hint">{t.sendShortcut}</span><div className="action-buttons"><button className="button secondary" disabled={actionPending} onClick={() => void updateTicketStatus('in_progress')}><Archive size={16} /> {t.escalate}</button><button className="button primary" disabled={actionPending} onClick={() => void updateTicketStatus('resolved')}><Check size={16} /> {t.resolved}</button></div></div>{sent && <div className="sent-message">{t.replySaved}</div>}</div></>}</section>
        <aside className={`context panel ${mobilePanel === 'context' ? 'mobile-open' : ''}`} aria-label={t.contextPanel}><div className="panel-header"><h2>{t.context}</h2><button className="icon-btn" onClick={() => setMobilePanel(null)} aria-label={t.close}><X size={17} /></button></div>{selectedTicket && <><div className="context-profile"><span className="avatar large">{selectedTicket.initials}</span><h3>{selectedTicket.customer}</h3><p>{selectedTicket.email}</p><button className="text-button">{t.viewCustomer} <ArrowUpRight size={14} /></button></div><div className="context-section"><div className="section-heading"><h3>{t.order}</h3><button className="text-button">{t.view} <ArrowUpRight size={13} /></button></div><div className="order-card"><div><strong>{selectedTicket.order}</strong><span className="order-status">{selectedTicket.orderStatus ?? t.notAvailable}</span></div><strong>{selectedTicket.total}</strong><p>{selectedTicket.delivery ?? t.deliveryUnavailable}</p></div></div><div className="context-section"><h3>{t.activity}</h3><div className="timeline"><TimelineItem title={t.shipped} detail="Dec 10 · 09:22" color="success" /><TimelineItem title={t.payment} detail="Dec 08 · 14:06" color="info" /><TimelineItem title={t.placed} detail="Dec 08 · 14:01" color="muted" /></div></div><div className="context-section tags"><h3>{t.tags}</h3>{(selectedTicket.tags ?? []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></>}</aside>
      </div>
    </main>
    {settingsOpen && <WorkspaceSettingsPanel settings={draftSettings} copy={t} loading={settingsLoading} saving={settingsSaving} error={settingsError} onChange={setDraftSettings} onSave={() => void saveSettings()} onReset={resetSettings} onClose={() => setSettingsOpen(false)} />}
  </div>
}

function AuthScreen({ copy, email = '', password = '', error = false, loading = false, onEmail, onPassword, onSubmit }: { copy: Copy; email?: string; password?: string; error?: boolean; loading?: boolean; onEmail?: (value: string) => void; onPassword?: (value: string) => void; onSubmit?: (event: FormEvent<HTMLFormElement>) => void }) {
  return <main className="auth-shell"><section className="auth-card" aria-labelledby="auth-title"><div className="auth-brand"><BrandLogo src={PRODUCTION_LOGO_URL} name="Relay Operations" /><span><strong>Relay</strong><small>Operations</small></span></div><div className="auth-icon"><ShieldCheck size={20} /></div><p className="eyebrow">{copy.workspace}</p><h1 id="auth-title">{copy.login}</h1><p className="auth-subtitle">{copy.secureWorkspace ?? 'Secure workspace access for your operations team.'}</p>{error && <p className="auth-error" role="alert">{copy.invalidLogin}</p>}{loading ? <p className="auth-loading" role="status">{copy.sessionLoading}</p> : <form onSubmit={onSubmit} className="auth-form"><label><span>{copy.email}</span><input type="email" value={email} onChange={(event) => onEmail?.(event.target.value)} autoComplete="email" required /></label><label><span>{copy.password}</span><input type="password" value={password} onChange={(event) => onPassword?.(event.target.value)} autoComplete="current-password" required /></label><button className="button primary auth-submit" type="submit"><KeyRound size={16} /> {copy.signIn}</button></form>}<div className="auth-demo"><strong>{copy.demoCredentials}</strong><span>{DEMO_AUTH_ENABLED ? (copy.demoAuthEnabled ?? 'Demo auth is enabled for local development.') : (copy.demoAuthDisabled ?? 'Demo credentials work only when enabled by the backend.')}</span></div></section></main>
}

function NavItem({ icon, label, active, count, onClick }: { icon: ReactNode; label: string; active?: boolean; count?: string; onClick?: () => void }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{count && <b>{count}</b>}</button> }
function BrandLogo({ src, name }: { src: string; name: string }) {
  return <img className="brand-logo" src={src.trim() || PRODUCTION_LOGO_URL} alt={`${name} logo`} width="32" height="32" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PRODUCTION_LOGO_URL }} />
}
function WorkspaceSettingsPanel({ settings, copy, loading, saving, error, onChange, onSave, onReset, onClose }: { settings: WorkspaceSettings; copy: Copy; loading: boolean; saving: boolean; error: string | null; onChange: (settings: WorkspaceSettings) => void; onSave: () => void; onReset: () => void; onClose: () => void }) {
  const logoLabel = 'logoUrl' in copy ? copy.logoUrl : 'Logo URL'
  const loadingLabel = 'settingsLoading' in copy ? copy.settingsLoading : 'Loading workspace branding…'
  const loadError = 'settingsLoadError' in copy ? copy.settingsLoadError : 'Using local demo branding because the workspace API is unavailable.'
  const saveError = 'settingsSaveError' in copy ? copy.settingsSaveError : 'Could not save to the workspace API. Your changes are kept locally.'
  return <div className="settings-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="workspace-settings-title"><div className="settings-panel-header"><div><span className="eyebrow">WORKSPACE</span><h2 id="workspace-settings-title">{copy.workspaceSettings}</h2></div><button className="icon-btn" onClick={onClose} aria-label={copy.close}><X size={18} /></button></div><div className="settings-panel-body"><div className="settings-logo-preview"><BrandLogo src={settings.logoUrl} name={settings.name || defaultWorkspaceSettings.name} /><span>{copy.productionLogo ?? 'Production logo preview'}</span></div>{loading && <p className="settings-status" aria-live="polite">{loadingLabel}</p>}{error === 'fallback' && <p className="settings-status warning" role="status">{loadError}</p>}{error === 'save' && <p className="settings-status error" role="alert">{saveError}</p>}<label className="settings-field"><span>{copy.workspaceName}</span><input value={settings.name} onChange={(event) => onChange({ ...settings, name: event.target.value })} autoFocus /></label><label className="settings-field"><span>{logoLabel}</span><input value={settings.logoUrl} onChange={(event) => onChange({ ...settings, logoUrl: event.target.value })} placeholder={PRODUCTION_LOGO_URL} /></label><div className="settings-color-row"><label className="settings-field"><span>{copy.brandColor}</span><div className="color-input"><input type="color" value={settings.brandColor} onChange={(event) => onChange({ ...settings, brandColor: event.target.value })} /><code>{settings.brandColor.toUpperCase()}</code></div></label><label className="settings-field"><span>{copy.secondaryColor}</span><div className="color-input"><input type="color" value={settings.secondaryColor} onChange={(event) => onChange({ ...settings, secondaryColor: event.target.value })} /><code>{settings.secondaryColor.toUpperCase()}</code></div></label></div><p className="settings-hint">{copy.settingsHint}</p></div><div className="settings-panel-footer"><button className="button secondary" onClick={onReset}>{copy.resetSettings}</button><button className="button primary" onClick={onSave} disabled={saving || loading}>{saving ? (copy.saving ?? 'Saving…') : copy.saveSettings}</button></div></section></div>
}
function Message({ initials, name, time, text, agent }: { initials: string; name: string; time: string; text: string; agent?: boolean }) { return <div className="message"><span className={`avatar ${agent ? 'agent-avatar' : ''}`}>{initials}</span><div className="message-content"><div className="message-meta"><strong>{name}</strong><time>{time}</time></div><p>{text}</p></div></div> }
function TimelineItem({ title, detail, color }: { title: string; detail: string; color: string }) { return <div className="timeline-item"><span className={`timeline-dot ${color}`} /><div><strong>{title}</strong><small>{detail}</small></div></div> }
function TriageField({ label, value }: { label: string; value: string }) { return <div className="triage-field"><strong>{label}</strong><p>{value}</p></div> }

export default App

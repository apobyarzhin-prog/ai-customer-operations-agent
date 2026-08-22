import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Archive, ArrowUpRight, Bot, Check, ChevronDown, CircleHelp, Clock3, Inbox, Languages, LayoutDashboard, Menu, Moon, MoreHorizontal, Paperclip, PanelRight, Search, Send, Settings, Sun, Tag, UserRound, X } from 'lucide-react'
import relayMark from '../../design/relay-mark.svg'

type Locale = 'en' | 'pl' | 'de' | 'es'
type Ticket = { id: number; customer: string; initials: string; subject: string; preview: string; time: string; status: 'open' | 'pending' | 'escalated' | 'resolved'; channel: string; order: string; email: string; total: string; customerMessage?: string; agentMessage?: string; policy?: string; recommendedAction?: string; orderStatus?: string; delivery?: string; tags?: string[] }
type ApiTicket = { id: number; customer_id: number; subject: string; description: string; status: 'open' | 'in_progress' | 'resolved'; created_at: string }
type ApiCustomer = { id: number; name: string; email: string }
type TriageResult = { priority: 'low' | 'normal' | 'high' | 'urgent'; recommended_status: 'open' | 'in_progress' | 'resolved'; summary: string; suggested_reply: string; confidence: number; reasoning: string[] }
type WorkspaceSettings = { name: string; brandColor: string; secondaryColor: string }
const defaultWorkspaceSettings: WorkspaceSettings = { name: 'Relay Operations', brandColor: '#D97706', secondaryColor: '#0F766E' }

const demoTickets: Ticket[] = [
  { id: 1, customer: 'Maya Chen', initials: 'MC', subject: 'Package arrived damaged', preview: 'Hi, the box was damaged when it arrived and one item is missing.', time: '10:42', status: 'open', channel: 'Email', order: '#10482', email: 'maya.chen@example.com', total: '$129.00', customerMessage: 'Hi, the box was damaged when it arrived and one item is missing.', agentMessage: 'I’m sorry about the condition your package arrived in. I’m checking the order details now and will help get this resolved.', policy: 'Damaged delivery', recommendedAction: 'Offer a replacement for the missing item and waive the reshipping fee.', orderStatus: 'In transit', delivery: 'Expected delivery · Dec 14', tags: ['damaged-delivery', 'priority'] },
  { id: 2, customer: 'Jon Bell', initials: 'JB', subject: 'Where is my order?', preview: 'Could you check if the delivery is still on track?', time: '09:18', status: 'pending', channel: 'Chat', order: '#10476', email: 'jon.bell@example.com', total: '$84.50', customerMessage: 'Could you check if the delivery is still on track?', agentMessage: 'I’ve checked the latest scan and will keep you posted on the delivery window.', policy: 'Delivery status', recommendedAction: 'Share the latest tracking update and set a follow-up reminder.', orderStatus: 'In transit', delivery: 'Expected delivery · Dec 15', tags: ['delivery', 'tracking'] },
  { id: 3, customer: 'Sofia Rossi', initials: 'SR', subject: 'Requesting a return', preview: 'I would like to return the jacket from my last order.', time: 'Yesterday', status: 'escalated', channel: 'Email', order: '#10451', email: 'sofia.rossi@example.com', total: '$210.00', customerMessage: 'I would like to return the jacket from my last order.', agentMessage: 'I can help review the return window and make sure the item is eligible.', policy: 'Returns and refunds', recommendedAction: 'Confirm the return reason and issue a prepaid return label if eligible.', orderStatus: 'Delivered', delivery: 'Delivered · Dec 8', tags: ['return', 'review'] },
  { id: 4, customer: 'Alex Morgan', initials: 'AM', subject: 'Update shipping address', preview: 'I moved and need to update the address before dispatch.', time: 'Yesterday', status: 'open', channel: 'Chat', order: '#10433', email: 'alex.morgan@example.com', total: '$56.00', customerMessage: 'I moved and need to update the address before dispatch.', agentMessage: 'I’ll verify whether the order has entered fulfillment before changing the address.', policy: 'Address changes', recommendedAction: 'Verify fulfillment status, then update the address or escalate to operations.', orderStatus: 'Processing', delivery: 'Expected delivery · Dec 18', tags: ['address-change', 'priority'] },
]

const copy = {
  en: { inbox: 'Inbox', customers: 'Customers', knowledge: 'Knowledge', reports: 'Reports', search: 'Search conversations', assigned: 'Assigned to me', open: 'Open', waiting: 'Waiting', escalated: 'Escalated', conversation: 'Conversation', context: 'Customer context', order: 'Order', activity: 'Activity', recommended: 'Recommended next step', reply: 'Reply to', send: 'Send reply', note: 'Add internal note', resolved: 'Mark as resolved', escalate: 'Escalate', ai: 'Relay Assist', all: 'All conversations', settings: 'Settings', operator: 'Operator', today: 'Today', viewCustomer: 'View customer', view: 'View', tags: 'Tags', writeReply: 'Write a reply...', replySaved: 'Reply saved to the conversation.', policyMatch: 'Policy match', shipped: 'Order shipped', payment: 'Payment captured', placed: 'Order placed', queue: 'Conversation queue', contextPanel: 'Customer context panel', close: 'Close', more: 'More actions', attach: 'Attach file', status: 'Change status', menu: 'Open conversation queue', panel: 'Open customer context', triage: 'Run AI triage', triageTitle: 'AI ticket triage', triageLoading: 'Analyzing ticket…', triageUnavailable: 'AI triage is unavailable. Check that the backend is running.', triagePriority: 'Priority', triageStatus: 'Recommended status', triageSummary: 'Summary', triageReply: 'Suggested reply', triageConfidence: 'Confidence', triageReasoning: 'Why this was suggested', useReply: 'Use suggested reply', workspaceSettings: 'Workspace settings', workspaceName: 'Workspace name', brandColor: 'Brand color', secondaryColor: 'Secondary color', saveSettings: 'Save changes', resetSettings: 'Reset defaults', settingsHint: 'Demo settings are saved in this browser until workspace API is connected.' },
  pl: { inbox: 'Skrzynka', customers: 'Klienci', knowledge: 'Baza wiedzy', reports: 'Raporty', search: 'Szukaj rozmów', assigned: 'Przypisane do mnie', open: 'Otwarte', waiting: 'Oczekujące', escalated: 'Eskalowane', conversation: 'Rozmowa', context: 'Kontekst klienta', order: 'Zamówienie', activity: 'Aktywność', recommended: 'Sugerowany następny krok', reply: 'Odpowiedz', send: 'Wyślij odpowiedź', note: 'Dodaj notatkę', resolved: 'Oznacz jako rozwiązane', escalate: 'Eskaluj', ai: 'Relay Assist', all: 'Wszystkie rozmowy', settings: 'Ustawienia', operator: 'Operator', today: 'Dzisiaj', viewCustomer: 'Zobacz klienta', view: 'Zobacz', tags: 'Tagi', writeReply: 'Napisz odpowiedź...', replySaved: 'Odpowiedź zapisana w rozmowie.', policyMatch: 'Zgodność z zasadą', shipped: 'Zamówienie wysłane', payment: 'Płatność zaksięgowana', placed: 'Zamówienie utworzone', queue: 'Kolejka rozmów', contextPanel: 'Panel kontekstu klienta', close: 'Zamknij', more: 'Więcej działań', attach: 'Dołącz plik', status: 'Zmień status', menu: 'Otwórz kolejkę rozmów', panel: 'Otwórz kontekst klienta', triage: 'Uruchom triage AI', triageTitle: 'Triage AI zgłoszenia', triageLoading: 'Analizowanie zgłoszenia…', triageUnavailable: 'Triage AI jest niedostępny. Sprawdź, czy backend działa.', triagePriority: 'Priorytet', triageStatus: 'Sugerowany status', triageSummary: 'Podsumowanie', triageReply: 'Sugerowana odpowiedź', triageConfidence: 'Pewność', triageReasoning: 'Dlaczego ta sugestia', useReply: 'Użyj sugerowanej odpowiedzi', workspaceSettings: 'Ustawienia przestrzeni', workspaceName: 'Nazwa przestrzeni', brandColor: 'Kolor marki', secondaryColor: 'Kolor dodatkowy', saveSettings: 'Zapisz zmiany', resetSettings: 'Przywróć domyślne', settingsHint: 'Ustawienia demo są zapisane w tej przeglądarce do czasu podłączenia API.' },
  de: { inbox: 'Posteingang', customers: 'Kunden', knowledge: 'Wissensbasis', reports: 'Berichte', search: 'Gespräche suchen', assigned: 'Mir zugewiesen', open: 'Offen', waiting: 'Wartend', escalated: 'Eskaliert', conversation: 'Gespräch', context: 'Kundenkontext', order: 'Bestellung', activity: 'Aktivität', recommended: 'Empfohlener nächster Schritt', reply: 'Antworten an', send: 'Antwort senden', note: 'Interne Notiz', resolved: 'Als gelöst markieren', escalate: 'Eskalieren', ai: 'Relay Assist', all: 'Alle Gespräche', settings: 'Einstellungen', operator: 'Operator', today: 'Heute', viewCustomer: 'Kunden ansehen', view: 'Ansehen', tags: 'Tags', writeReply: 'Antwort schreiben...', replySaved: 'Antwort in der Unterhaltung gespeichert.', policyMatch: 'Richtlinienübereinstimmung', shipped: 'Bestellung versendet', payment: 'Zahlung erfasst', placed: 'Bestellung aufgegeben', queue: 'Gesprächswarteschlange', contextPanel: 'Kundenkontext', close: 'Schließen', more: 'Weitere Aktionen', attach: 'Datei anhängen', status: 'Status ändern', menu: 'Gesprächswarteschlange öffnen', panel: 'Kundenkontext öffnen', triage: 'KI-Triage starten', triageTitle: 'KI-Ticket-Triage', triageLoading: 'Ticket wird analysiert…', triageUnavailable: 'KI-Triage ist nicht verfügbar. Prüfe, ob das Backend läuft.', triagePriority: 'Priorität', triageStatus: 'Empfohlener Status', triageSummary: 'Zusammenfassung', triageReply: 'Vorgeschlagene Antwort', triageConfidence: 'Konfidenz', triageReasoning: 'Warum diese Empfehlung', useReply: 'Vorgeschlagene Antwort verwenden', workspaceSettings: 'Workspace-Einstellungen', workspaceName: 'Workspace-Name', brandColor: 'Markenfarbe', secondaryColor: 'Sekundärfarbe', saveSettings: 'Änderungen speichern', resetSettings: 'Standardwerte zurücksetzen', settingsHint: 'Demo-Einstellungen werden in diesem Browser gespeichert, bis die Workspace-API verbunden ist.' },
  es: { inbox: 'Bandeja', customers: 'Clientes', knowledge: 'Base de conocimiento', reports: 'Informes', search: 'Buscar conversaciones', assigned: 'Asignadas a mí', open: 'Abiertas', waiting: 'En espera', escalated: 'Escaladas', conversation: 'Conversación', context: 'Contexto del cliente', order: 'Pedido', activity: 'Actividad', recommended: 'Siguiente paso recomendado', reply: 'Responder a', send: 'Enviar respuesta', note: 'Añadir nota interna', resolved: 'Marcar como resuelto', escalate: 'Escalar', ai: 'Relay Assist', all: 'Todas las conversaciones', settings: 'Configuración', operator: 'Operador', today: 'Hoy', viewCustomer: 'Ver cliente', view: 'Ver', tags: 'Etiquetas', writeReply: 'Escribe una respuesta...', replySaved: 'Respuesta guardada en la conversación.', policyMatch: 'Coincidencia de política', shipped: 'Pedido enviado', payment: 'Pago capturado', placed: 'Pedido realizado', queue: 'Cola de conversaciones', contextPanel: 'Panel de contexto del cliente', close: 'Cerrar', more: 'Más acciones', attach: 'Adjuntar archivo', status: 'Cambiar estado', menu: 'Abrir cola de conversaciones', panel: 'Abrir contexto del cliente', triage: 'Ejecutar triage de IA', triageTitle: 'Triage de ticket con IA', triageLoading: 'Analizando ticket…', triageUnavailable: 'El triage de IA no está disponible. Comprueba que el backend esté activo.', triagePriority: 'Prioridad', triageStatus: 'Estado recomendado', triageSummary: 'Resumen', triageReply: 'Respuesta sugerida', triageConfidence: 'Confianza', triageReasoning: 'Por qué se sugiere', useReply: 'Usar respuesta sugerida', workspaceSettings: 'Configuración del workspace', workspaceName: 'Nombre del workspace', brandColor: 'Color de marca', secondaryColor: 'Color secundario', saveSettings: 'Guardar cambios', resetSettings: 'Restablecer valores', settingsHint: 'La configuración demo se guarda en este navegador hasta conectar la API del workspace.' },
}
type Copy = typeof copy.en

function App() {
  const [locale, setLocale] = useState<Locale>('en')
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
  const t = copy[locale]
  const filtered = useMemo(() => tickets.filter((ticket) => `${ticket.customer} ${ticket.subject} ${ticket.preview}`.toLowerCase().includes(query.toLowerCase())), [query, tickets])
  const selectedTicket = filtered.find((ticket) => ticket.id === selectedId) ?? null
  const selectedTriage = selectedTicket && triage?.ticketId === selectedTicket.id ? triage.result : null
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  useEffect(() => {
    try {
      const saved = localStorage.getItem('relay-workspace-settings')
      if (saved) {
        const parsed = { ...defaultWorkspaceSettings, ...JSON.parse(saved) } as WorkspaceSettings
        setWorkspaceSettings(parsed)
        setDraftSettings(parsed)
      }
    } catch { /* localStorage is an optional demo persistence layer. */ }
  }, [])
  useEffect(() => {
    document.documentElement.style.setProperty('--workspace-brand', workspaceSettings.brandColor)
    document.documentElement.style.setProperty('--workspace-secondary', workspaceSettings.secondaryColor)
  }, [workspaceSettings])

  function openSettings() { setDraftSettings(workspaceSettings); setSettingsOpen(true) }
  function saveSettings() {
    const next = { ...draftSettings, name: draftSettings.name.trim() || defaultWorkspaceSettings.name }
    setWorkspaceSettings(next)
    localStorage.setItem('relay-workspace-settings', JSON.stringify(next))
    setSettingsOpen(false)
  }
  function resetSettings() { setDraftSettings(defaultWorkspaceSettings) }
  useEffect(() => {
    if (filtered.length === 0) { setSelectedId(null); return }
    if (!filtered.some((ticket) => ticket.id === selectedId)) setSelectedId(filtered[0].id)
  }, [filtered, selectedId])
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    if (!baseUrl) return
    Promise.all([
      fetch(`${baseUrl}/tickets`).then((response) => response.ok ? response.json() as Promise<ApiTicket[]> : Promise.reject(new Error('Tickets request failed'))),
      fetch(`${baseUrl}/customers`).then((response) => response.ok ? response.json() as Promise<ApiCustomer[]> : Promise.reject(new Error('Customers request failed'))),
    ]).then(([apiTickets, customers]) => {
      const customerMap = new Map(customers.map((customer) => [customer.id, customer]))
      const mapped = apiTickets.map((ticket) => {
        const customer = customerMap.get(ticket.customer_id)
        const name = customer?.name ?? `Customer #${ticket.customer_id}`
        return { id: ticket.id, customer: name, initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), subject: ticket.subject, preview: ticket.description, customerMessage: ticket.description, agentMessage: 'Thanks for reaching out. I’m reviewing the details and will follow up with the next step.', policy: 'Customer support policy', recommendedAction: 'Review the customer details and choose the appropriate next step.', time: new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: ticket.status === 'in_progress' ? 'pending' : ticket.status === 'resolved' ? 'resolved' : 'open', channel: 'API', order: '—', email: customer?.email ?? '—', total: '—', orderStatus: 'Not available', delivery: 'Delivery details not available', tags: ['api-ticket'] } as Ticket
      })
      if (mapped.length) { setTickets(mapped); setSelectedId(mapped[0].id) }
    }).catch(() => { /* Demo fallback is intentional when the API is unavailable. */ })
  }, [])

  async function runTriage() {
    if (!selectedTicket || triageLoading) return
    setTriageLoading(true)
    setTriageError(null)
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL
      if (!baseUrl) throw new Error('API base URL is not configured')
      const response = await fetch(`${baseUrl}/tickets/${selectedTicket.id}/triage`, { method: 'POST', headers: { 'X-Workspace-ID': '1' } })
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
    if (!selectedTicket || actionPending) return
    setActionPending(true)
    const localStatus: Ticket['status'] = nextStatus === 'resolved' ? 'resolved' : 'pending'
    const updateLocal = () => setTickets((current) => current.map((ticket) => ticket.id === selectedTicket.id ? { ...ticket, status: localStatus } : ticket))
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL
      if (!baseUrl) throw new Error('API base URL is not configured')
      const response = await fetch(`${baseUrl}/tickets/${selectedTicket.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-Workspace-ID': '1' }, body: JSON.stringify({ status: nextStatus }) })
      if (!response.ok) throw new Error('Status update failed')
      updateLocal()
    } catch {
      updateLocal()
    } finally {
      setActionPending(false)
    }
  }

  return <div className="app-shell" style={{ '--workspace-name': `"${workspaceSettings.name}"` } as CSSProperties}>
    <aside className="sidebar">
      <div className="brand"><img src={relayMark} alt={`${workspaceSettings.name} logo`} /><span>{workspaceSettings.name.split(' ')[0]} <em>{workspaceSettings.name.split(' ').slice(1).join(' ')}</em></span></div>
      <nav className="primary-nav"><NavItem icon={<Inbox />} label={t.inbox} active count="12" /><NavItem icon={<UserRound />} label={t.customers} /><NavItem icon={<CircleHelp />} label={t.knowledge} /><NavItem icon={<LayoutDashboard />} label={t.reports} /></nav>
      <div className="sidebar-bottom"><NavItem icon={<Settings />} label={t.settings} onClick={openSettings} /><div className="profile"><span className="avatar small">JD</span><span><strong>Jordan Davis</strong><small>{t.operator}</small></span><button className="icon-btn" aria-label={t.more}><MoreHorizontal size={17} /></button></div></div>
    </aside>
    <main className="workspace">
      <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobilePanel('queue')} aria-label={t.menu} aria-expanded={mobilePanel === 'queue'}><Menu size={19} /></button><div className="header-brand" aria-label={`${workspaceSettings.name} workspace`}><img src={relayMark} alt={`${workspaceSettings.name} logo`} /><span><strong>{workspaceSettings.name.split(' ')[0]}</strong><small>{workspaceSettings.name.split(' ').slice(1).join(' ')}</small></span></div><div className="page-heading"><span className="eyebrow">WORKSPACE</span><h1>{t.inbox}</h1></div><div className="top-actions"><label className="search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} /></label><div className="select-wrap"><Languages size={16} /><select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} aria-label="Language"><option value="en">EN</option><option value="pl">PL</option><option value="de">DE</option><option value="es">ES</option></select><ChevronDown size={14} /></div><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="icon-btn" onClick={openSettings} aria-label={t.settings}><Settings size={18} /></button></div></header>
      <div className="workspace-grid">
        <section className={`queue panel ${mobilePanel === 'queue' ? 'mobile-open' : ''}`} aria-label={t.queue}><div className="panel-header"><div><h2>{t.all}</h2><p>{filtered.length} conversations</p></div><div className="panel-header-actions"><button className="icon-btn mobile-close" onClick={() => setMobilePanel(null)} aria-label={t.close}><X size={17} /></button><button className="icon-btn" aria-label={t.more}><MoreHorizontal size={18} /></button></div></div><div className="queue-tabs"><button className="active">{t.assigned}<span>8</span></button><button>{t.open}<span>4</span></button></div><div className="ticket-list">{filtered.length ? filtered.map((ticket) => <button className={`ticket-item ${ticket.id === selectedId ? 'selected' : ''}`} key={ticket.id} onClick={() => { setSelectedId(ticket.id); setSent(false); setTriageError(null); setMobilePanel(null) }}><span className="avatar">{ticket.initials}</span><span className="ticket-main"><span className="ticket-line"><strong>{ticket.customer}</strong><time>{ticket.time}</time></span><span className="subject">{ticket.subject}</span><span className="preview">{ticket.preview}</span><span className={`status ${ticket.status}`}>{ticket.status === 'escalated' ? t.escalated : ticket.status === 'pending' ? t.waiting : ticket.status === 'resolved' ? t.resolved : t.open}</span></span></button>) : <div className="empty-state"><Search size={18} /><strong>No conversations found</strong><span>Try a different search.</span></div>}</div></section>
        <section className="conversation panel"><div className="conversation-header">{selectedTicket ? <><div className="person"><span className="avatar large">{selectedTicket.initials}</span><div><h2>{selectedTicket.customer}</h2><p>{selectedTicket.email} <span className="dot-separator">·</span> {selectedTicket.channel}</p></div></div><div className="conversation-actions"><button className="button secondary" aria-label={t.status}><Tag size={16} /> {selectedTicket.status === 'escalated' ? t.escalated : selectedTicket.status === 'pending' ? t.waiting : selectedTicket.status === 'resolved' ? t.resolved : t.open} <ChevronDown size={14} /></button><button className="icon-btn" onClick={() => setMobilePanel('context')} aria-label={t.panel} aria-expanded={mobilePanel === 'context'}><PanelRight size={18} /></button></div></> : <div className="empty-conversation"><Search size={20} /><h2>{query ? 'No conversation selected' : 'No conversations available'}</h2><p>{query ? 'Adjust your search to continue.' : 'Connect the backend or add a conversation to get started.'}</p></div>}</div>{selectedTicket && <><div className="conversation-body"><div className="date-divider"><span>{t.today}, {selectedTicket.time}</span></div><Message initials={selectedTicket.initials} name={selectedTicket.customer} time={selectedTicket.time} text={selectedTicket.customerMessage ?? selectedTicket.preview} /><Message initials="JD" name="Jordan Davis" time={selectedTicket.time} agent text={selectedTicket.agentMessage ?? 'Thanks for reaching out. I’m reviewing the details and will follow up with the next step.'} /><div className="assist-card"><div className="assist-header"><span className="assist-icon"><Bot size={17} /></span><strong>{t.ai}</strong><span className="assist-label">{t.recommended}</span></div><p>{selectedTicket.recommendedAction ?? 'Review the customer details and choose the appropriate next step.'}</p><div className="assist-footer"><span><Check size={14} /> {t.policyMatch} · {selectedTicket.policy ?? 'Customer support policy'}</span><button className="text-button">View policy <ArrowUpRight size={14} /></button></div></div><div className="triage-card" aria-live="polite"><div className="triage-card-header"><div><span className="assist-icon"><Bot size={17} /></span><strong>{t.triageTitle}</strong></div><button className="button primary" onClick={() => void runTriage()} disabled={triageLoading} aria-label={t.triage}>{triageLoading ? t.triageLoading : t.triage}</button></div>{triageError && <p className="triage-error">{triageError}</p>}{triageLoading && <p className="triage-loading">{t.triageLoading}</p>}{selectedTriage && <div className="triage-result"><div className="triage-badges"><span className={`triage-badge priority-${selectedTriage.priority}`}>{t.triagePriority}: {selectedTriage.priority}</span><span className="triage-badge">{t.triageStatus}: {selectedTriage.recommended_status}</span><span className="triage-confidence">{t.triageConfidence}: {Math.round(selectedTriage.confidence * 100)}%</span></div><TriageField label={t.triageSummary} value={selectedTriage.summary} /><TriageField label={t.triageReply} value={selectedTriage.suggested_reply} /><div className="triage-reasoning"><strong>{t.triageReasoning}</strong><ul>{selectedTriage.reasoning.map((reason) => <li key={reason}>{reason}</li>)}</ul></div><button className="text-button" onClick={() => setMessage(selectedTriage.suggested_reply)}>{t.useReply}</button></div>}</div></div><div className="composer"><div className="composer-toolbar"><span className="reply-mode"><span className="mode-dot" /> {t.reply} {selectedTicket.customer} <ChevronDown size={14} /></span><span className="composer-tools"><button className="icon-btn" aria-label={t.attach}><Paperclip size={17} /></button><button className="icon-btn" aria-label={t.more}><MoreHorizontal size={17} /></button></span></div><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.writeReply} aria-label={t.writeReply} /><div className="composer-footer"><span className="hint">Press ⌘ + Enter to send</span><div className="action-buttons"><button className="button secondary" disabled={actionPending} onClick={() => void updateTicketStatus('in_progress')}><Archive size={16} /> {t.escalate}</button><button className="button primary" disabled={actionPending} onClick={() => void updateTicketStatus('resolved')}><Check size={16} /> {t.resolved}</button></div></div>{sent && <div className="sent-message">{t.replySaved}</div>}</div></>}</section>
        <aside className={`context panel ${mobilePanel === 'context' ? 'mobile-open' : ''}`} aria-label={t.contextPanel}><div className="panel-header"><h2>{t.context}</h2><button className="icon-btn" onClick={() => setMobilePanel(null)} aria-label={t.close}><X size={17} /></button></div>{selectedTicket && <><div className="context-profile"><span className="avatar large">{selectedTicket.initials}</span><h3>{selectedTicket.customer}</h3><p>{selectedTicket.email}</p><button className="text-button">{t.viewCustomer} <ArrowUpRight size={14} /></button></div><div className="context-section"><div className="section-heading"><h3>{t.order}</h3><button className="text-button">{t.view} <ArrowUpRight size={13} /></button></div><div className="order-card"><div><strong>{selectedTicket.order}</strong><span className="order-status">{selectedTicket.orderStatus ?? 'Not available'}</span></div><strong>{selectedTicket.total}</strong><p>{selectedTicket.delivery ?? 'Delivery details not available'}</p></div></div><div className="context-section"><h3>{t.activity}</h3><div className="timeline"><TimelineItem title={t.shipped} detail="Dec 10 · 09:22" color="success" /><TimelineItem title={t.payment} detail="Dec 08 · 14:06" color="info" /><TimelineItem title={t.placed} detail="Dec 08 · 14:01" color="muted" /></div></div><div className="context-section tags"><h3>{t.tags}</h3>{(selectedTicket.tags ?? []).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></>}</aside>
      </div>
    </main>
    {settingsOpen && <WorkspaceSettingsPanel settings={draftSettings} copy={t} onChange={setDraftSettings} onSave={saveSettings} onReset={resetSettings} onClose={() => setSettingsOpen(false)} />}
  </div>
}

function NavItem({ icon, label, active, count, onClick }: { icon: ReactNode; label: string; active?: boolean; count?: string; onClick?: () => void }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{count && <b>{count}</b>}</button> }
function WorkspaceSettingsPanel({ settings, copy, onChange, onSave, onReset, onClose }: { settings: WorkspaceSettings; copy: Copy; onChange: (settings: WorkspaceSettings) => void; onSave: () => void; onReset: () => void; onClose: () => void }) {
  return <div className="settings-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="workspace-settings-title"><div className="settings-panel-header"><div><span className="eyebrow">WORKSPACE</span><h2 id="workspace-settings-title">{copy.workspaceSettings}</h2></div><button className="icon-btn" onClick={onClose} aria-label={copy.close}><X size={18} /></button></div><div className="settings-panel-body"><label className="settings-field"><span>{copy.workspaceName}</span><input value={settings.name} onChange={(event) => onChange({ ...settings, name: event.target.value })} autoFocus /></label><div className="settings-color-row"><label className="settings-field"><span>{copy.brandColor}</span><div className="color-input"><input type="color" value={settings.brandColor} onChange={(event) => onChange({ ...settings, brandColor: event.target.value })} /><code>{settings.brandColor.toUpperCase()}</code></div></label><label className="settings-field"><span>{copy.secondaryColor}</span><div className="color-input"><input type="color" value={settings.secondaryColor} onChange={(event) => onChange({ ...settings, secondaryColor: event.target.value })} /><code>{settings.secondaryColor.toUpperCase()}</code></div></label></div><p className="settings-hint">{copy.settingsHint}</p></div><div className="settings-panel-footer"><button className="button secondary" onClick={onReset}>{copy.resetSettings}</button><button className="button primary" onClick={onSave}>{copy.saveSettings}</button></div></section></div>
}
function Message({ initials, name, time, text, agent }: { initials: string; name: string; time: string; text: string; agent?: boolean }) { return <div className="message"><span className={`avatar ${agent ? 'agent-avatar' : ''}`}>{initials}</span><div className="message-content"><div className="message-meta"><strong>{name}</strong><time>{time}</time></div><p>{text}</p></div></div> }
function TimelineItem({ title, detail, color }: { title: string; detail: string; color: string }) { return <div className="timeline-item"><span className={`timeline-dot ${color}`} /><div><strong>{title}</strong><small>{detail}</small></div></div> }
function TriageField({ label, value }: { label: string; value: string }) { return <div className="triage-field"><strong>{label}</strong><p>{value}</p></div> }

export default App

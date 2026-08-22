import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Archive, ArrowUpRight, Bot, Check, ChevronDown, CircleHelp, Clock3, Inbox, Languages, LayoutDashboard, Menu, Moon, MoreHorizontal, Paperclip, PanelRight, Search, Send, Settings, Sun, Tag, UserRound, X } from 'lucide-react'
import relayMark from '../../design/relay-mark.svg'

type Locale = 'en' | 'pl' | 'de' | 'es'
type Ticket = { id: number; customer: string; initials: string; subject: string; preview: string; time: string; status: 'open' | 'pending' | 'escalated' | 'resolved'; channel: string; order: string; email: string; total: string }
type ApiTicket = { id: number; customer_id: number; subject: string; description: string; status: 'open' | 'in_progress' | 'resolved'; created_at: string }
type ApiCustomer = { id: number; name: string; email: string }

const demoTickets: Ticket[] = [
  { id: 1, customer: 'Maya Chen', initials: 'MC', subject: 'Package arrived damaged', preview: 'Hi, the box was damaged when it arrived and one item is missing.', time: '10:42', status: 'open', channel: 'Email', order: '#10482', email: 'maya.chen@example.com', total: '$129.00' },
  { id: 2, customer: 'Jon Bell', initials: 'JB', subject: 'Where is my order?', preview: 'Could you check if the delivery is still on track?', time: '09:18', status: 'pending', channel: 'Chat', order: '#10476', email: 'jon.bell@example.com', total: '$84.50' },
  { id: 3, customer: 'Sofia Rossi', initials: 'SR', subject: 'Requesting a return', preview: 'I would like to return the jacket from my last order.', time: 'Yesterday', status: 'escalated', channel: 'Email', order: '#10451', email: 'sofia.rossi@example.com', total: '$210.00' },
  { id: 4, customer: 'Alex Morgan', initials: 'AM', subject: 'Update shipping address', preview: 'I moved and need to update the address before dispatch.', time: 'Yesterday', status: 'open', channel: 'Chat', order: '#10433', email: 'alex.morgan@example.com', total: '$56.00' },
]

const copy = {
  en: { inbox: 'Inbox', customers: 'Customers', knowledge: 'Knowledge', reports: 'Reports', search: 'Search conversations', assigned: 'Assigned to me', open: 'Open', waiting: 'Waiting', escalated: 'Escalated', conversation: 'Conversation', context: 'Customer context', order: 'Order', activity: 'Activity', recommended: 'Recommended next step', reply: 'Reply to Maya', send: 'Send reply', note: 'Add internal note', resolved: 'Mark as resolved', escalate: 'Escalate', ai: 'Relay Assist', all: 'All conversations' },
  pl: { inbox: 'Skrzynka', customers: 'Klienci', knowledge: 'Baza wiedzy', reports: 'Raporty', search: 'Szukaj rozmów', assigned: 'Przypisane do mnie', open: 'Otwarte', waiting: 'Oczekujące', escalated: 'Eskalowane', conversation: 'Rozmowa', context: 'Kontekst klienta', order: 'Zamówienie', activity: 'Aktywność', recommended: 'Sugerowany następny krok', reply: 'Odpowiedz Mayi', send: 'Wyślij odpowiedź', note: 'Dodaj notatkę', resolved: 'Oznacz jako rozwiązane', escalate: 'Eskaluj', ai: 'Relay Assist', all: 'Wszystkie rozmowy' },
  de: { inbox: 'Posteingang', customers: 'Kunden', knowledge: 'Wissensbasis', reports: 'Berichte', search: 'Gespräche suchen', assigned: 'Mir zugewiesen', open: 'Offen', waiting: 'Wartend', escalated: 'Eskaliert', conversation: 'Gespräch', context: 'Kundenkontext', order: 'Bestellung', activity: 'Aktivität', recommended: 'Empfohlener nächster Schritt', reply: 'Maya antworten', send: 'Antwort senden', note: 'Interne Notiz', resolved: 'Als gelöst markieren', escalate: 'Eskalieren', ai: 'Relay Assist', all: 'Alle Gespräche' },
  es: { inbox: 'Bandeja', customers: 'Clientes', knowledge: 'Base de conocimiento', reports: 'Informes', search: 'Buscar conversaciones', assigned: 'Asignadas a mí', open: 'Abiertas', waiting: 'En espera', escalated: 'Escaladas', conversation: 'Conversación', context: 'Contexto del cliente', order: 'Pedido', activity: 'Actividad', recommended: 'Siguiente paso recomendado', reply: 'Responder a Maya', send: 'Enviar respuesta', note: 'Añadir nota interna', resolved: 'Marcar como resuelto', escalate: 'Escalar', ai: 'Relay Assist', all: 'Todas las conversaciones' },
}

function App() {
  const [locale, setLocale] = useState<Locale>('en')
  const [dark, setDark] = useState(false)
  const [selectedId, setSelectedId] = useState(1)
  const [tickets, setTickets] = useState<Ticket[]>(demoTickets)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [actionPending, setActionPending] = useState(false)
  const t = copy[locale]
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0]
  const filtered = useMemo(() => tickets.filter((ticket) => `${ticket.customer} ${ticket.subject} ${ticket.preview}`.toLowerCase().includes(query.toLowerCase())), [query, tickets])
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
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
        return { id: ticket.id, customer: name, initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), subject: ticket.subject, preview: ticket.description, time: new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: ticket.status === 'in_progress' ? 'pending' : ticket.status === 'resolved' ? 'resolved' : 'open', channel: 'API', order: '—', email: customer?.email ?? '—', total: '—' } as Ticket
      })
      if (mapped.length) { setTickets(mapped); setSelectedId(mapped[0].id) }
    }).catch(() => { /* Demo fallback is intentional when the API is unavailable. */ })
  }, [])

  async function updateTicketStatus(nextStatus: 'in_progress' | 'resolved') {
    if (!selectedTicket || actionPending) return
    setActionPending(true)
    const localStatus: Ticket['status'] = nextStatus === 'resolved' ? 'resolved' : 'pending'
    const updateLocal = () => setTickets((current) => current.map((ticket) => ticket.id === selectedTicket.id ? { ...ticket, status: localStatus } : ticket))
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL
      if (!baseUrl) throw new Error('API base URL is not configured')
      const response = await fetch(`${baseUrl}/tickets/${selectedTicket.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) })
      if (!response.ok) throw new Error('Status update failed')
      updateLocal()
    } catch {
      updateLocal()
    } finally {
      setActionPending(false)
    }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><img src={relayMark} alt="Relay" /><span>Relay <em>Operations</em></span></div>
      <nav className="primary-nav"><NavItem icon={<Inbox />} label={t.inbox} active count="12" /><NavItem icon={<UserRound />} label={t.customers} /><NavItem icon={<CircleHelp />} label={t.knowledge} /><NavItem icon={<LayoutDashboard />} label={t.reports} /></nav>
      <div className="sidebar-bottom"><NavItem icon={<Settings />} label="Settings" /><div className="profile"><span className="avatar small">JD</span><span><strong>Jordan Davis</strong><small>Operator</small></span><MoreHorizontal size={17} /></div></div>
    </aside>
    <main className="workspace">
      <header className="topbar"><button className="mobile-menu icon-btn"><Menu size={19} /></button><div className="page-heading"><span className="eyebrow">WORKSPACE</span><h1>{t.inbox}</h1></div><div className="top-actions"><label className="search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} /></label><div className="select-wrap"><Languages size={16} /><select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} aria-label="Language"><option value="en">EN</option><option value="pl">PL</option><option value="de">DE</option><option value="es">ES</option></select><ChevronDown size={14} /></div><button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button></div></header>
      <div className="workspace-grid">
        <section className="queue panel"><div className="panel-header"><div><h2>{t.all}</h2><p>12 conversations</p></div><button className="icon-btn"><MoreHorizontal size={18} /></button></div><div className="queue-tabs"><button className="active">{t.assigned}<span>8</span></button><button>{t.open}<span>4</span></button></div><div className="ticket-list">{filtered.map((ticket) => <button className={`ticket-item ${ticket.id === selectedId ? 'selected' : ''}`} key={ticket.id} onClick={() => { setSelectedId(ticket.id); setSent(false) }}><span className="avatar">{ticket.initials}</span><span className="ticket-main"><span className="ticket-line"><strong>{ticket.customer}</strong><time>{ticket.time}</time></span><span className="subject">{ticket.subject}</span><span className="preview">{ticket.preview}</span><span className={`status ${ticket.status}`}>{ticket.status === 'escalated' ? t.escalated : ticket.status === 'pending' ? t.waiting : ticket.status === 'resolved' ? t.resolved : t.open}</span></span></button>)}</div></section>
        <section className="conversation panel"><div className="conversation-header"><div className="person"><span className="avatar large">{selectedTicket.initials}</span><div><h2>{selectedTicket.customer}</h2><p>{selectedTicket.email} <span className="dot-separator">·</span> {selectedTicket.channel}</p></div></div><div className="conversation-actions"><button className="button secondary"><Tag size={16} /> {selectedTicket.status === 'escalated' ? t.escalated : 'Open'} <ChevronDown size={14} /></button><button className="icon-btn"><PanelRight size={18} /></button></div></div><div className="conversation-body"><div className="date-divider"><span>Today, 10:38</span></div><Message initials={selectedTicket.initials} name={selectedTicket.customer} time="10:38" text={selectedTicket.preview} /><Message initials="JD" name="Jordan Davis" time="10:40" agent text="I’m sorry about the condition your package arrived in. I’m checking the order details now and will help get this resolved." /><div className="assist-card"><div className="assist-header"><span className="assist-icon"><Bot size={17} /></span><strong>{t.ai}</strong><span className="assist-label">{t.recommended}</span></div><p>Offer a replacement for the missing item and waive the reshipping fee. This matches the damaged-delivery policy.</p><div className="assist-footer"><span><Check size={14} /> Policy match · Damaged delivery</span><button className="text-button">View policy <ArrowUpRight size={14} /></button></div></div></div><div className="composer"><div className="composer-toolbar"><span className="reply-mode"><span className="mode-dot" /> {t.reply} <ChevronDown size={14} /></span><span className="composer-tools"><button className="icon-btn"><Paperclip size={17} /></button><button className="icon-btn"><MoreHorizontal size={17} /></button></span></div><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a reply..." /><div className="composer-footer"><span className="hint">Press ⌘ + Enter to send</span><div className="action-buttons"><button className="button secondary" disabled={actionPending} onClick={() => void updateTicketStatus('in_progress')}><Archive size={16} /> {t.escalate}</button><button className="button primary" disabled={actionPending} onClick={() => void updateTicketStatus('resolved')}><Check size={16} /> {t.resolved}</button></div></div>{sent && <div className="sent-message">Reply saved to the conversation.</div>}</div></section>
        <aside className="context panel"><div className="panel-header"><h2>{t.context}</h2><button className="icon-btn"><X size={17} /></button></div><div className="context-profile"><span className="avatar large">{selectedTicket.initials}</span><h3>{selectedTicket.customer}</h3><p>{selectedTicket.email}</p><button className="text-button">View customer <ArrowUpRight size={14} /></button></div><div className="context-section"><div className="section-heading"><h3>{t.order}</h3><button className="text-button">View <ArrowUpRight size={13} /></button></div><div className="order-card"><div><strong>{selectedTicket.order}</strong><span className="order-status">In transit</span></div><strong>{selectedTicket.total}</strong><p>Expected delivery · Dec 14</p></div></div><div className="context-section"><h3>{t.activity}</h3><div className="timeline"><TimelineItem title="Order shipped" detail="Dec 10 · 09:22" color="success" /><TimelineItem title="Payment captured" detail="Dec 08 · 14:06" color="info" /><TimelineItem title="Order placed" detail="Dec 08 · 14:01" color="muted" /></div></div><div className="context-section tags"><h3>Tags</h3><span className="tag">damaged-delivery</span><span className="tag">priority</span></div></aside>
      </div>
    </main>
  </div>
}

function NavItem({ icon, label, active, count }: { icon: ReactNode; label: string; active?: boolean; count?: string }) { return <button className={`nav-item ${active ? 'active' : ''}`}>{icon}<span>{label}</span>{count && <b>{count}</b>}</button> }
function Message({ initials, name, time, text, agent }: { initials: string; name: string; time: string; text: string; agent?: boolean }) { return <div className="message"><span className={`avatar ${agent ? 'agent-avatar' : ''}`}>{initials}</span><div className="message-content"><div className="message-meta"><strong>{name}</strong><time>{time}</time></div><p>{text}</p></div></div> }
function TimelineItem({ title, detail, color }: { title: string; detail: string; color: string }) { return <div className="timeline-item"><span className={`timeline-dot ${color}`} /><div><strong>{title}</strong><small>{detail}</small></div></div> }

export default App

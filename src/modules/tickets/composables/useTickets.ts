import { ref } from 'vue'
import api from '@/services/api'
import type { Ticket, TicketForm, TicketFilters, TicketMessage } from '../interfaces/ticket.interface'

/**
 * Composable that exposes all ticket CRUD operations and message management.
 * Admin users receive all tickets from the API; clients receive only their own.
 */
export function useTickets() {
  const tickets = ref<Ticket[]>([])
  const ticket = ref<Ticket | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const sending = ref(false)

  // ── Tickets ────────────────────────────────────────────────────────────────

  const getTickets = async (filters: TicketFilters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params: Record<string, any> = {}
      if (filters.search) params.search = filters.search
      if (filters.active !== undefined) params.active = filters.active ? 1 : 0

      const res = await api.get('/tickets', { params })
      tickets.value = res.data.data ?? res.data ?? []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading tickets'
      console.error('useTickets.getTickets:', err)
    } finally {
      loading.value = false
    }
  }

  const getTicket = async (id: number): Promise<Ticket> => {
    loading.value = true
    error.value = null
    try {
      const res = await api.get(`/tickets/${id}`)
      const data = res.data.data ?? res.data
      ticket.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error loading ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTicket = async (form: TicketForm): Promise<Ticket> => {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/tickets', form)
      return res.data.data ?? res.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error creating ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTicket = async (
    id: number,
    data: Partial<TicketForm & { active: boolean }>
  ): Promise<Ticket> => {
    loading.value = true
    error.value = null
    try {
      const res = await api.put(`/tickets/${id}`, data)
      const updated = res.data.data ?? res.data
      ticket.value = updated
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error updating ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTicket = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/tickets/${id}`)
      tickets.value = tickets.value.filter(t => t.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error deleting ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  const sendMessage = async (ticketId: number, message: string): Promise<TicketMessage> => {
    sending.value = true
    try {
      const res = await api.post(`/tickets/${ticketId}/messages`, { message })
      return res.data.data ?? res.data
    } catch (err: any) {
      throw err
    } finally {
      sending.value = false
    }
  }

  const deleteMessage = async (messageId: number): Promise<void> => {
    await api.delete(`/messages/${messageId}`)
  }

  return {
    tickets,
    ticket,
    loading,
    error,
    sending,
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    sendMessage,
    deleteMessage,
  }
}

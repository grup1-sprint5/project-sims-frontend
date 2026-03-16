export interface TicketUser {
  id: number
  name: string
  email: string
}

export interface TicketMessage {
  id: number
  ticket_id: number
  user_id: number
  message: string
  user?: TicketUser
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: number
  user_id: number
  vehicle_id?: number | null
  title: string
  description?: string
  active: boolean
  user?: TicketUser
  messages?: TicketMessage[]
  created_at: string
  updated_at: string
}

export interface TicketForm {
  title: string
  description?: string
  vehicle_id?: number | null
}

export interface TicketFilters {
  search?: string
  active?: boolean
}

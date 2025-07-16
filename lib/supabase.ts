import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Types pour les événements temps réel
export interface RealtimeRequestUpdate {
  id: string
  status: string
  mechanicId?: string
  assignedAt?: string
  startedAt?: string
  completedAt?: string
}

export interface MechanicLocation {
  mechanicId: string
  latitude: number
  longitude: number
  timestamp: string
}

// Fonctions utilitaires pour le temps réel
export const subscribeToRequestUpdates = (
  requestId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`request_${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'requests',
        filter: `id=eq.${requestId}`,
      },
      callback
    )
    .subscribe()
}

export const subscribeMechanicLocation = (
  mechanicId: string,
  callback: (payload: MechanicLocation) => void
) => {
  return supabase
    .channel(`mechanic_location_${mechanicId}`)
    .on('broadcast', { event: 'location_update' }, callback)
    .subscribe()
}

export const broadcastMechanicLocation = (
  mechanicId: string,
  location: { latitude: number; longitude: number }
) => {
  return supabase
    .channel(`mechanic_location_${mechanicId}`)
    .send({
      type: 'broadcast',
      event: 'location_update',
      payload: {
        mechanicId,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      }
    })
}

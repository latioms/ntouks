'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Phone, Mail, Car, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface Request {
  id: string
  requesterName: string
  requesterPhone: string
  requesterEmail?: string
  breakdownType: string
  description: string
  urgency: number
  address: string
  latitude: number
  longitude: number
  vehicleBrand?: string
  vehicleModel?: string
  vehicleYear?: number
  licensePlate?: string
  status: string
  priority: number
  createdAt: string
  assignedAt?: string
  startedAt?: string
  completedAt?: string
  mechanic?: {
    id: string
    firstName: string
    lastName: string
  }
  station?: {
    id: string
    name: string
  }
}

interface RequestCardProps {
  request: Request
  onAccept?: (requestId: string) => void
  onReject?: (requestId: string) => void
  onStart?: (requestId: string) => void
  onComplete?: (requestId: string) => void
  showActions?: boolean
  userRole?: string
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const urgencyColors = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800'
}

const breakdownTypeLabels = {
  MECHANICAL: 'Mechanical',
  ELECTRICAL: 'Electrical',
  TIRE: 'Tire',
  BATTERY: 'Battery',
  ENGINE: 'Engine',
  TRANSMISSION: 'Transmission',
  BRAKES: 'Brakes',
  OTHER: 'Other'
}

export function RequestCard({ 
  request, 
  onAccept, 
  onReject, 
  onStart, 
  onComplete, 
  showActions = true,
  userRole 
}: RequestCardProps) {
  const statusClass = statusColors[request.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  const urgencyClass = urgencyColors[request.urgency as keyof typeof urgencyColors] || 'bg-gray-100 text-gray-800'

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {request.requesterName}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={statusClass}>
              {request.status.replace('_', ' ')}
            </Badge>
            <Badge className={urgencyClass}>
              Urgency {request.urgency}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
          </span>
          {request.priority > 3 && (
            <span className="flex items-center gap-1 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              High Priority
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Breakdown Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Breakdown Details</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Type:</span> {breakdownTypeLabels[request.breakdownType as keyof typeof breakdownTypeLabels]}
              </div>
              <div>
                <span className="font-medium">Description:</span> {request.description}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${request.requesterPhone}`} className="text-blue-600 hover:underline">
                  {request.requesterPhone}
                </a>
              </div>
              {request.requesterEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${request.requesterEmail}`} className="text-blue-600 hover:underline">
                    {request.requesterEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Location</h4>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{request.address}</span>
          </div>
        </div>

        {/* Vehicle Info */}
        {(request.vehicleBrand || request.vehicleModel || request.licensePlate) && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Vehicle Information</h4>
            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4" />
              <span>
                {request.vehicleBrand} {request.vehicleModel} 
                {request.vehicleYear && ` (${request.vehicleYear})`}
                {request.licensePlate && ` - ${request.licensePlate}`}
              </span>
            </div>
          </div>
        )}

        {/* Assignment Info */}
        {request.mechanic && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Assigned Mechanic</h4>
            <div className="text-sm">
              {request.mechanic.firstName} {request.mechanic.lastName}
            </div>
          </div>
        )}

        {/* Station Info */}
        {request.station && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Station</h4>
            <div className="text-sm">
              {request.station.name}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            {request.status === 'ASSIGNED' && userRole === 'MECHANIC' && (
              <>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => onAccept?.(request.id)}
                >
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onReject?.(request.id)}
                >
                  Reject
                </Button>
              </>
            )}
            
            {request.status === 'ASSIGNED' && userRole === 'MECHANIC' && (
              <Button 
                size="sm" 
                variant="default"
                onClick={() => onStart?.(request.id)}
              >
                Start Work
              </Button>
            )}
            
            {request.status === 'IN_PROGRESS' && userRole === 'MECHANIC' && (
              <Button 
                size="sm" 
                variant="default"
                onClick={() => onComplete?.(request.id)}
              >
                Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export interface Activity {
  id: string
  userId: string
  name: string
  description?: string
  date: Date
  duration?: number
  distance?: number
  elevation?: number
  location?: string
  type: ActivityType
  createdAt: Date
  updatedAt: Date
}

export enum ActivityType {
  RUN = 'RUN',
  BIKE = 'BIKE',
  SWIM = 'SWIM',
  HIKE = 'HIKE',
  WALK = 'WALK',
  OTHER = 'OTHER'
}

export interface CreateActivityDto {
  name: string
  description?: string
  date: Date
  duration?: number
  distance?: number
  elevation?: number
  location?: string
  type: ActivityType
}

export interface UpdateActivityDto {
  name?: string
  description?: string
  date?: Date
  duration?: number
  distance?: number
  elevation?: number
  location?: string
  type?: ActivityType
}
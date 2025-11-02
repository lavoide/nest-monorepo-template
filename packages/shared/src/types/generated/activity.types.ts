import { Gender } from '../enums'

export interface ActivityQueryDto {
  page?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  filterBy?: string
  filterContains?: string
}

export interface ActivityDto {
  type: string
  weekdays?: JSON
  date?: Date
  isAnyDate?: boolean
  timeFrom: string
  timeTo: string
  filterGender: Gender
  filterAgeFrom?: number
  filterAgeTo?: number
  filterLocation?: string
  author: string
}

export interface CreateActivityDto {
  typeId: string
  weekdays?: any
  date?: Date
  isAnyDate?: boolean
  timeFrom: string
  timeTo: string
  filterGender: Gender
  filterAgeFrom?: number
  filterAgeTo?: number
  filterLocation?: number
  userId: string
}

export interface UpdateActivityDto {
  typeId?: string
  weekdays?: any
  date?: Date
  isAnyDate?: boolean
  timeFrom?: string
  timeTo?: string
  filterGender?: Gender
  filterAgeFrom?: number
  filterAgeTo?: number
  filterLocation?: number
}

export interface CreateEntityDto {
  name: string
  description?: string
  status?: string
  userId: string
}

export interface EntityQueryDto {
  page?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  filterBy?: string
  filterContains?: string
}

export interface EntityDto {
  id: string
  name: string
  description?: string
  status: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface UpdateEntityDto {}

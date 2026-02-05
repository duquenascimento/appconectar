import { UserRole } from "./userRoleTypes"

export type TokenPayload = {
    role: UserRole[]
    id: string
    email: string
    restaurant: string[]
    active: boolean
    position: string
    createdAt: Date
}

import { EventStatus } from './../constants'

export interface EventStatusController {
    status: EventStatus;
    message?: string;
}
export interface TaskStatus {
    label: string;
    value: string;
}
export interface TaskPriority {
    label: string;
    value: string;
}
export interface Task {
    id?: string;
    name?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    start_date?: string | Date;
    end_date?: string | Date;
    total_spend_time?: number;
}
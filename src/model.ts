export enum StickyEventKind {
    TaskFocus
}

export type TaskFocusEvent = {
    kind: StickyEventKind.TaskFocus
    taskIdentifier: string
    event: 'focusGained' | 'focusLost'
    date:Date
}

export type StickyEvent = TaskFocusEvent

export type Task = {
    identifier: string
    events: Array<StickyEvent>
}

export type TaskBoard = {
    taskInFocus?: Task
    allTasks: Task[]
}

export function isTaskFocusEvent(event: StickyEvent): event is TaskFocusEvent {
    return event.kind === StickyEventKind.TaskFocus
}
import * as _ from 'lodash'
import { Observable, scan, map } from 'rxjs'
import {taskFocusObservable} from './taskFocus'
import {TaskFocusEvent, StickyEvent, Task, TaskBoard } from './model'

type TaskBoardInternal = {
    identifierOfTaskInFocus?: string,
    tasks: {[key:string] : Task}
}

export const emptyInternalTaskBoard: TaskBoardInternal = {tasks:{}}

export function updateInternalBoardWithEvent(board:TaskBoardInternal, event:StickyEvent): TaskBoardInternal {
    const {identifierOfTaskInFocus, tasks}=board
    if (typeof identifierOfTaskInFocus === 'undefined'
        && event.event == 'focusLost') {
            throw `No task in focus but ${event.taskIdentifier} reported it lost focus`
    } else if (
        typeof identifierOfTaskInFocus !== 'undefined'
        && event.event == 'focusGained') {
            throw `Task ${identifierOfTaskInFocus} it is still in focus 🧘‍♀️ but task ${event.taskIdentifier} is attempting to gain focus`
    } else if (
        typeof identifierOfTaskInFocus === 'undefined'
        && event.event == 'focusGained') {
            const existingTask = tasks[event.taskIdentifier]
            const updatedOrNewTask = typeof existingTask !== 'undefined'
            ? {
                ...existingTask,
                events: [...existingTask.events, event]
            }
            : {
                identifier: event.taskIdentifier,
                events: [event]
            }
            return {
                identifierOfTaskInFocus: updatedOrNewTask.identifier,
                tasks: {...tasks, [updatedOrNewTask.identifier]:updatedOrNewTask}
            }
    } else if (
        identifierOfTaskInFocus
        && event.event == 'focusLost') {
            const taskInFocus = tasks[identifierOfTaskInFocus]
            return {
                identifierOfTaskInFocus: undefined,
                tasks: {
                    ...tasks,
                    [identifierOfTaskInFocus]: {
                        ...taskInFocus,
                        events: [
                            ...taskInFocus.events,
                            event
                        ]
                    }
                }
            }
    }
    throw `Failed to process event`
}

export function toTaskBoard({identifierOfTaskInFocus, tasks}:TaskBoardInternal): TaskBoard {
    return {
        taskInFocus: identifierOfTaskInFocus ? tasks[identifierOfTaskInFocus] : undefined,
        allTasks: _.values(tasks)
    }
}

export function taskBoardObservable(): Observable<TaskBoard> {
    const allEventsObservable = taskFocusObservable()
    return allEventsObservable.pipe(
        scan(updateInternalBoardWithEvent, emptyInternalTaskBoard),
        map(toTaskBoard)
    )
}
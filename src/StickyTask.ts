import * as _ from 'lodash'
import * as fp from 'lodash/fp'
import StickyTask = require('.')

export enum StickyEventKind {
    TaskFocus
}

export type TaskFocusEvent = {
    kind: StickyEventKind.TaskFocus
    taskIdentifier: string
    event: 'focusGained' | 'focusLost'
}

export type StickyEvent = TaskFocusEvent

export type Task = {
    identifier: string
    events: Array<StickyEvent>
}

export function eventsToTasks(events: Array<StickyEvent>): Array<Task> {
    const state = _.reduce<
    StickyEvent,
    {identifierOfTaskInFocus: string | undefined, tasks: {[key:string] : Task}}
    >(
        events,
        ({identifierOfTaskInFocus, tasks}, event) => {
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
                typeof identifierOfTaskInFocus !== 'undefined'
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
        },
        {identifierOfTaskInFocus:undefined, tasks:{}}
    )
    return _.values(state.tasks)
}

import {Task, TaskFocusEvent, StickyEventKind, isTaskFocusEvent} from './model'
import * as _ from 'lodash'

export function millisecondsSpentOnTask(task: Task, currentTime: Date = new Date()): number {
    const focusEvents = task.events.filter(x => isTaskFocusEvent)
    const focusLostFocusEventPairs = _.chunk(focusEvents, 2)
    const focusTimeIntervals = focusLostFocusEventPairs.map(
        ([focus, lostFocus]) => {
            if (!lostFocus) {
                return currentTime.getTime() -focus.date.getTime()
            }
            return lostFocus.date.getTime() - focus.date.getTime()
    })
    return _.sum(focusTimeIntervals)
}

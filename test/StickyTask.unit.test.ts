import { describe, it } from 'mocha'  
import { expect } from 'chai'
import * as _ from 'lodash'

import { emptyInternalTaskBoard
, updateInternalBoardWithEvent
, toTaskBoard
} from '../src/TaskBoard'
import { millisecondsSpentOnTask } from '../src/TaskInsights' 
import { StickyEventKind, TaskFocusEvent, StickyEvent, TaskBoard 
, Task } from '../src/model'

let currentTime = 0

let focused = (taskIdentifier:string, millisecondOffset:number = currentTime++): TaskFocusEvent =>
({
    kind: StickyEventKind.TaskFocus,
    taskIdentifier:taskIdentifier,
    event: 'focusGained',
    date: new Date(millisecondOffset)
})

let focusLost = (taskIdentifier:string, millisecondOffset:number = currentTime++): TaskFocusEvent =>
({
    kind: StickyEventKind.TaskFocus,
    taskIdentifier:taskIdentifier,
    event: 'focusLost',
    date: new Date(millisecondOffset)
})

function boardAfterEvents(events: StickyEvent[]): TaskBoard {
    const internalBoard = _.reduce(events, updateInternalBoardWithEvent, emptyInternalTaskBoard)
    return toTaskBoard(internalBoard)
}

describe('Focus events are split correctly between the tasks', () => {
    it('Splits focus events between two tasks', () => {
        const board = boardAfterEvents([
            focused('1'),
            focusLost('1'),
            focused('2'),
            focusLost('2')
        ])
        expect(board.allTasks.length).equal(2)
    })
    
    it('Reports current task in focus as part of the board', () => {
        const board = boardAfterEvents([
            focused('1'),
            focusLost('1'),
            focused('2')
        ])
        expect(board.allTasks.length).equal(2)
    })
})

describe('Task can provide useful insights', () => {
    it('Reports total time spend on it', () => {
        const task: Task = {
            identifier: '1', 
            events:[
                focused('1', 0), 
                focusLost('1', 1), 
                focused('1', 3)
            ]
        }
        const currentTime: Date = new Date(7)
        const timeSpent = millisecondsSpentOnTask(task, currentTime)
        expect(timeSpent).equal(5)
    })    
})
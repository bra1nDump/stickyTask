import { suite, test } from '@testdeck/mocha'
import { describe } from 'mocha'
import * as _chai from 'chai';
import { eventsToTasks, StickyEventKind, TaskFocusEvent } from '../src/StickyTask'

_chai.should();

let taskFocusGainedEvent = (taskIdentifier:string): TaskFocusEvent =>
({
    kind: StickyEventKind.TaskFocus,
    taskIdentifier:taskIdentifier,
    event: 'focusGained'
})

let taskFocusLostEvent = (taskIdentifier:string): TaskFocusEvent =>
({
    kind: StickyEventKind.TaskFocus,
    taskIdentifier:taskIdentifier,
    event: 'focusLost'
})

// Task focus events are distributed correctly across tasks
@suite class TaskFocusEventUnitTests {
    @test 'Events are split between two tasks'() {
        eventsToTasks([
            taskFocusGainedEvent('1'),
            taskFocusLostEvent('1'),
            taskFocusGainedEvent('2'),
            taskFocusLostEvent('2')
        ]).length.should.equal(2)
    }

    @test 'Still focused task still shows up'() {
        eventsToTasks([
            taskFocusGainedEvent('1'),
            taskFocusLostEvent('1'),
            taskFocusGainedEvent('2')
        ]).length.should.equal(2)
    }
}

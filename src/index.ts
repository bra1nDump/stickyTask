// import {Task, taskBoardStream} from './stickyTask'
import {taskBoardObservable} from './TaskBoard'

async function main() {
    taskBoardObservable().subscribe()
}

main()

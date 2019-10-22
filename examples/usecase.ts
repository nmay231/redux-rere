/** @format */

import { rereUndo, RereReducer } from '../src'
import { array } from '../src/rereTypes'

const example: RereReducer<number> = (state: number[] = [1, 2, 3, 4], action) => {
    switch (action.case) {
        case 1:
            return [...state, 5]
        case 2:
            return array(state).pop(0, (popped) => console.log(popped))
        case 3:
            return array(state).push(3, 6)
        case 4:
            return array(state).replace([1, 2, 3, 4, 5])
    }
}

export default rereUndo<number>(example)

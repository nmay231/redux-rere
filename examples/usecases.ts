/** @format */

import { rereUndo, RereReducer } from '../src'
import { array, object } from '../src/rereTypes'

const example: RereReducer<number[]> = (state = [1, 2, 3, 4], action) => {
    switch (action.type) {
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

export default rereUndo(example)

interface ITodo {
    id: number
    content: string
    likes: number
}

const defaultTodo: ITodo = {
    id: -1,
    content: '',
    likes: 0,
}

const example2: RereReducer<ITodo> = (state, action) => {
    switch (action.type) {
        case 'a':
            return state
        case 'b':
            return object(state).set('likes', state.likes + 1)
        case 'c':
            return object(state).setSub({ content: 'New content' })
        default:
            return defaultTodo
    }
}

export const Example2 = rereUndo(example2)

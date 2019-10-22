/** @format */

import { ActionCreator } from 'redux'

export const actionTypes = {
    UNDO: '@@REDUX_RERE_UNDO',
    REDO: '@@REDUX_RERE_REDO',
    RESET: '@@REDUX_RERE_RESET',
}

interface Action {
    type: string
}

export const undo: ActionCreator<Action> = (repeat?: number, revertBelow?: number) => ({
    type: actionTypes.UNDO,
    repeat,
    revertBelow,
})

export const redo: ActionCreator<Action> = (repeat?: number, revertBelow?: number) => ({
    type: actionTypes.REDO,
    repeat,
    revertBelow,
})

export const reset: ActionCreator<Action> = () => ({
    type: actionTypes.RESET,
})

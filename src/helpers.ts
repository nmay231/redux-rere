/** @format */

import { Action } from 'redux'

import { actionTypes } from './actions'
import { WrappedArray } from './rereArray'
import { WrappedObject } from './rereObject'

export const isRereAction = (action: Action): action is RereAction =>
    action.type === actionTypes.REDO ||
    action.type === actionTypes.UNDO ||
    action.type === actionTypes.RESET

export const toWrapped = <S extends any[] | FilledObject = any>(
    state: S,
    operations?: RereOperation<S>[],
) => {
    if (Array.isArray(state)) {
        return new WrappedArray(state, operations as RereArrayOperation<Unwrap<S>>[])
    } else {
        return new WrappedObject(state, operations as RereObjectOperation<S>[])
    }
}

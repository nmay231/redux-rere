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

// Returns stack of operations to be applied in order (left to right)
export const collectOpsToApply = <S>(
    operations: RereOperation<S>[],
    revertBelow: number,
    repeat: number,
) => {
    const toApply: typeof operations = []
    let lastCommit: RereOperation<S> | undefined

    for (let op of [...operations].reverse()) {
        // Move commits behind their operations
        if (op.type === 'commit') {
            if (lastCommit) {
                toApply.push(lastCommit)
            }
            lastCommit = op
            continue
        }

        if ((op.perserverance || 0) >= revertBelow && --repeat < 0) {
            break
        }
        toApply.push(op)
    }

    if (lastCommit) {
        toApply.push(lastCommit)
    }
    return toApply
}

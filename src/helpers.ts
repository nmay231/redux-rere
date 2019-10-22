/** @format */

import { Action } from 'redux'
import { actionTypes } from './actions'

export const isRereAction = (action: Action): action is RereAction =>
    action.type === actionTypes.REDO ||
    action.type === actionTypes.UNDO ||
    action.type === actionTypes.RESET

export const applyOps = <V = any>(
    state: V[],
    operations: rereArrayOperation<V>[],
): { newState: typeof state; reverseOps: typeof operations } => {
    let newState = [...state]
    let reverseOps: typeof operations = []

    let replaceItems

    for (let op of operations) {
        switch (op.type) {
            case 'replaceWith':
                reverseOps.push({ ...op, replacement: newState })
                newState = op.replacement
                break
            case 'push':
                reverseOps.push({ ...op, type: 'pop' })
                newState.splice(op.index || newState.length, 0, op.value)
                break
            case 'pop':
                reverseOps.push({
                    ...op,
                    type: 'push',
                    value: newState[op.index || newState.length - 1],
                })
                newState.splice(op.index || newState.length - 1, 1)
                break
            case 'set':
                reverseOps.push({ ...op, value: newState[op.index] })
                newState[op.index] = op.value
                break
            case 'splice':
                replaceItems = newState.splice(op.start, op.deleteCount, ...op.replaceItems)
                reverseOps.push({ ...op, deleteCount: replaceItems.length, replaceItems })
            // case 'setArray':
            // case 'setSub':
            default:
        }
        return { newState, reverseOps }
    }
}

/** @format */

import { Action } from 'redux'

import { actionTypes } from './actions'

export const isRereAction = (action: Action): action is RereAction =>
    action.type === actionTypes.REDO ||
    action.type === actionTypes.UNDO ||
    action.type === actionTypes.RESET

export function applyOps<S extends any[] | filledObject = any>(
    state: S,
    operations: RereOperation<S>[],
): { newState: S; reverseOps: typeof operations } {
    if (Array.isArray(state)) {
        let newState = [...(state as any[])]
        let reverseOps: RereArrayOperation<Unwrap<S>>[] = []
        let replaceItems

        for (let op of operations as typeof reverseOps) {
            switch (op.type) {
                case 'replaceWith':
                    reverseOps.push({ ...op, replacement: newState })
                    newState = op.replacement as any[]
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
                    break
                case 'reverse':
                    newState.reverse()
                    reverseOps.push(op)
                    break
                case 'commit':
                    reverseOps.push(op)
                    break
            }
        }
        return { newState: newState as S, reverseOps: reverseOps as typeof operations }
    } else {
        let newState = { ...(state as filledObject) }
        let reverseOps: RereObjectOperation<S>[] = []

        for (let op of operations as typeof reverseOps) {
            switch (op.type) {
                case 'replaceWith':
                    reverseOps.push({ ...op, replacement: newState as S })
                    newState = op.replacement
                    break
                case 'set':
                    reverseOps.push({ ...op, value: newState[op.key as string] })
                    newState[op.key as string] = op.value
                    break
                case 'setSub':
                    let sub: Partial<typeof newState> = {}
                    for (let key in newState) {
                        sub[key] = newState[key]
                    }
                    break
                case 'commit':
                    reverseOps.push(op)
                    break
            }
        }
        return { newState: newState as S, reverseOps: reverseOps as typeof operations }
    }
}

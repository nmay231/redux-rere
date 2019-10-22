/** @format */

import { Reducer } from 'redux'
import { actionTypes } from './actions'
import { isRereAction, applyOps } from './helpers'
import { WrappedArray } from './rereTypes'

export type RereReducer<T = any> = Reducer<T[] | WrappedArray<T>>

export const rereUndo = <V>(
    reducer: RereReducer<V>,
    config?: RereConfig,
): Reducer<actualState<V>> => {
    config = {
        stateType: 'object',
        alwaysRunReducer: false,
        ...config,
    }
    return (state, action) => {
        if (isRereAction(action)) {
            if (config.alwaysRunReducer) {
                reducer(state.actual, action)
            }

            if (action.type === actionTypes.RESET) {
                return {
                    actual: state.original,
                    original: state.original,
                    undos: [],
                    redos: [],
                }
            }

            let { redos, undos } = state

            if (action.type === actionTypes.UNDO) {
                redos = Object.assign([], redos)
                undos = Object.assign([], undos)
            } else if (action.type === actionTypes.REDO) {
                // Take advantage of symmetry
                redos = Object.assign([], undos)
                undos = Object.assign([], redos)
            } else {
                // This should never happen. We done messed up...
                return state
            }

            // Handle both undos and redos as if they were undos
            let { revertBelow = 5, repeat = 1 } = action
            let undosToApply = state.undos.reduceRight<typeof state.undos>(
                (undosToApply, nextUndo) =>
                    nextUndo.perserverance <= revertBelow && repeat-- >= 0
                        ? [nextUndo, ...undosToApply]
                        : undosToApply,
                [],
            )

            let newUndos = undos.slice(0, undos.length - undosToApply.length)

            let { newState, reverseOps } = applyOps(state.actual, undosToApply)
            let newRedos = [...redos, ...reverseOps]

            if (action.type === actionTypes.REDO) {
                ;[newUndos, newRedos] = [newRedos, newUndos]
            }

            return {
                actual: newState,
                undos: newUndos,
                redos: newRedos,
                original: state.original,
            }
        }

        let reduced = <V[] | WrappedArray<V>>reducer(state.actual, action)
        if (reduced === state.actual) {
            return state
        } else if (!(reduced instanceof WrappedArray)) {
            // This can probably be optimized
            reduced = new WrappedArray(state.actual).replace(reduced).commit()
        } else if (reduced.undos[reduced.undos.length - 1].type !== 'commit') {
            reduced.commit()
        }
        return {
            actual: reduced.actual,
            undos: [...state.undos, ...reduced.undos],
            redos: [],
            original: state.original,
        }
    }
}

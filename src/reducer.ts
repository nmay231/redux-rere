/** @format */

import { Reducer, AnyAction, Action } from 'redux'

import { actionTypes } from './actions'
import { isRereAction, toWrapped } from './utils'
import { WrappedArray } from './rereArray'
import { WrappedObject } from './rereObject'

// prettier-ignore
export type RereReducer<S, A = any> =
    (state: S, action: Action<A>) =>
        S | (S extends (infer V)[] ? WrappedArray<V> : WrappedObject<S>)

const defaultActualState: actualState<any> = {
    actual: undefined,
    original: undefined,
    redos: [],
    undos: [],
}

export function rereUndo<S extends any[]>(
    reducer: RereReducer<S>,
    config?: Partial<RereConfig>,
): Reducer<actualState<S>>

export function rereUndo<S extends FilledObject>(
    reducer: RereReducer<S>,
    config?: Partial<RereConfig>,
): Reducer<actualState<S>>

export function rereUndo<S extends FilledObject | any[]>(
    reducer: Reducer<S | WrappedArray<Unwrap<S>>> | Reducer<S | WrappedObject<S>>,
    config: Partial<RereConfig> = {},
): Reducer<actualState<S>, RereAction | AnyAction> {
    config = {
        alwaysRunReducer: false,
        ...config,
    }
    return (state = defaultActualState, action) => {
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

            // Take advantage of symmetry to handle both undos and redos the same
            if (action.type === actionTypes.REDO) {
                ;[redos, undos] = [undos, redos]
            }

            let { revertBelow = 5, repeat = 1 } = action
            // TODO: This is reducing wrong, but I'll fix it when my mind is clearer
            let undosToApply = state.undos.reduceRight<typeof undos>(
                (undosToApply, nextUndo) =>
                    (nextUndo.perserverance || 1) <= revertBelow && repeat-- >= 0
                        ? [nextUndo, ...undosToApply]
                        : undosToApply,
                [],
            )

            const wrapped = toWrapped(state.actual, undosToApply)
            let newRedos = [...redos, ...(wrapped.undos as typeof redos)]
            let newUndos = undos.slice(0, undos.length - undosToApply.length)

            if (action.type === actionTypes.REDO) {
                ;[newUndos, newRedos] = [newRedos, newUndos]
            }

            return {
                actual: wrapped.actual as S,
                undos: newUndos,
                redos: newRedos,
                original: state.original,
            }
        }

        let reduced = reducer(state.actual, action)
        if (reduced === state.actual) {
            return state
        } else if (!(reduced instanceof WrappedArray || reduced instanceof WrappedObject)) {
            reduced = toWrapped(reduced)
                .replace(reduced as any[] & S) // TODO: Fix the need for this awkward type conversion
                .commit()
        } else if (reduced.undos[reduced.undos.length - 1].type !== 'commit') {
            reduced.commit()
        }

        return {
            actual: reduced.actual as S,
            undos: [...state.undos, ...(reduced.undos as RereOperation<S>[])],
            redos: [],
            // Just wait for null coalescing...
            original:
                typeof state.original !== 'undefined' ? state.original : (reduced.actual as S),
        }
    }
}

/** @format */

type Operation<T extends string, A = {}> = {
    type: T
    perserverance: number
} & A

declare type RereArrayOperation<V> =
    | Operation<'replaceWith', { replacement: V[] }>
    | Operation<'push', { index?: number; value: V }>
    | Operation<'pop', { index?: number }>
    | Operation<'set', { index: number; value: V }>
    | Operation<'splice', { start: number; deleteCount?: number; replaceItems?: V[] }>
    | Operation<'commit'>

declare type RereObjectOperation<S> =
    | Operation<'replaceWith', { replacement: S }>
    | Operation<'set', { key: keyof S; value: S[keyof S] }>
    | Operation<'setSub', { sub: Partial<S> }>
    | Operation<'commit'>

declare type RereOperation<S> = S extends (infer V)[]
    ? RereArrayOperation<V>
    : RereObjectOperation<S>

declare interface actualState<S> {
    actual: S
    original: S
    undos: RereOperation<S>[]
    redos: RereOperation<S>[]
}

declare interface RereAction {
    type: '@@REDUX_RERE_UNDO' | '@@REDUX_RERE_REDO' | '@@REDUX_RERE_RESET'
    revertBelow?: number
    repeat?: number
}

declare interface RereConfig {
    alwaysRunReducer: boolean
}

declare type Unwrap<S> = S extends (infer V)[] ? V : never

declare type filledObject = { [key: string]: any }

/** @format */

declare interface ereArrayOperation<V> {
    type: 'replaceWith' | 'push' | 'pop' | 'set' | 'splice'
    perserverance: number
    index?: number
    value?: V
    sub?: V[]
}

type rereArrayOperation<V> = { perserverance: number } & (
    | {
          type: 'replaceWith'
          replacement: V[]
      }
    | {
          type: 'push'
          value: V
          index?: number
      }
    | {
          type: 'pop'
          index?: number
      }
    | {
          type: 'set'
          index: number
          value: V
      }
    | {
          type: 'splice'
          start: number
          deleteCount?: number
          replaceItems?: V[]
      }
    | {
          type: 'commit'
      })

declare interface rereObjectOperation<S> {
    type: 'replaceWith' | 'setKey' | 'setSub'
    perserverance: number
    key?: keyof S
    value?: S[keyof S]
    sub?: Partial<S>
}

declare type rereOperation<S> =
    //  rereArrayOperation
    rereObjectOperation<S>

declare interface rereArray<V = any> {
    __rereOperations: rereArrayOperation<V>[]
    value: V[]
    final: V[]
    replace: (replaceWith: V[]) => rereArray<V>
    push: (obj: V, index?: number) => rereArray<V>
    pop: (index?: number, callback?: (popped: V) => any) => rereArray<V>
    set: (index: number, obj: V) => rereArray<V>
}

declare interface rereObject<V = any> {
    __rereOperations: rereObjectOperation<V>[]
    value: V
    final: V
    set: (key: keyof V, obj: any) => rereObject<V>
    setSub: (subObject: Partial<V>) => rereObject<V>
    replace: (replaceWith: V) => rereObject<V>
}

declare type rereType = Pick<rereArray | rereObject, '__rereOperations' | 'value' | 'final'>

declare interface RereAction {
    type: string
    revertBelow?: number
    repeat?: number
}

declare interface actualState<S> {
    actual: S[]
    original: S[]
    undos: rereArrayOperation<S>[]
    redos: rereArrayOperation<S>[]
}

declare interface RereConfig {
    stateType: 'object' | 'array'
    alwaysRunReducer: boolean
}

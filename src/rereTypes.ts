/** @format */

// Default perserverance for simple operations
const perserverance = 1

export class WrappedArray<V = any> {
    actual: V[]
    undos: rereArrayOperation<V>[]

    constructor(input: V[]) {
        this.actual = [...input]
    }

    push(obj: V, index?: number) {
        if (typeof index === 'number' && 0 <= index && index < this.actual.length) {
            this.actual.splice(index, 0, obj)
        } else {
            this.actual.push(obj)
        }
        this.undos.push({ type: 'pop', index, perserverance })
        return this
    }

    pop(index?: number, callback?: (popped: V) => void) {
        let popped: V
        if (typeof index === 'number' && 0 <= index && index < this.actual.length) {
            ;[popped] = this.actual.splice(index, 1)
        } else {
            popped = this.actual.pop()
        }
        // Note: the callback has to be pure since it would only be created in a reducer
        if (callback) callback(popped)
        this.undos.push({ type: 'push', index, value: popped, perserverance })
        return this
    }

    splice(start: number, deleteCount?: number, items?: V[], callback?: (spliced: V[]) => void) {
        let spliced = this.actual.splice(start, deleteCount, ...items)
        this.undos.push({
            type: 'splice',
            start,
            deleteCount,
            replaceItems: spliced,
            perserverance,
        })
        if (callback) {
            callback(spliced)
        }
    }

    set(index: number, value: V) {
        this.undos.push({ type: 'set', index, value: this.actual[index], perserverance })
        if (typeof index === 'number' && 0 <= index && index < this.actual.length) {
            this.actual[index] = value
        }
        return this
    }

    replace(replaceWith: V[]) {
        this.undos.push({
            type: 'replaceWith',
            replacement: this.actual.splice(0, this.actual.length, ...replaceWith),
            perserverance,
        })
        return this
    }

    commit(perserverance: number = 5) {
        this.undos.push({ type: 'commit', perserverance })
        return this
    }
}

export const array = <T>(input: T[]) => new WrappedArray(input)

// Returns an object containing uncomputed operations on the input array
// export const array = <T = any>(input: T[]): rereArray<T> => {
//     let final = [...input]

//     const push: rereArray<T>['push'] = (obj, index) => {
//         rere.__rereOperations.push({ type: 'push', index, value: obj, perserverance })
//         final.splice(index, 0, obj)
//         return rere
//     }

//     const pop: rereArray<T>['pop'] = (index, callback) => {
//         index = typeof index === 'number' ? index : final.length - 1
//         const [val] = final.splice(index, index + 1)
//         if (callback) {
//             callback(val)
//         }
//         rere.__rereOperations.push({ type: 'pop', index, perserverance })
//         return rere
//     }

//     const replace: rereArray<T>['replace'] = (replaceWith) => {
//         final.splice(0, final.length, ...replaceWith)
//         rere.__rereOperations.push({ type: 'replaceWith', value: replaceWith, perserverance })
//         return rere
//     }

//     const set: rereArray<T>['set'] = (index, value) => {
//         final[index] = value
//         rere.__rereOperations.push({ type: 'setArray', index, value, perserverance })
//         return rere
//     }

//     const rere: rereArray = {
//         __rereOperations: [],
//         value: input,
//         final,
//         push,
//         pop,
//         set,
//         replace,
//     }

//     return rere
// }

// Returns an object containing uncomputed operations on the input object
// export const object = <O>(input: O): rereObject<O> => {
//     const final = { ...input }

//     const set: rereObject<O>['set'] = (key, value) => {
//         final[key] = value
//         rere.__rereOperations.push({ type: 'set', key, value, perserverance })
//         return rere
//     }

//     const setSub: rereObject<O>['setSub'] = (sub) => {
//         Object.assign(final, sub)
//         rere.__rereOperations.push({ type: 'setSub', sub, perserverance })
//         return rere
//     }

//     const replace: rereObject<O>['replace'] = (replaceWith) => {
//         Object.assign(final, replaceWith) // TODO: Remove entries from `final` not on `replaceWith`
//         rere.__rereOperations.push({ type: 'replaceWith', value: replaceWith, perserverance })
//         return rere
//     }

//     const rere: rereObject = {
//         __rereOperations: [],
//         value: input,
//         final,
//         set,
//         setSub,
//         replace,
//     }
//     return rere
// }

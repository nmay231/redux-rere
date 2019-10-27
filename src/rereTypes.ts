/** @format */

// Default perserverance for simple operations
const perserverance = 1

export class WrappedArray<V = any> {
    actual: V[]
    undos: RereArrayOperation<V>[]

    constructor(input: V[]) {
        this.actual = [...input]
    }

    get length() {
        return this.actual.length
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
        return this
    }

    concat(...appendedArrays: Array<V | V[]>) {
        for (let arr of appendedArrays) {
            if (Array.isArray(arr)) {
                this.splice(this.actual.length, 0, arr)
            } else {
                this.push(arr)
            }
        }
        return this
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

    filter(toKeep: (value: V, index: number, array: V[]) => unknown = (val) => val) {
        this.undos.push({
            type: 'replaceWith',
            replacement: [...this.actual],
            perserverance,
            // revert: {
            //     type: 'filter',
            //     filter: toKeep,
            //     perserverance,
            // },
        })
        this.actual = this.actual.filter(toKeep)
        return this
    }

    sort(compare?: (A: V, B: V) => number) {
        this.undos.push({
            type: 'replaceWith',
            replacement: [...this.actual],
            perserverance,
            // revert: {
            //     type: 'sort',
            //     sort: compare,
            //     perserverance,
            // },
        })
        this.actual.sort(compare)
        return this
    }

    reverse() {
        this.undos.push({ type: 'reverse', perserverance })
        this.actual.reverse()
        return this
    }

    commit(perserverance: number = 5) {
        this.undos.push({ type: 'commit', perserverance })
        return this
    }
}

export const array = <T>(input: T[]) => new WrappedArray(input)

export class WrappedObject<O> {
    actual: O
    undos: RereObjectOperation<O>[]

    constructor(input: O) {
        this.actual = { ...input }
    }

    replace(replaceWith: O) {
        this.undos.push({ type: 'replaceWith', replacement: this.actual, perserverance })
        this.actual = replaceWith
        return this
    }

    set(key: keyof O, value: O[keyof O]) {
        this.undos.push({ type: 'set', key, value: this.actual[key], perserverance })
        this.actual[key] = value
        return this
    }

    setSub(sub: Partial<O>) {
        let oldSub: Partial<O> = {}
        for (let key in sub) {
            oldSub[key] = this.actual[key]
        }
        this.undos.push({ type: 'setSub', sub: oldSub, perserverance })
        Object.assign(this.actual, sub)
        return this
    }

    commit(perserverance: number = 5) {
        this.undos.push({ type: 'commit', perserverance })
        return this
    }
}

export const object = <O>(obj: O) => new WrappedObject(obj)

/** @format */

export const array = <T>(input: T[]) => new WrappedArray(input)

export class WrappedArray<V = any> {
    actual: V[]
    undos: RereArrayOperation<V>[]

    constructor(input: V[], operations?: RereArrayOperation<V>[]) {
        this.actual = [...input]

        if (!operations) {
            return
        }
        for (let op of operations) {
            switch (op.type) {
                case 'replaceWith':
                    if (op.revert) {
                        this.undos.push(op.revert)
                    } else {
                        this.undos.push({ ...op, replacement: this.actual })
                    }
                    this.actual = op.replacement
                    break
                case 'push':
                    this.push(op.value, op.index)
                    break
                case 'pop':
                    this.pop(op.index)
                    break
                case 'set':
                    this.set(op.index, op.value)
                    break
                case 'splice':
                    this.splice(op.start, op.deleteCount, op.replaceItems)
                    break
                case 'reverse':
                    this.reverse()
                    break
                case 'filter':
                    this.filter(op.filter)
                    break
                case 'sort':
                    this.sort(op.sorter)
                    break
                case 'map':
                    this.map(op.map, op.unmap)
                    break
                case 'commit':
                    this.commit(op.perserverance)
                    break
            }
        }
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
        this.undos.push({ type: 'pop', index })
        return this
    }

    pop(index?: number, callback?: (popped: V | undefined) => void) {
        let popped: V | undefined
        if (typeof index === 'number' && 0 <= index && index < this.actual.length) {
            ;[popped] = this.actual.splice(index, 1)
        } else {
            popped = this.actual.pop()
        }
        // Note: the callback has to be pure since it would only be created in a reducer
        if (callback) callback(popped)
        if (popped) {
            this.undos.push({ type: 'push', index, value: popped })
        }
        return this
    }

    splice(start: number, deleteCount?: number, items?: V[], callback?: (spliced: V[]) => void) {
        let spliced = this.actual.splice(start, deleteCount || 0, ...(items || []))
        this.undos.push({
            type: 'splice',
            start,
            deleteCount,
            replaceItems: spliced,
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
        this.undos.push({ type: 'set', index, value: this.actual[index] })
        if (typeof index === 'number' && 0 <= index && index < this.actual.length) {
            this.actual[index] = value
        }
        return this
    }

    replace(replaceWith: V[]) {
        this.undos.push({
            type: 'replaceWith',
            replacement: this.actual.splice(0, this.actual.length, ...replaceWith),
        })
        return this
    }

    filter(toKeep: (value: V, index: number, array: V[]) => unknown = (val) => val) {
        this.undos.push({
            type: 'replaceWith',
            replacement: [...this.actual],
            revert: {
                type: 'filter',
                filter: toKeep,
            },
        })
        this.actual = this.actual.filter(toKeep)
        return this
    }

    sort(compare?: (A: V, B: V) => number) {
        this.undos.push({
            type: 'replaceWith',
            replacement: [...this.actual],
            revert: {
                type: 'sort',
                sorter: compare,
            },
        })
        this.actual.sort(compare)
        return this
    }

    reverse() {
        this.undos.push({ type: 'reverse' })
        this.actual.reverse()
        return this
    }

    map(map: (val: V) => V, unmap?: (val: V) => V) {
        if (unmap) {
            this.undos.push({ type: 'map', map: unmap, unmap: map })
        } else {
            this.undos.push({
                type: 'replaceWith',
                replacement: [...this.actual],
                revert: { type: 'map', map },
            })
        }
        this.actual = this.actual.map(map)
        return this
    }

    commit(perserverance: number = 5) {
        this.undos.push({ type: 'commit', perserverance })
        return this
    }
}

/** @format */

export const object = <O>(obj: O) => new WrappedObject(obj)

export class WrappedObject<O> {
    actual: O
    undos: RereObjectOperation<O>[]

    constructor(input: O, operations?: RereObjectOperation<O>[]) {
        this.actual = { ...input }

        if (!operations) {
            return
        }
        for (let op of operations) {
            switch (op.type) {
                case 'replaceWith':
                    this.replace(op.replacement)
                    break
                case 'set':
                    this.set(op.key, op.value)
                    break
                case 'setSub':
                    this.setSub(op.sub)
                    break
                case 'commit':
                    this.commit(op.perserverance)
                    break
            }
        }
    }

    replace(replaceWith: O) {
        this.undos.push({ type: 'replaceWith', replacement: this.actual })
        this.actual = replaceWith
        return this
    }

    set(key: keyof O, value: O[keyof O]) {
        this.undos.push({ type: 'set', key, value: this.actual[key] })
        this.actual[key] = value
        return this
    }

    setSub(sub: Partial<O>) {
        let oldSub: Partial<O> = {}
        for (let key in sub) {
            oldSub[key] = this.actual[key]
        }
        this.undos.push({ type: 'setSub', sub: oldSub })
        Object.assign(this.actual, sub)
        return this
    }

    commit(perserverance: number = 5) {
        this.undos.push({ type: 'commit', perserverance })
        return this
    }
}

<!-- @format -->

# Redux-rere

Redux-rere is supposed to be an alternative to the popular [redux-undo](https://github.com/omnidan/redux-undo) package. What are the goals for improvement?

-   Retain a history of a segment of state without storing an entire copy of each state in a stack. Instead, it retains history as a stack of individual operations like push, pop, set a value, etc. See how the basics of redux-undo was implemented [here](https://redux.js.org/recipes/implementing-undo-history)
-   Allow operations a level of `perserverance` that determine whether it is undone/redone with a dispatched `undo`.
-   Written in Typescript for secure use in Typescript or vanilla JS.
-   Say a fun name :wink:

## Usage (Tentative API)

```ts
const numberList: RereReducer<number[]> = (state = [1, 2, 3, 4], action) => {
    switch (action.type) {
        case APPEND_FIVE:
            return array(state).push(5)
        case INSERT_AT_THREE:
            return array(state).push(action.value, 3)
        case REMOVE_FIRST:
            return array(state).pop(0, (popped) => console.log(`We removed ${popped}`))
        case SET_TO_FIBONACCI:
            return [1, 1, 2, 3, 5, 8]
        case FILTER_EVEN:
            return array(state).filter((n) => n % 2 == 0)
        default:
            return state
    }
}

export default rereUndo(numberList)
```

Every operation returns a reference to the wrapper array allowing for chained operations.

```ts
case WHY_DO_THIS:
    return array(state).filter((_, index) => index > 5).pop().set(0, 'Why not?')
```

At the end of the day, this applies an list of operations to a shallow copy of the state.

<!-- prettier-ignore -->
```ts
[
    { type: 'filter', filter: (_, index) => index > 5 },
    { type: 'pop' },
    { type: 'set', index: 0, value: 'Why not?' },
]
```

## Perserverance

Every operation (such as `push`) has a default perserverance of 0 while a `commit` operation
with perserverance 5 is automatically added when you return the final object

```ts
return object(state).set('key', 'value') // .commit(5) is called automatically
```

When calling undo (or redo), you can specify to undo operations up to a certain perserverance.

```ts
dispatch({ type: '@@REDUX_RERE_UNDO', revertBelow: 3 })
```

Meaning you can revert back to smaller changes than the default commit.

```ts
return array(state)
    .pop() // a
    .commit(5)
    .pop() // b
    .commit(4)
    .pop() // c
    .commit(3)
    .pop() // d
    .commit(2)

// Undo the last three pops (b, c, d)
dispatch({ type: '@@REDUX_RERE_UNDO', revertBelow: 4 })
```

Or conversely, set a more difficult operation to undo.

```ts
case RESET_AND_SET_VAL:
    return object(state)
        .replace({a: 1, b: 2})
        .commit(8) // Takes two regular undos to revert this .replace()
        .set('a', action.val)
```

Of course, repeated undos are also supported

```ts
dispatch(reduxRere.undo(3))
```

## Why the name?

I don't know really. It's reminiscent of both redux and redo. And the name sticks for me.

## WIP

This project is a work in progress. _Polite_ suggestions and critiques are welcome.

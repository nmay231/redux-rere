<!-- @format -->

# Redux-rere

Redux-rere is supposed to be an alternative to the useful [redux-undo](https://github.com/omnidan/redux-undo) package. What are the goals for improvement?

-   Retain a history of a segment of state without storing an entire copy of each state in a stack (see how redux-undo was implemented [here](https://redux.js.org/recipes/implementing-undo-history)). Instead, it retains history as a stack of individual operations like push, pop, set a value.
-   Allow actions a level of `perserverance` that determine whether it is undone/redone with a dispatched `undo`.
-   Developed in Typescript for secure use in Typescript or vanilla JS.
-   Say a fun name :wink:

## Usage (Tentative API)

```ts
const numberList: RereReducer<number> = (state: number[] = [1, 2, 3, 4], action) => {
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
    }
}

export default rereUndo<number>(numberList)
```

Every operation returns a reference to the wrapper array allowing for chained operations.

```ts
case WHY_DO_THIS:
    return array(state).filter((_, index) => index > 5).pop().set(0, 'Why not?')
```

At the end of the day, this creates an array of operations that are applied to a copy of the state.

```ts
;[
    { type: 'filter', filter: (_, index) => index > 5 },
    { type: 'pop' },
    { type: 'set', index: 0, value: 'Why not?' },
]
```

## Perserverance

Every operation (such as `push`) has a default perserverance of 1 while a `commit` operation with perserverance 5 is added when you return the final object

```ts
return object(state).set('key', 'value') // .commit(5) is called automatically
```

When calling undo (or redo), you can specify to only undo operations below a certain perserverance.

```ts
dispatch({ type: '@@REDUX_RERE_UNDO', revertBelow: 3 })
```

Meaning you can commit smaller changes that you can revert back to.

```ts
return array(state)
    .pop()
    .commit(4)
    .pop()
    .commit(3)
    .pop() // .commit(5)
```

Or conversely, set a more difficult operation to undo.

```ts
case SAVE_STATE:
    let temp = object(state)
    // modify `temp` here
    return temp.commit(8)
```

Repeated undos are also supported

```ts
dispatch(rere.undo(3))
```

## Why the name?

I don't know really. It's reminiscent of both redux and redo/undo. And the name just sticks.

## WIP

This project is a work in progress. Most array methods are not implemented and the object wrapper is still on the todo list. It might not even be viable for real world applications in its finished state, but it will be fun to develop anyways.

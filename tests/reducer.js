/** @format */

import { array } from '../src/rereArray'

test('testing "array" wrapper array methods', () => {
    expect(array([1, 2, 3]).actual).toEqual([1, 2, 3])
    expect(
        array([1, 2, 3])
            .pop()
            .push(4).actual,
    ).toEqual([1, 2, 4])
})

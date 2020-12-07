// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Disable console log
console.log = jest.fn()

import {IBlock} from './blocks/block'
import {MutableBoard} from './blocks/board'
import octoClient from './octoClient'
import 'isomorphic-fetch'

const fetchMock = jest.fn(async () => {
    const response = new Response()
    return response
})

global.fetch = fetchMock

beforeEach(() => {
    fetchMock.mockReset()
})

test('OctoClient: get blocks', async () => {
    const blocks = createBoards()

    fetchMock.mockReturnValueOnce(jsonResponse(JSON.stringify(blocks)))
    let boards = await octoClient.getBlocksWithType('board')
    expect(boards.length).toBe(blocks.length)

    fetchMock.mockReturnValueOnce(jsonResponse(JSON.stringify(blocks)))
    boards = await octoClient.getSubtree()
    expect(boards.length).toBe(blocks.length)

    fetchMock.mockReturnValueOnce(jsonResponse(JSON.stringify(blocks)))
    boards = await octoClient.exportFullArchive()
    expect(boards.length).toBe(blocks.length)

    fetchMock.mockReturnValueOnce(jsonResponse(JSON.stringify(blocks)))
    const parentId = 'id1'
    boards = await octoClient.getBlocksWithParent(parentId)
    expect(boards.length).toBe(blocks.length)

    fetchMock.mockReturnValueOnce(jsonResponse(JSON.stringify(blocks)))
    boards = await octoClient.getBlocksWithParent(parentId, 'board')
    expect(boards.length).toBe(blocks.length)
})

test('OctoClient: insert blocks', async () => {
    const blocks = createBoards()

    await octoClient.insertBlocks(blocks)

    expect(fetchMock).toBeCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(blocks),
        }))
})

test('OctoClient: importFullArchive', async () => {
    const blocks = createBoards()

    await octoClient.importFullArchive(blocks)

    expect(fetchMock).toBeCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(blocks),
        }))
})

async function jsonResponse(json: string) {
    const response = new Response(json)
    return response
}

function createBoards(): IBlock[] {
    const blocks = []

    for (let i = 0; i < 5; i++) {
        const board = new MutableBoard()
        board.id = `board${i + 1}`
        blocks.push(board)
    }

    return blocks
}

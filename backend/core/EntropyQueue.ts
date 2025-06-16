import { Position } from '../shared/types.ts'

type CellEntry = {
  pos: Position
  entropy: number
}

export class EntropyQueue {
  private heap: CellEntry[] = []
  private indexMap = new Map<string, number>() // "x,y" -> index

  private tileKey({ x, y }: Position): `${number},${number}` {
    return `${x},${y}`
  }

  private swap(i: number, j: number) {
    ;[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
    this.indexMap.set(this.tileKey(this.heap[i].pos), i)
    this.indexMap.set(this.tileKey(this.heap[j].pos), j)
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const left = index - 1
      if (this.heap[index].entropy >= this.heap[left].entropy) break
      this.swap(index, left)
      index = left
    }
  }

  insert(pos: Position, entropy: number) {
    const entry = { pos, entropy }
    this.heap.push(entry)
    const index = this.heap.length - 1
    this.indexMap.set(this.tileKey(pos), index)
    this.bubbleUp(index)
  }

  update(pos: Position, newEntropy: number) {
    const key = this.tileKey(pos)
    const index = this.indexMap.get(key)
    if (index === undefined) {
      this.insert(pos, newEntropy)
      return
    }

    this.heap[index].entropy = newEntropy

    this.bubbleUp(index)
  }

  extractRandomLowestEntropy(): Position | null {
    if (this.isEmpty()) return null
    const minEntropy = this.heap[0].entropy

    let lowestEntropyCount = 0
    for (let i = 0; i < this.heap.length; i++) {
      if (this.heap[i].entropy > minEntropy) break
      lowestEntropyCount++
    }

    const randomIndex = Math.floor(Math.random() * lowestEntropyCount)
    const randomEntry = this.heap[randomIndex]
    this.swap(0, randomIndex)

    this.indexMap.delete(this.tileKey(randomEntry.pos))
    this.heap.shift() // Remove the first element (the one we just swapped)

    // Rebuild indexMap to keep indices in sync after removal
    this.indexMap.clear()
    for (let i = 0; i < this.heap.length; i++) {
      this.indexMap.set(this.tileKey(this.heap[i].pos), i)
    }

    return randomEntry.pos
  }

  isEmpty() {
    return this.heap.length === 0
  }
}

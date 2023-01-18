import { strictEqual } from 'assert'
import { readFile } from 'fs/promises'
import rdf from '@rdfjs/data-model'
import { describe, it } from 'mocha'
import fromFile from 'rdf-utils-fs/fromFile.js'
import chunks from 'stream-chunks/chunks.js'
import decode from 'stream-chunks/decode.js'
import Serializer from '../index.js'

const tests = [
  'base',
  'blank-node',
  'blank-node-empty',
  'blank-nodes-multi-ref',
  'blank-nodes-nested',
  'example',
  'list',
  'list-empty',
  'literal',
  'literal-boolean',
  'literal-decimal',
  'literal-double',
  'literal-integer',
  'literal-languages',
  'named-nodes',
  'object-multi-type',
  'prefix',
  'type'
]

const options = {
  base: {
    base: rdf.namedNode('http://example.com/')
  },
  prefix: {
    prefixes: [
      ['xsd', rdf.namedNode('http://www.w3.org/2001/XMLSchema#')],
      ['schema', rdf.namedNode('http://schema.org/')]
    ]
  }
}

async function compareStreamNtToTtl (basename) {
  const expected = (await readFile(new URL(`assets/${basename}.ttl`, import.meta.url))).toString()
  const input = fromFile((new URL(`assets/${basename}.nt`, import.meta.url)).pathname)
  const parser = new Serializer(options[basename])
  const output = parser.import(input)
  const result = await decode(output)

  strictEqual(result, expected)
}

async function compareTransformNtToTtl (basename) {
  const expected = (await readFile(new URL(`assets/${basename}.ttl`, import.meta.url))).toString()
  const input = fromFile((new URL(`assets/${basename}.nt`, import.meta.url)).pathname)
  const quads = await chunks(input)
  const parser = new Serializer(options[basename])
  const result = parser.transform(quads)

  strictEqual(result, expected)
}

describe('@rdfjs/serializer-turtle', () => {
  describe('stream', () => {
    for (const test of tests) {
      it(`should serialize the ${test} data`, async () => {
        await compareStreamNtToTtl(test)
      })
    }
  })

  describe('transform', () => {
    for (const test of tests) {
      it(`should serialize the ${test} data`, async () => {
        await compareTransformNtToTtl(test)
      })
    }
  })
})

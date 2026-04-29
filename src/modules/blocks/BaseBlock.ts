import type {
  ParserBlockContext,
  ParserBlockConvertContext,
  ParserBlockResult,
} from "./ParserNode.js"
import type { BlockOutputFamilyDefinition } from "../../shared/BlockRegistry.js"

export abstract class BaseBlock {
  readonly outputFamily?: BlockOutputFamilyDefinition

  abstract match(context: ParserBlockContext): boolean

  abstract convert(context: ParserBlockConvertContext): ParserBlockResult
}

export abstract class ContainerBlock extends BaseBlock {}

export abstract class LeafBlock extends BaseBlock {}

export type ParserBlock = ContainerBlock | LeafBlock

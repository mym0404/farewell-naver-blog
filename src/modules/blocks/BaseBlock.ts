import type {
  ParserBlockContext,
  ParserBlockConvertContext,
  ParserBlockResult,
} from "./ParserNode.js"
import type { AnyBlockOutputOptionDefinition } from "../../shared/Types.js"

export abstract class BaseBlock {
  readonly outputOptions?: AnyBlockOutputOptionDefinition

  withOutputOptions(outputOptions: AnyBlockOutputOptionDefinition) {
    Object.assign(this as { outputOptions?: AnyBlockOutputOptionDefinition }, {
      outputOptions,
    })

    return this
  }

  abstract match(context: ParserBlockContext): boolean

  abstract convert(context: ParserBlockConvertContext): ParserBlockResult
}

export abstract class ContainerBlock extends BaseBlock {}

export abstract class LeafBlock extends BaseBlock {}

import { getParserCapabilityId, parserCapabilityCatalog } from "./block-registry.js"

import type { ParserCapability } from "./types.js"

export { getParserCapabilityId }

export const parserCapabilities: ParserCapability[] = parserCapabilityCatalog.map((capability) => ({
  id: getParserCapabilityId({
    editorVersion: capability.editorVersion,
    blockType: capability.blockType,
  }),
  ...capability,
}))

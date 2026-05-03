import { describe, expect, it } from "vitest"

import { mergeSupportUnitFailureGroups, selectFocusedSupportUnit } from "./ingest-focus.js"

describe("selectFocusedSupportUnit", () => {
  it("limits report failures to the focused support unit", () => {
    const result = selectFocusedSupportUnit({
      focusSupportUnit: "naver-se4:v2_poll",
      previousFailureGroups: [],
      failureGroups: [
        { supportUnitKey: "naver-se4:v2_poll", failureBlockHash: "pollhash", logNos: ["1"] },
        { supportUnitKey: "naver-se4:v2_map", failureBlockHash: "maphash", logNos: ["2"] },
      ],
    })

    expect(result.reportFailureGroups).toEqual([
      { supportUnitKey: "naver-se4:v2_poll", failureBlockHash: "pollhash", logNos: ["1"] },
    ])
    expect(result.remainingBacklogGroups).toEqual([
      { supportUnitKey: "naver-se4:v2_map", failureBlockHash: "maphash", logNos: ["2"] },
    ])
    expect(result.focusedFailureBlockHash).toBe("pollhash")
    expect(result.focusedSupportUnitResolved).toBe(false)
  })

  it("treats a known focused unit as resolved when it disappears from current failures", () => {
    const result = selectFocusedSupportUnit({
      focusSupportUnit: "naver-se4:v2_poll",
      previousFailureGroups: [{ supportUnitKey: "naver-se4:v2_poll", failureBlockHash: "pollhash", logNos: ["1"] }],
      failureGroups: [{ supportUnitKey: "naver-se4:v2_map", failureBlockHash: "maphash", logNos: ["2"] }],
    })

    expect(result.reportFailureGroups).toEqual([])
    expect(result.previousFocusedLogNos).toEqual(["1"])
    expect(result.focusedFailureBlockHash).toBe("pollhash")
    expect(result.focusedSupportUnitKnown).toBe(true)
    expect(result.focusedSupportUnitResolved).toBe(true)
  })
})

describe("mergeSupportUnitFailureGroups", () => {
  it("preserves previously discovered support units and their hash", () => {
    expect(
      mergeSupportUnitFailureGroups([
        { supportUnitKey: "naver-se4:v2_poll", failureBlockHash: "pollhash", logNos: ["1"] },
        { supportUnitKey: "naver-se4:v2_map", failureBlockHash: "maphash", logNos: ["2"] },
        { supportUnitKey: "naver-se4:v2_poll", logNos: ["1", "3"] },
      ]),
    ).toEqual([
      { supportUnitKey: "naver-se4:v2_poll", failureBlockHash: "pollhash", logNos: ["1", "3"] },
      { supportUnitKey: "naver-se4:v2_map", failureBlockHash: "maphash", logNos: ["2"] },
    ])
  })
})

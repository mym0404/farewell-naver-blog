import { describe, expect, it } from "vitest"

import { parseCapturePostEvidenceArgs } from "./cases.js"

describe("parseCapturePostEvidenceArgs", () => {
  it("defaults asset profile to tmp", async () => {
    const parsed = await parseCapturePostEvidenceArgs([
      "--blogId",
      "mym0404",
      "--logNo",
      "223034929697",
    ])

    expect(parsed).toMatchObject({
      assetProfile: "tmp",
    })
  })

  it("accepts persistent asset profiles", async () => {
    await expect(
      parseCapturePostEvidenceArgs([
        "--blogId",
        "mym0404",
        "--logNo",
        "223034929697",
        "--assetProfile",
        "readme",
      ]),
    ).resolves.toMatchObject({
      assetProfile: "readme",
    })
    await expect(
      parseCapturePostEvidenceArgs([
        "--blogId",
        "mym0404",
        "--logNo",
        "223034929697",
        "--assetProfile",
        "figure",
      ]),
    ).resolves.toMatchObject({
      assetProfile: "figure",
    })
  })

  it("rejects the removed temporary profile name", async () => {
    await expect(
      parseCapturePostEvidenceArgs([
        "--blogId",
        "mym0404",
        "--logNo",
        "223034929697",
        "--assetProfile",
        "temporary",
      ]),
    ).rejects.toThrow("--assetProfile readme|figure|tmp")
  })
})

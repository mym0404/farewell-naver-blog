import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { picgoCreateMock } = vi.hoisted(() => ({
  picgoCreateMock: vi.fn(),
}))

vi.mock("piclist", () => ({
  PicGo: {
    create: picgoCreateMock,
  },
}))

import { createPicListUploadProviderSource } from "../src/server/piclist-upload-provider-source.js"

const createRuntimeMock = () => ({
  helper: {
    uploader: {
      getIdList: () => ["github", "tcyun"],
      get: (id: string) => {
        if (id === "github") {
          return {
            name: "GitHub",
            config: () => [
              {
                name: "repo",
                alias: "Repository",
                required: true,
                message: "owner/repo",
              },
              {
                name: "token",
                alias: "Token",
                required: true,
              },
            ],
          }
        }

        if (id === "tcyun") {
          return {
            name: "Tencent COS",
            config: () => [
              {
                name: "secretId",
                alias: "Secret ID",
                required: true,
              },
              {
                name: "permission",
                alias: "Permission",
                type: "list",
                required: true,
                default: 0,
                choices: [
                  { name: "Public", value: 0 },
                  { name: "Private", value: 1 },
                ],
              },
              {
                name: "port",
                alias: "Port",
                default: 36677,
              },
              {
                name: "slim",
                alias: "Slim",
                type: "confirm",
                default: false,
              },
            ],
          }
        }

        return undefined
      },
    },
  },
})

describe("createPicListUploadProviderSource", () => {
  beforeEach(async () => {
    picgoCreateMock.mockReset()
    picgoCreateMock.mockReturnValue(createRuntimeMock())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("loads catalog from the piclist runtime and normalizes fields", async () => {
    const source = createPicListUploadProviderSource()
    const catalog = await source.getCatalog()
    const normalized = await source.normalizeProviderFields("tcyun", {
      secretId: "secret-id-123",
      permission: "1",
      port: "36677",
      slim: false,
    })

    expect(catalog.defaultProviderKey).toBe("github")
    expect(catalog.providers.map((provider) => provider.key)).toEqual(["github", "tcyun"])
    expect(catalog.providers[1]).toMatchObject({
      key: "tcyun",
      label: "Tencent COS",
      fields: [
        {
          key: "secretId",
          inputType: "password",
        },
        {
          key: "permission",
          inputType: "select",
          defaultValue: 0,
        },
        {
          key: "port",
          inputType: "number",
          defaultValue: 36677,
        },
        {
          key: "slim",
          inputType: "checkbox",
          defaultValue: false,
        },
      ],
    })
    expect(normalized).toEqual({
      secretId: "secret-id-123",
      permission: 1,
      port: 36677,
      slim: false,
    })
  })

  it("fails when the piclist runtime cannot be created", async () => {
    picgoCreateMock.mockImplementation(() => {
      throw new Error("runtime bootstrap failed")
    })

    const source = createPicListUploadProviderSource()

    await expect(source.getCatalog()).rejects.toThrow("runtime bootstrap failed")
  })
})

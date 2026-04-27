// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, within } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/ui/components/ui/Dialog.js"
import { Skeleton } from "../../src/ui/components/ui/Skeleton.js"
import { Toaster } from "../../src/ui/components/ui/Sonner.js"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/ui/components/ui/Tabs.js"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../src/ui/components/ui/ToggleGroup.js"

afterEach(() => {
  cleanup()
})

describe("ui primitives", () => {
  it("renders dialog primitives with close controls", async () => {
    const user = userEvent.setup()

    const { container } = render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <DialogClose asChild>
              <button type="button">Custom close</button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    )

    expect(screen.getByText("Dialog title")).toBeInTheDocument()
    expect(screen.getByText("Dialog description")).toBeInTheDocument()
    expect(container.querySelector('[data-slot="dialog-trigger"]')).toHaveAttribute(
      "data-slot",
      "dialog-trigger",
    )

    await user.click(screen.getByRole("button", { name: "Custom close" }))
  })

  it("renders dialog content without the default close button when requested", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>No close</DialogTitle>
            <DialogDescription>Dialog without close</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )

    const dialog = screen.getByRole("dialog")
    expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument()
  })

  it("renders skeleton, tabs, toggle group, and toaster defaults", async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn()
    const toasterElement = Toaster({
      duration: 1000,
    })

    render(
      <>
        <Skeleton className="w-10" data-testid="skeleton" />
        <Tabs defaultValue="preview">
          <TabsList variant="line">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">Preview panel</TabsContent>
          <TabsContent value="raw">Raw panel</TabsContent>
        </Tabs>
        <ToggleGroup value="preview" onValueChange={handleValueChange}>
          <ToggleGroupItem value="preview">Preview toggle</ToggleGroupItem>
          <ToggleGroupItem value="raw">Raw toggle</ToggleGroupItem>
        </ToggleGroup>
      </>,
    )

    expect(screen.getByTestId("skeleton")).toHaveAttribute("data-slot", "skeleton")
    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "line")
    expect(screen.getByRole("tabpanel", { name: "Preview" })).toHaveTextContent(
      "Preview panel",
    )
    expect(screen.getByRole("button", { name: "Preview toggle" })).toHaveAttribute(
      "data-state",
      "on",
    )

    await user.click(screen.getByRole("button", { name: "Raw toggle" }))
    expect(handleValueChange).toHaveBeenCalledWith("raw")

    expect(toasterElement.props.position).toBe("top-right")
    expect(toasterElement.props.closeButton).toBe(true)
    expect(toasterElement.props.expand).toBe(true)
    expect(toasterElement.props.richColors).toBe(true)
  })
})

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DetailRow } from "../DetailRow";

describe("DetailRow", () => {
  it("stacks on narrow viewports and stays horizontal from sm", () => {
    const { container } = render(
      <DetailRow label="Network">
        <span>Polygon</span>
      </DetailRow>,
    );
    const row = container.firstElementChild as HTMLElement;

    expect(row).toHaveClass("flex-col", "sm:flex-row", "sm:justify-between");
    expect(screen.getByText("Network")).toBeInTheDocument();
    expect(screen.getByText("Polygon")).toBeInTheDocument();
  });
});

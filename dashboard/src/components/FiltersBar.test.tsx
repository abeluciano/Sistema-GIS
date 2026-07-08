import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { FiltersBar } from "./FiltersBar";

describe("FiltersBar", () => {
  test("updates draft filters and applies them with the search button", () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();

    render(
      <FiltersBar
        categories={[{ id: 1, nombre: "robo", activo: true }]}
        zones={[]}
        filters={{}}
        onChange={onChange}
        onSearch={onSearch}
        onRefresh={vi.fn()}
        onExport={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "1" } });
    expect(onChange).toHaveBeenCalledWith({ categoria_id: "1" });

    fireEvent.click(screen.getByRole("button", { name: "Aplicar filtros" }));
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});

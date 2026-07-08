import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WelcomePage } from "./WelcomePage";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    loginWithGoogle: vi.fn()
  })
}));

describe("WelcomePage", () => {
  it("renders Google login action", () => {
    render(<WelcomePage />);
    expect(screen.getByText("Sistema GIS Ciudadano")).toBeInTheDocument();
    expect(screen.getByText("Loguearme con Google")).toBeInTheDocument();
  });
});

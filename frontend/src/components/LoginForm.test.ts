import { fireEvent, render, screen } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import LoginForm from "./LoginForm.vue";

const trigger = vi.fn();

vi.mock("web-haptics/vue", () => ({
  useWebHaptics: () => ({ trigger }),
}));

describe("LoginForm", () => {
  it("requiere ambas credenciales antes de consultar la API", async () => {
    const login = vi.spyOn(api, "login");
    render(LoginForm);

    await fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Escribe tu usuario y contraseña.");
    expect(login).not.toHaveBeenCalled();
  });

  it("emite success después de una sesión válida", async () => {
    vi.spyOn(api, "login").mockResolvedValue({ authenticated: true, username: "reviewer" });
    const view = render(LoginForm);
    await fireEvent.update(screen.getByLabelText("Usuario"), "reviewer");
    await fireEvent.update(screen.getByLabelText("Contraseña"), "secret-passphrase");

    await fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("button", { name: "Entrar" })).toBeEnabled();
    expect(view.emitted("success")).toHaveLength(1);
    expect(trigger).toHaveBeenCalledWith("success");
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import InterestForm from "./InterestForm.vue";

const trigger = vi.fn();

vi.mock("web-haptics/vue", () => ({
  useWebHaptics: () => ({ trigger }),
}));

function renderForm() {
  return render(InterestForm, {
    global: { stubs: { RouterLink: { template: "<a><slot /></a>" } } },
  });
}

async function fillValidForm() {
  await fireEvent.update(screen.getByLabelText("Nombre"), "Ana López");
  await fireEvent.update(screen.getByLabelText("Teléfono"), "33 1234 5678");
  await fireEvent.update(screen.getByLabelText("Correo electrónico"), "ana@example.com");
  await fireEvent.click(screen.getByLabelText(/Acepto el aviso de privacidad/));
}

describe("InterestForm", () => {
  beforeEach(() => trigger.mockClear());

  it("bloquea campos vacíos y señala el correo inválido", async () => {
    const createLead = vi.spyOn(api, "createLead");
    renderForm();

    await fireEvent.click(screen.getByRole("button", { name: /Enviar mis datos/ }));

    expect(await screen.findByText("Escribe tu nombre completo.")).toBeInTheDocument();
    expect(screen.getByText("Escribe un teléfono válido.")).toBeInTheDocument();
    expect(screen.getByText("Escribe un correo válido.")).toBeInTheDocument();
    expect(createLead).not.toHaveBeenCalled();
    expect(trigger).toHaveBeenCalledWith("error");
  });

  it("muestra carga y confirma el registro exitoso", async () => {
    let resolveRequest!: () => void;
    const createLead = vi.spyOn(api, "createLead").mockImplementation(
      () => new Promise((resolve) => {
        resolveRequest = () => resolve({ message: "Gracias, te contactaremos pronto" });
      }),
    );
    renderForm();
    await fillValidForm();

    await fireEvent.click(screen.getByRole("button", { name: /Enviar mis datos/ }));
    expect(screen.getByRole("button", { name: "Enviando…" })).toBeDisabled();

    resolveRequest();
    const confirmation = await screen.findByRole("status");
    expect(confirmation).toHaveTextContent("Gracias,");
    expect(confirmation).toHaveTextContent("te contactaremos pronto.");
    expect(createLead).toHaveBeenCalledWith({
      name: "Ana López",
      phone: "33 1234 5678",
      email: "ana@example.com",
      privacy_consent: true,
      website: "",
    });
    expect(trigger).toHaveBeenCalledWith("success");
  });

  it("presenta errores del servidor sin perder el formulario", async () => {
    vi.spyOn(api, "createLead").mockRejectedValue(new Error("network"));
    renderForm();
    await fillValidForm();
    await fireEvent.click(screen.getByRole("button", { name: /Enviar mis datos/ }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No pudimos enviar tus datos."));
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana López");
  });
});

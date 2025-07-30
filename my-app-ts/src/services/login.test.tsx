import { login } from "./login";

describe("login", () => {

    const mockAlert = jest.fn()
    window.alert = mockAlert

    it ("Retorna um alert de boas vindas", () => {
        login();
        expect(mockAlert).toHaveBeenCalledWith("Bem-vindo ao sistema!");
    });
})


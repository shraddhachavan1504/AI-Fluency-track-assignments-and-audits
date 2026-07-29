import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsForm from "./SettingsForm";

function fillValidForm(user, overrides = {}) {
  const data = {
    displayName: "Ada Lovelace",
    email: "ada@example.com",
    username: "ada_lovelace1",
    password: "Password1",
    confirmPassword: "Password1",
    ...overrides,
  };

  return data;
}

async function typeInto(user, labelText, value) {
  const input = screen.getByLabelText(labelText);
  await user.clear(input);
  if (value) await user.type(input, value);
  return input;
}

describe("SettingsForm", () => {
  it("1. shows all required-field errors on empty submit", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText(/display name is required/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/please confirm your password/i)
    ).toBeInTheDocument();

    // Focus should move to the first invalid field (Display name)
    expect(screen.getByLabelText(/display name/i)).toHaveFocus();

    // aria-invalid + aria-describedby wiring
    const displayNameInput = screen.getByLabelText(/display name/i);
    expect(displayNameInput).toHaveAttribute("aria-invalid", "true");
    expect(displayNameInput).toHaveAttribute(
      "aria-describedby",
      "displayName-error"
    );
    expect(document.getElementById("displayName-error")).toHaveTextContent(
      /display name is required/i
    );
  });

  it("2. rejects invalid email format", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const emailInput = await typeInto(user, /^email$/i, "not-an-email");
    await user.tab(); // blur

    expect(
      await screen.findByText(/enter a valid email address/i)
    ).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");

    // A different, untouched field should not show an error yet
    expect(screen.queryByText(/display name is required/i)).not.toBeInTheDocument();
  });

  it("3. rejects password without uppercase/number", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    const pwInput = screen.getByLabelText(/^password$/i);
    await user.type(pwInput, "lowercase");
    await user.tab();

    expect(
      await screen.findByText(/must contain an uppercase letter/i)
    ).toBeInTheDocument();

    await user.clear(pwInput);
    await user.type(pwInput, "UPPERCASE");
    await user.tab();

    expect(
      await screen.findByText(/must contain a number/i)
    ).toBeInTheDocument();

    await user.clear(pwInput);
    await user.type(pwInput, "short1A");
    await user.tab();

    expect(
      await screen.findByText(/at least 8 characters/i)
    ).toBeInTheDocument();
  });

  it("4. rejects mismatched confirm-password", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    await typeInto(user, /^password$/i, "Password1");
    await typeInto(user, /confirm password/i, "Password2");
    await user.tab();

    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument();
  });

  it("5. submits successfully with valid input", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<SettingsForm onSubmit={handleSubmit} />);

    const data = fillValidForm(user);
    await typeInto(user, /display name/i, data.displayName);
    await typeInto(user, /^email$/i, data.email);
    await typeInto(user, /username/i, data.username);
    await typeInto(user, /^password$/i, data.password);
    await typeInto(user, /confirm password/i, data.confirmPassword);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: data.displayName,
        email: data.email,
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
        productUpdates: true,
        marketingEmails: false,
      })
    );

    // No error messages present
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /saved/i })
    ).toBeInTheDocument();
  });
});

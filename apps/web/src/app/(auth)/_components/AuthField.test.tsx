import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AuthField } from "./AuthField";

describe("AuthField", () => {
  it("associates the label with the input and emits typed values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AuthField
        id="email"
        label="Email"
        type="email"
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("type", "email");
    await user.type(input, "a");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("masks a password field and toggles visibility via the reveal button", async () => {
    const user = userEvent.setup();
    render(
      <AuthField id="pw" label="Password" type="password" value="secret" onChange={() => {}} />
    );

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders a label addon and child hint content", () => {
    render(
      <AuthField
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        labelRight={<a href="/forgot">Forgot password?</a>}
      >
        <p>Helper hint</p>
      </AuthField>
    );

    expect(screen.getByRole("link", { name: "Forgot password?" })).toBeInTheDocument();
    expect(screen.getByText("Helper hint")).toBeInTheDocument();
  });

  it("does not render a reveal toggle for non-password fields", () => {
    render(<AuthField id="email" label="Email" value="" onChange={() => {}} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

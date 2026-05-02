import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders IoT Print shell", () => {
  render(<App />);
  expect(screen.getByText(/IoT Print/i)).toBeInTheDocument();
});

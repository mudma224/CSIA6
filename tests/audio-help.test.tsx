import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioHelp } from "@/components/audio/AudioHelp";

const playMock = vi.fn().mockResolvedValue(undefined);
const pauseMock = vi.fn();

beforeEach(() => {
  playMock.mockClear();
  pauseMock.mockClear();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(playMock);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pauseMock);
});

describe("audio help", () => {
  it("keeps text visible when no real file is approved", () => {
    render(<AudioHelp locale="en" topic="onboarding" text="Visible transcript" firstVisit />);
    expect(screen.getByText("Visible transcript")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No reviewed recording");
    expect(screen.queryByRole("button", { name: "Play audio" })).not.toBeInTheDocument();
    expect(playMock).not.toHaveBeenCalled();
  });

  it("never autoplays and provides play, pause, replay, error fallback", async () => {
    render(<AudioHelp locale="en" topic="onboarding" text="Visible transcript" testSource="/test-only.mp3" firstVisit />);
    expect(playMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Play audio" }));
    await waitFor(() => expect(playMock).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByRole("button", { name: "Pause audio" }));
    expect(pauseMock).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Replay audio" }));
    expect(playMock).toHaveBeenCalledTimes(2);
    fireEvent.error(screen.getByTestId("audio-element"));
    expect(screen.getByRole("alert")).toHaveTextContent("Audio could not play");
    expect(screen.getByText("Visible transcript")).toBeInTheDocument();
  });
});

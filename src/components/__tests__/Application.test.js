import React from "react";

import axios from "axios";

import {
  render,
  cleanup,
  waitForElement,
  fireEvent,
  getByText,
  getAllByTestId,
  getByAltText,
  getByPlaceholderText,
  queryByText,
  queryByAltText,
  prettyDOM,
} from "@testing-library/react";

import Application from "components/Application";
import DayListItem from "components/DayListItem";

afterEach(cleanup);

describe("Application", () => {
  it("defaults to Monday and changes the schedule when a new day is selected", () => {
    const { getByText } = render(<Application />);

    return waitForElement(() => getByText("Monday")).then(() => {
      fireEvent.click(getByText("Tuesday"));
      expect(getByText("Leopold Silvers")).toBeInTheDocument();
    });
  });

  it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
    const { container, debug } = render(<Application />);

    await waitForElement(() => getByText(container, "Archie Cohen"));
    // console.log(prettyDOM(container));

    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    fireEvent.click(getByText(appointment, "Save"));

    //Debug method from render
    // debug();

    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await waitForElement(() => queryByText(appointment, "Lydia Miller-Jones"));

    // console.log(prettyDOM(appointment));

    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "no spots remaining")).toBeInTheDocument();

    // console.log(prettyDOM(day));
  });

  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    // 1. Render the Application.
    const { container, debug } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));

    // 3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(queryByAltText(appointment, "Delete"));

    // 4. Check that the confirmation message is shown.
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();

    // 5. Click the "Confirm" button on the confirmation.
    fireEvent.click(getByText(appointment, "Confirm"));

    // 6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    // 7. Wait until the element with the "Add" button is displayed.
    await waitForElement(() => queryByAltText(appointment, "Add"));

    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();

    // debug();
  });

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    // 1. Render the Application.
    const { container, debug } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed - find an interview
    await waitForElement(() => getByText(container, "Archie Cohen"));

    // 3. Click the "Edit" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(queryByAltText(appointment, "Edit"));

    // 4. Change the name for the appointment
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });

    // 5. Click the "save" button
    fireEvent.click(getByText(appointment, "Save"));

    // 6. Check that the element with the text "Saving" is displayed and check appointment name
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await waitForElement(() => queryByText(appointment, "Lydia Miller-Jones"));

    // 7. Check that the DayListItem with the text "Monday" also has the same spots remaining.
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();

    // debug();
  });

  it("shows the save error when failing to save an appointment", async () => {
    axios.put.mockRejectedValueOnce("Save");

    // 1. Render the Application.
    const { container, debug } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed - find an interview
    await waitForElement(() => getByText(container, "Archie Cohen"));

    //3. Grab appointment element with archie cohen
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    //4.  Edit or Add appointment
    fireEvent.click(getByAltText(appointment, "Edit"));

    //5. Add name & interviewer
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));

    //6. Save
    fireEvent.click(getByText(appointment, "Save"));

    //7. Check for notification
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    //8. Verify Error
    await waitForElement(() =>
      getByText(appointment, "Could not book appointment.")
    );

    //debug();
  });

  it("shows the delete error when failing to delete an existing appointment", async () => {
    axios.delete.mockRejectedValueOnce("Delete");

    // 1. Render the Application.
    const { container, debug } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed - find an interview
    await waitForElement(() => getByText(container, "Archie Cohen"));

    //3. Grab appointment element with archie cohen
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    //4. Delete appointment
    fireEvent.click(getByAltText(appointment, "Delete"));

    //5. Confirm
    fireEvent.click(getByText(appointment, "Confirm"));

    //7. Check for notification
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    //8. Verify Error
    await waitForElement(() =>
      getByText(appointment, "Could not cancel appointment.")
    );


    //debug()
  });
});

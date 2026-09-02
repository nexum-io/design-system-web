import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { DatePicker, type DatePickerProps } from "../primitives/date-picker";

const meta: Meta<typeof DatePicker> = {
  title: "Primitives/DatePicker",
  component: DatePicker,
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

function DatePickerDemo(props: Omit<DatePickerProps, "value" | "onChange"> & { initialValue?: string }) {
  const { initialValue, ...rest } = props;
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div className="w-72">
      <DatePicker {...rest} value={value} onChange={setValue} />
    </div>
  );
}

export const English: Story = {
  render: () => (
    <DatePickerDemo locale="en" placeholder="Pick a date" initialValue="2026-09-02" />
  ),
};

export const Russian: Story = {
  render: () => (
    <DatePickerDemo locale="ru" placeholder="Выберите дату" initialValue="2026-09-02" />
  ),
};

export const WithMinDate: Story = {
  render: () => (
    <DatePickerDemo
      locale="en"
      placeholder="Execution deadline"
      min="2026-09-10"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <DatePickerDemo locale="en" placeholder="Pick a date" initialValue="2026-09-02" disabled />
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { DateTimePicker, type DateTimePickerProps } from "../primitives/date-time-picker";

const meta: Meta<typeof DateTimePicker> = {
  title: "Primitives/DateTimePicker",
  component: DateTimePicker,
};
export default meta;

type Story = StoryObj<typeof DateTimePicker>;

function DateTimePickerDemo(
  props: Omit<DateTimePickerProps, "value" | "onChange"> & { initialValue?: string },
) {
  const { initialValue, ...rest } = props;
  const [value, setValue] = React.useState(initialValue ?? "");

  return (
    <div className="w-96">
      <DateTimePicker {...rest} value={value} onChange={setValue} />
    </div>
  );
}

export const English: Story = {
  render: () => (
    <DateTimePickerDemo
      locale="en"
      placeholder="Select date and time"
      initialValue="2026-09-02T14:30"
    />
  ),
};

export const Russian: Story = {
  render: () => (
    <DateTimePickerDemo
      locale="ru"
      placeholder="Выберите дату и время"
      initialValue="2026-09-02T14:30"
    />
  ),
};

export const Empty: Story = {
  render: () => <DateTimePickerDemo locale="en" placeholder="Select date and time" />,
};

export const WithMinDate: Story = {
  render: () => (
    <DateTimePickerDemo
      locale="en"
      placeholder="Execution deadline"
      min="2026-09-10"
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <DateTimePickerDemo
      locale="en"
      placeholder="Select date and time"
      initialValue="2026-09-02T14:30"
      disabled
    />
  ),
};

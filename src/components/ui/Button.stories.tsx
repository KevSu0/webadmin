import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'reward'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    size: 'default',
    children: 'Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'default',
    children: 'Button',
  },
};

export const Secondary: Story = {
    args: {
      variant: 'secondary',
      size: 'default',
      children: 'Button',
    },
  };

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        size: 'default',
        children: 'Button',
    },
};

export const Link: Story = {
    args: {
        variant: 'link',
        size: 'default',
        children: 'Button',
    },
};

export const Reward: Story = {
    args: {
        variant: 'reward',
        size: 'default',
        children: 'Button',
    },
};

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from '../../../src/client/components/SearchBar';

describe('SearchBar', () => {
  it('should render the search input', () => {
    render(<SearchBar value="" onChange={jest.fn()} resultCount={0} />);

    const input = screen.getByRole('textbox', { name: /search repositories/i });
    expect(input).toBeInTheDocument();
  });

  it('should display the current value', () => {
    render(<SearchBar value="pytorch" onChange={jest.fn()} resultCount={0} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('pytorch');
  });

  it('should call onChange when input value changes', () => {
    const handleChange = jest.fn();
    render(<SearchBar value="" onChange={handleChange} resultCount={0} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'tensorflow' } });

    expect(handleChange).toHaveBeenCalledWith('tensorflow');
  });

  it('should display result count with plural "results"', () => {
    render(<SearchBar value="" onChange={jest.fn()} resultCount={42} />);

    expect(screen.getByText('42 results')).toBeInTheDocument();
  });

  it('should display singular "result" for count of 1', () => {
    render(<SearchBar value="" onChange={jest.fn()} resultCount={1} />);

    expect(screen.getByText('1 result')).toBeInTheDocument();
  });

  it('should display "0 results" for count of 0', () => {
    render(<SearchBar value="" onChange={jest.fn()} resultCount={0} />);

    expect(screen.getByText('0 results')).toBeInTheDocument();
  });

  it('should have placeholder text', () => {
    render(<SearchBar value="" onChange={jest.fn()} resultCount={0} />);

    const input = screen.getByPlaceholderText('Search repositories...');
    expect(input).toBeInTheDocument();
  });

  it('should have an aria-label on the input', () => {
    render(<SearchBar value="" onChange={jest.fn()} resultCount={0} />);

    const input = screen.getByLabelText('Search repositories');
    expect(input).toBeInTheDocument();
  });
});

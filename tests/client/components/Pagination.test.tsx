import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Pagination } from '../../../src/client/components/Pagination';

describe('Pagination', () => {
  it('should render page info', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />
    );

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('should render Previous and Next buttons', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should disable Previous button on page 1', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should enable Previous button when not on page 1', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).not.toBeDisabled();
  });

  it('should disable Next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should enable Next button when not on last page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('should call onPageChange with previous page when Previous is clicked', () => {
    const handleChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={handleChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));

    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with next page when Next is clicked', () => {
    const handleChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={handleChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('should render nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('should render nothing when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={jest.fn()} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('should have aria-label on the nav element', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />
    );

    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });
});

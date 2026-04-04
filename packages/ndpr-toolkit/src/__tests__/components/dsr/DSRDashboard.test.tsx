import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DSRDashboard } from '../../../components/dsr/DSRDashboard';
import { DSRRequest } from '../../../types/dsr';

describe('DSRDashboard (NDPA Data Subject Request Management)', () => {
  const mockRequests: DSRRequest[] = [
    {
      id: '1',
      type: 'access',
      status: 'pending',
      createdAt: 1620000000000,
      updatedAt: 1620000000000,
      subject: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890'
      },
      description: 'I want to access my data'
    },
    {
      id: '2',
      type: 'erasure',
      status: 'inProgress',
      createdAt: 1620100000000,
      updatedAt: 1620100000000,
      subject: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    },
    {
      id: '3',
      type: 'rectification',
      status: 'completed',
      createdAt: 1620200000000,
      updatedAt: 1620300000000,
      completedAt: 1620300000000,
      subject: {
        name: 'Bob Johnson',
        email: 'bob@example.com'
      },
      description: 'Please correct my address'
    }
  ];

  const mockUpdateRequest = jest.fn();
  const mockDeleteRequest = jest.fn();

  beforeEach(() => {
    mockUpdateRequest.mockClear();
    mockDeleteRequest.mockClear();
  });

  it('renders the dashboard with requests', () => {
    render(
      <DSRDashboard
        requests={mockRequests}
        onUpdateStatus={mockUpdateRequest}
        onSelectRequest={mockDeleteRequest}
      />
    );
    
    // Check that the dashboard title is rendered
    expect(screen.getByText(/Data Subject Request Dashboard/i)).toBeInTheDocument();
    
    // Check that the dashboard has the correct structure
    const dashboard = document.querySelector('.grid');
    expect(dashboard).not.toBeNull();
    
    // Check that DSR Requests section is rendered
    expect(screen.getByText(/DSR Requests/i)).toBeInTheDocument();
    
    // Check that there are request elements in the dashboard
    const requestElements = document.querySelectorAll('.rounded-md.cursor-pointer');
    expect(requestElements.length).toBeGreaterThan(0);
  });

  it('renders the dashboard with filter controls', () => {
    render(
      <DSRDashboard
        requests={mockRequests}
        onUpdateStatus={mockUpdateRequest}
        onSelectRequest={mockDeleteRequest}
      />
    );
    
    // Check that the dashboard title is rendered
    expect(screen.getByText(/Data Subject Request Dashboard/i)).toBeInTheDocument();
    
    // Check that filter controls are rendered by looking for select elements
    const selectElements = screen.getAllByRole('combobox');
    expect(selectElements.length).toBeGreaterThan(0);
    
    // Check that tHere&apos;s a search input
    const searchInput = screen.getByPlaceholderText(/Search requests/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders with sort controls', () => {
    render(
      <DSRDashboard
        requests={mockRequests}
        onUpdateStatus={mockUpdateRequest}
        onSelectRequest={mockDeleteRequest}
      />
    );
    
    // Check that sort options are rendered
    const sortBySelect = screen.getByLabelText(/Sort By/i);
    expect(sortBySelect).toBeInTheDocument();
    
    // Check that the sort dropdown exists
    expect(sortBySelect.tagName.toLowerCase()).toBe('select');
    
    // Check that at least one option exists
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('renders with search functionality', () => {
    render(
      <DSRDashboard
        requests={mockRequests}
        onUpdateStatus={mockUpdateRequest}
        onSelectRequest={mockDeleteRequest}
      />
    );
    
    // Check that search input is rendered
    const searchInput = screen.getByPlaceholderText(/Search requests/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders with request list section', () => {
    render(
      <DSRDashboard
        requests={mockRequests}
        onUpdateStatus={mockUpdateRequest}
        onSelectRequest={mockDeleteRequest}
      />
    );
    
    // Check that the DSR Requests section is rendered
    expect(screen.getByText(/DSR Requests/i)).toBeInTheDocument();
    
    // Check that the dashboard has the correct structure
    const dashboard = document.querySelector('.grid');
    expect(dashboard).not.toBeNull();
  });

  it('renders with the correct title and description', () => {
    const customTitle = 'Custom DSR Dashboard Title';
    const customDescription = 'Custom description for testing';
    
    render(
      <DSRDashboard
        requests={mockRequests}
        onUpdateStatus={mockUpdateRequest}
        onSelectRequest={mockDeleteRequest}
        title={customTitle}
        description={customDescription}
      />
    );
    
    // Check that custom title and description are rendered
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });

  it('handles empty requests array', () => {
    render(
      <DSRDashboard
        requests={[]}
        onUpdateStatus={mockUpdateRequest}
        onSelectRequest={mockDeleteRequest}
      />
    );
    
    expect(screen.getByText(/No data subject requests found/i)).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const customClassName = 'custom-dashboard-class';
    
    render(
      <DSRDashboard
        requests={mockRequests}
        onUpdateStatus={mockUpdateRequest}
        onSelectRequest={mockDeleteRequest}
        className={customClassName}
      />
    );
    
    // Check that the custom class is applied to the component
    const dashboardElement = document.querySelector(`.${customClassName}`);
    expect(dashboardElement).toBeInTheDocument();
  });
});

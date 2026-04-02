import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Kigali EMS Dashboard UI Tests', () => {
  
  test('renders EULA gatekeeper on initial load', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /EULA and Privacy Policy/i })).toBeInTheDocument();
  });

  test('EULA accept button is visible and clickable', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /I Acknowledge and Accept/i });
    expect(button).toBeInTheDocument();
  });

  test('accepting EULA grants access to main dashboard', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
    expect(screen.getByText(/Emergency Services Dispatch & Traffic UI/i)).toBeInTheDocument();
  });

  const navItems = [
    'Live Operations', 'Incidents', 'Fleet', 
    'Hospitals', 'Traffic / Green Wave', 'Analytics', 'Scenario Control'
  ];

  navItems.forEach(item => {
    test(`navigation sidebar renders ${item} tab`, () => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
      const elements = screen.getAllByText(item);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('defaults to Live Operations view', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
    expect(screen.getByText(/Live KPIs/i)).toBeInTheDocument();
  });

  test('switches to Analytics view on click', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
    fireEvent.click(screen.getAllByText('Analytics')[0]);
    expect(screen.getByText(/Analytics & Benchmarking/i)).toBeInTheDocument();
  });

  test('switches to Fleet view on click', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
    fireEvent.click(screen.getAllByText('Fleet')[0]);
    expect(screen.getByText(/Fleet Status/i)).toBeInTheDocument();
  });

  test('switches to Hospitals view on click', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
    fireEvent.click(screen.getAllByText('Hospitals')[0]);
    expect(screen.getByText(/Overload Monitoring/i)).toBeInTheDocument();
  });

  test('renders under-construction fallback for Scenario Control', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
    fireEvent.click(screen.getAllByText('Scenario Control')[0]);
    expect(screen.getByText(/Component under construction/i)).toBeInTheDocument();
  });

  test('Live operations renders fallback when no incidents exist', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
    expect(screen.getByText(/No incidents match your current filters/i)).toBeInTheDocument();
  });

  test('Analytics view renders fallback static data correctly', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
    fireEvent.click(screen.getAllByText('Analytics')[0]);
    expect(screen.getByText(/Incidents Resolved/i)).toBeInTheDocument();
  });
});